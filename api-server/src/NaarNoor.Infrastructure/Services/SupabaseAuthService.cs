using Microsoft.Extensions.Logging;
using NaarNoor.Application.Common.Interfaces;
using System.Text;
using System.Text.Json;

namespace NaarNoor.Infrastructure.Services;

/// <summary>
/// Implements Supabase Authentication Service using REST API
/// Provides user authentication, registration, and token verification
/// </summary>
public class SupabaseAuthService : ISupabaseAuthService
{
    private readonly HttpClient _httpClient;
    private readonly SupabaseConfig _config;
    private readonly ILogger<SupabaseAuthService> _logger;

    public SupabaseAuthService(HttpClient httpClient, SupabaseConfig config, ILogger<SupabaseAuthService> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _logger = logger;
    }

    private string GetAuthUrl() => $"{_config.Url}/auth/v1";

    public async Task<(bool Success, string? UserId, string? Error)> RegisterUserAsync(string email, string password)
    {
        try
        {
            _logger.LogInformation("Registering user with email: {Email}", email);
            
            var request = new { email, password };
            var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PostAsync($"{GetAuthUrl()}/signup", content);
            
            if (!response.IsSuccessStatusCode)
                return (false, null, await response.Content.ReadAsStringAsync());

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            
            if (root.TryGetProperty("user", out var user) && user.TryGetProperty("id", out var id))
            {
                _logger.LogInformation("User registered successfully with ID: {UserId}", id);
                return (true, id.GetString(), null);
            }

            return (false, null, "Registration failed: No user ID returned");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering user with email: {Email}", email);
            return (false, null, ex.Message);
        }
    }

    public async Task<(bool Success, string? SessionToken, string? Error)> LoginUserAsync(string email, string password)
    {
        try
        {
            _logger.LogInformation("Logging in user with email: {Email}", email);
            
            var request = new { email, password };
            var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PostAsync($"{GetAuthUrl()}/token?grant_type=password", content);
            
            if (!response.IsSuccessStatusCode)
                return (false, null, await response.Content.ReadAsStringAsync());

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            
            if (root.TryGetProperty("access_token", out var token))
            {
                _logger.LogInformation("User logged in successfully: {Email}", email);
                return (true, token.GetString(), null);
            }

            return (false, null, "Login failed: No session token returned");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging in user with email: {Email}", email);
            return (false, null, ex.Message);
        }
    }

    public async Task<(bool Success, string? Error)> LogoutUserAsync(string userId)
    {
        try
        {
            _logger.LogInformation("Logging out user: {UserId}", userId);
            
            var request = new HttpRequestMessage(HttpMethod.Post, $"{GetAuthUrl()}/logout");
            request.Headers.Add("Authorization", $"Bearer {_config.AnonKey}");
            
            var response = await _httpClient.SendAsync(request);
            
            if (!response.IsSuccessStatusCode)
                return (false, await response.Content.ReadAsStringAsync());

            _logger.LogInformation("User logged out successfully: {UserId}", userId);
            return (true, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging out user: {UserId}", userId);
            return (false, ex.Message);
        }
    }

    public async Task<(bool Valid, string? UserId, string? Error)> VerifyTokenAsync(string token)
    {
        try
        {
            _logger.LogInformation("Verifying JWT token");
            
            var request = new HttpRequestMessage(HttpMethod.Get, $"{GetAuthUrl()}/user");
            request.Headers.Add("Authorization", $"Bearer {token}");
            
            var response = await _httpClient.SendAsync(request);
            
            if (!response.IsSuccessStatusCode)
                return (false, null, "Invalid token");

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            
            if (root.TryGetProperty("id", out var id))
            {
                _logger.LogInformation("Token verified for user: {UserId}", id);
                return (true, id.GetString(), null);
            }

            return (false, null, "Invalid token: No user found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying token");
            return (false, null, ex.Message);
        }
    }

    public async Task<(bool Success, string? UserId, string? Email, string? Error)> GetCurrentUserAsync(string token)
    {
        try
        {
            _logger.LogInformation("Getting current user from token");
            
            var request = new HttpRequestMessage(HttpMethod.Get, $"{GetAuthUrl()}/user");
            request.Headers.Add("Authorization", $"Bearer {token}");
            
            var response = await _httpClient.SendAsync(request);
            
            if (!response.IsSuccessStatusCode)
                return (false, null, null, "Failed to get current user");

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            
            if (root.TryGetProperty("id", out var id) && root.TryGetProperty("email", out var email))
            {
                _logger.LogInformation("Current user retrieved: {UserId}", id);
                return (true, id.GetString(), email.GetString(), null);
            }

            return (false, null, null, "Failed to get current user");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user");
            return (false, null, null, ex.Message);
        }
    }

    public async Task<(bool Success, string? Error)> UpdateUserEmailAsync(string userId, string newEmail)
    {
        try
        {
            _logger.LogInformation("Updating user email for user: {UserId}", userId);
            
            var request = new { email = newEmail };
            var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");
            
            var httpRequest = new HttpRequestMessage(HttpMethod.Put, $"{GetAuthUrl()}/user");
            httpRequest.Headers.Add("Authorization", $"Bearer {_config.ServiceRoleKey}");
            httpRequest.Content = content;
            
            var response = await _httpClient.SendAsync(httpRequest);
            
            if (!response.IsSuccessStatusCode)
                return (false, await response.Content.ReadAsStringAsync());

            _logger.LogInformation("User email updated successfully for user: {UserId}", userId);
            return (true, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user email for user: {UserId}", userId);
            return (false, ex.Message);
        }
    }

    public async Task<(bool Success, string? Error)> UpdateUserPasswordAsync(string userId, string newPassword)
    {
        try
        {
            _logger.LogInformation("Updating user password for user: {UserId}", userId);
            
            var request = new { password = newPassword };
            var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");
            
            var httpRequest = new HttpRequestMessage(HttpMethod.Put, $"{GetAuthUrl()}/user");
            httpRequest.Headers.Add("Authorization", $"Bearer {_config.ServiceRoleKey}");
            httpRequest.Content = content;
            
            var response = await _httpClient.SendAsync(httpRequest);
            
            if (!response.IsSuccessStatusCode)
                return (false, await response.Content.ReadAsStringAsync());

            _logger.LogInformation("User password updated successfully for user: {UserId}", userId);
            return (true, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user password for user: {UserId}", userId);
            return (false, ex.Message);
        }
    }

    public async Task<(bool Success, string? Error)> ResetPasswordAsync(string email)
    {
        try
        {
            _logger.LogInformation("Initiating password reset for email: {Email}", email);
            
            var request = new { email };
            var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PostAsync($"{GetAuthUrl()}/recover", content);
            
            if (!response.IsSuccessStatusCode)
                return (false, await response.Content.ReadAsStringAsync());

            _logger.LogInformation("Password reset email sent to: {Email}", email);
            return (true, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password for email: {Email}", email);
            return (false, ex.Message);
        }
    }
}
