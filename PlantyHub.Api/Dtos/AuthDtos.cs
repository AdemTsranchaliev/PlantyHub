namespace PlantyHub.Api.Dtos;

public record AuthResponse(string Token, string Email, string Name, IReadOnlyList<string> Roles);

public record RegisterResponse(string Message, string Email, bool RequiresEmailVerification);

public record MessageResponse(string Message);

public record RegisterRequest(string Name, string Email, string Password);

public record LoginRequest(string Email, string Password, bool RememberMe = false);

public record AdminLoginRequest(string Email, string Password);

public record ForgotPasswordRequest(string Email);

public record ResetPasswordRequest(string Email, string Token, string NewPassword);

public record VerifyEmailRequest(string UserId, string Token);

public record ResendVerificationRequest(string Email);
