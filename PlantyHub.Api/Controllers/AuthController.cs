using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using PlantyHub.Api.Data;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Models;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    JwtTokenService tokenService,
    AuthEmailService authEmail,
    IOptions<JwtSettings> jwtOptions) : ControllerBase
{
    private const int RememberMeExpiryMinutes = 60 * 24 * 30;

    [HttpPost("register")]
    public async Task<ActionResult<RegisterResponse>> Register(RegisterRequest request, CancellationToken ct)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var existing = await userManager.FindByEmailAsync(email);
        if (existing is not null)
            return Conflict(new { message = "Email already registered." });

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = request.Name.Trim(),
            EmailConfirmed = false
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join(", ", result.Errors.Select(e => e.Description)) });

        await userManager.AddToRoleAsync(user, DbSeeder.CustomerRole);
        await authEmail.SendVerificationEmailAsync(user, ct);

        return Ok(new RegisterResponse(
            "Account created. Please check your email to verify your account before signing in.",
            email,
            true));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
            return Unauthorized(new { message = "Invalid email or password." });

        var result = await signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
            return Unauthorized(new { message = "Invalid email or password." });

        if (!user.EmailConfirmed)
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                message = "Please verify your email before signing in.",
                code = "email_not_verified",
                email
            });

        var roles = await userManager.GetRolesAsync(user);
        var expiryMinutes = request.RememberMe ? RememberMeExpiryMinutes : jwtOptions.Value.ExpiryMinutes;
        var token = tokenService.CreateToken(user, roles, expiryMinutes);

        return Ok(new AuthResponse(token, email, user.FullName ?? email, roles.ToList()));
    }

    [HttpPost("admin/login")]
    public async Task<ActionResult<AuthResponse>> AdminLogin(AdminLoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await userManager.FindByEmailAsync(email);
        if (user is null || !await userManager.IsInRoleAsync(user, DbSeeder.AdminRole))
            return Unauthorized(new { message = "Invalid admin credentials." });

        var result = await signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
            return Unauthorized(new { message = "Invalid admin credentials." });

        var roles = await userManager.GetRolesAsync(user);
        var token = tokenService.CreateToken(user, roles);

        return Ok(new AuthResponse(token, email, user.FullName ?? email, roles.ToList()));
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult<MessageResponse>> ForgotPassword(ForgotPasswordRequest request, CancellationToken ct)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await userManager.FindByEmailAsync(email);
        if (user is not null)
            await authEmail.SendPasswordResetEmailAsync(user, ct);

        return Ok(new MessageResponse("If an account exists for this email, a password reset link has been sent."));
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<MessageResponse>> ResetPassword(ResetPasswordRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
            return BadRequest(new { message = "Invalid reset link." });

        var result = await userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join(", ", result.Errors.Select(e => e.Description)) });

        return Ok(new MessageResponse("Password updated. You can now sign in."));
    }

    [HttpPost("verify-email")]
    public async Task<ActionResult<MessageResponse>> VerifyEmail(VerifyEmailRequest request)
    {
        var user = await userManager.FindByIdAsync(request.UserId);
        if (user is null)
            return BadRequest(new { message = "Invalid verification link." });

        if (user.EmailConfirmed)
            return Ok(new MessageResponse("Email already verified. You can sign in."));

        var result = await userManager.ConfirmEmailAsync(user, request.Token);
        if (!result.Succeeded)
            return BadRequest(new { message = "Invalid or expired verification link." });

        return Ok(new MessageResponse("Email verified successfully. You can now sign in."));
    }

    [HttpPost("resend-verification")]
    public async Task<ActionResult<MessageResponse>> ResendVerification(ResendVerificationRequest request, CancellationToken ct)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await userManager.FindByEmailAsync(email);
        if (user is null || user.EmailConfirmed)
            return Ok(new MessageResponse("If an unverified account exists, a verification email has been sent."));

        await authEmail.SendVerificationEmailAsync(user, ct);
        return Ok(new MessageResponse("If an unverified account exists, a verification email has been sent."));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<object>> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var user = await userManager.FindByIdAsync(userId);
        if (user is null) return NotFound();

        var roles = await userManager.GetRolesAsync(user);
        return Ok(new
        {
            email = user.Email,
            name = user.FullName,
            roles,
            emailConfirmed = user.EmailConfirmed
        });
    }
}
