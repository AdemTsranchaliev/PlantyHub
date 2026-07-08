using Microsoft.AspNetCore.Identity;

namespace PlantyHub.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }
    public CountryCode? Country { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
