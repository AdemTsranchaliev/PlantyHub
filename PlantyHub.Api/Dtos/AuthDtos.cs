namespace PlantyHub.Api.Dtos;

public record AuthResponse(string Token, string Email, string Name, IReadOnlyList<string> Roles);

public record RegisterRequest(string Name, string Email, string Password);

public record LoginRequest(string Email, string Password);

public record AdminLoginRequest(string Email, string Password);
