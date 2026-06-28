namespace NaarNoor.Application.Common.Interfaces;

/// <summary>
/// Supabase Authentication Service Interface
/// Manages user authentication, registration, and JWT token handling
/// </summary>
public interface ISupabaseAuthService
{
    /// <summary>
    /// Register a new user
    /// </summary>
    Task<(bool Success, string? UserId, string? Error)> RegisterUserAsync(string email, string password);

    /// <summary>
    /// Login user and return session token
    /// </summary>
    Task<(bool Success, string? SessionToken, string? Error)> LoginUserAsync(string email, string password);

    /// <summary>
    /// Logout user
    /// </summary>
    Task<(bool Success, string? Error)> LogoutUserAsync(string userId);

    /// <summary>
    /// Verify JWT token
    /// </summary>
    Task<(bool Valid, string? UserId, string? Error)> VerifyTokenAsync(string token);

    /// <summary>
    /// Get current user session
    /// </summary>
    Task<(bool Success, string? UserId, string? Email, string? Error)> GetCurrentUserAsync(string token);

    /// <summary>
    /// Update user email
    /// </summary>
    Task<(bool Success, string? Error)> UpdateUserEmailAsync(string userId, string newEmail);

    /// <summary>
    /// Update user password
    /// </summary>
    Task<(bool Success, string? Error)> UpdateUserPasswordAsync(string userId, string newPassword);

    /// <summary>
    /// Reset password with email link
    /// </summary>
    Task<(bool Success, string? Error)> ResetPasswordAsync(string email);
}
