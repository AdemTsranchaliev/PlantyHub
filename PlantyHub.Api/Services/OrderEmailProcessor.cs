using System.Threading.Channels;
using Microsoft.EntityFrameworkCore;
using PlantyHub.Api.Data;

namespace PlantyHub.Api.Services;

public enum OrderEmailKind
{
    Checkout,
    Status,
}

public interface IOrderEmailQueue
{
    void EnqueueCheckout(string orderId);
    void EnqueueStatus(string orderId);
}

/// <summary>
/// Sends order mail after the HTTP request has returned, so checkout does not wait on SMTP.
/// </summary>
public sealed class OrderEmailProcessor(
    IServiceScopeFactory scopes,
    ILogger<OrderEmailProcessor> logger) : BackgroundService, IOrderEmailQueue
{
    readonly Channel<OrderEmailJob> _channel = Channel.CreateUnbounded<OrderEmailJob>(new UnboundedChannelOptions
    {
        SingleReader = true,
    });

    public void EnqueueCheckout(string orderId) => Enqueue(orderId, OrderEmailKind.Checkout);

    public void EnqueueStatus(string orderId) => Enqueue(orderId, OrderEmailKind.Status);

    void Enqueue(string orderId, OrderEmailKind kind)
    {
        if (string.IsNullOrWhiteSpace(orderId)) return;
        if (!_channel.Writer.TryWrite(new OrderEmailJob(orderId, kind)))
            logger.LogWarning("Order email for {OrderId} ({Kind}) was not queued", orderId, kind);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var job in _channel.Reader.ReadAllAsync(stoppingToken))
        {
            try
            {
                await SendAsync(job, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Background email for order {OrderId} ({Kind}) failed", job.OrderId, job.Kind);
            }
        }
    }

    async Task SendAsync(OrderEmailJob job, CancellationToken ct)
    {
        await using var scope = scopes.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var emails = scope.ServiceProvider.GetRequiredService<OrderEmailService>();
        var order = await db.Orders
            .Include(o => o.Items)
            .Include(o => o.Waybills)
            .FirstOrDefaultAsync(o => o.Id == job.OrderId, ct);
        if (order is null)
        {
            logger.LogWarning("Order {OrderId} was not found for a background email", job.OrderId);
            return;
        }

        if (job.Kind == OrderEmailKind.Checkout)
            await emails.TrySendCheckoutAsync(order, ct);
        else
            await emails.TrySendStatusAsync(order, ct);
    }

    readonly record struct OrderEmailJob(string OrderId, OrderEmailKind Kind);
}
