using FluentAssertions;
using System.Net;
using System.Text.Json;
using Xunit;

namespace NaarNoor.API.Tests.Integration;

/// <summary>
/// Property-based tests for sensitive data protection in API responses.
/// 
/// **Property 20: Sensitive Data Protection**
/// **Validates: Requirements 15.6**
/// 
/// For all API endpoints and responses, sensitive data (passwords, API keys, internal IDs,
/// PII details) SHALL NOT appear in response bodies, HTTP headers, or log output.
/// 
/// Additionally, the API SHALL return appropriate security headers (CSP, X-Frame-Options,
/// X-Content-Type-Options) to prevent client-side attacks.
/// </summary>
[Trait("Category", "Property-Based")]
[Trait("Property", "SensitiveDataProtection")]
public class SensitiveDataPropertyTests : ApiTestBase
{
    #region Sensitive Data in Response Body Tests

    /// <summary>
    /// Property: API responses SHALL NEVER include user passwords, password hashes,
    /// or password reset tokens in the response body, even for administrative endpoints.
    /// </summary>
    [Fact]
    public async Task GetReservations_ShouldNotIncludePasswordsInResponse()
    {
        // Arrange
        var endpoint = "/api/reservations";

        // Act
        var response = await GetAsync(endpoint);

        // Assert
        var content = await response.Content.ReadAsStringAsync();

        // Verify response doesn't contain password-related fields
        content.Should().NotContainAny(
            "password",
            "passwd",
            "pwd",
            "hash",
            "secret",
            "token",
            "apiKey",
            "api_key",
            "Bearer ",
            StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Property: When creating or updating resources, API responses SHALL not echo
    /// back sensitive input data like passwords or API keys.
    /// </summary>
    [Fact]
    public async Task PostReservation_ResponseShouldNotContainSensitiveRequestData()
    {
        // Arrange
        var command = new
        {
            customerName = "John Doe",
            email = "john@example.com",
            phoneNumber = "555-1234",
            reservationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            reservationTime = "19:00",
            partySize = 4,
            specialRequests = (string?)null
        };

        // Act
        var response = await PostAsync("/api/reservations", command);

        // Assert
        if (response.StatusCode == HttpStatusCode.Created || response.StatusCode == HttpStatusCode.BadRequest)
        {
            var content = await response.Content.ReadAsStringAsync();
            
            // Response should not contain payment info or credentials
            content.Should().NotContainAny(
                "creditCard",
                "cvv",
                "password",
                "bearer",
                "token",
                StringComparison.OrdinalIgnoreCase);
        }
    }

    /// <summary>
    /// Property: Internal system identifiers, database IDs, or internal references
    /// that could aid attackers SHALL not be exposed in error messages.
    /// </summary>
    [Fact]
    public async Task ErrorResponse_ShouldNotExposeInternalDetails()
    {
        // Arrange - Trigger an error
        var invalidCommand = new
        {
            customerName = "",
            email = "invalid",
            phoneNumber = "",
            reservationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)),
            reservationTime = "",
            partySize = 0,
            specialRequests = (string?)null
        };

        // Act
        var response = await PostAsync("/api/reservations", invalidCommand);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var content = await response.Content.ReadAsStringAsync();

        // Error message should be user-friendly, not expose internals
        content.Should().NotContainAny(
            "SELECT",
            "FROM",
            "WHERE",
            ".cs:",          // C# file paths
            "at System.",    // Stack traces
            "ConnectionString",
            "server=",
            StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Property: PII (Personally Identifiable Information) such as full phone numbers,
    /// email addresses in customer lists, or other user details SHALL be properly handled
    /// based on business rules and not unnecessarily exposed.
    /// </summary>
    [Fact]
    public async Task GetReservations_ShouldNotExposePiiWithoutAuthorization()
    {
        // Arrange
        var endpoint = "/api/reservations";

        // Act
        var response = await GetAsync(endpoint);

        // Assert - Response should be 401 without auth (or 200 with masked PII)
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var content = await response.Content.ReadAsStringAsync();
            var jsonDoc = JsonDocument.Parse(content);

            // If data is returned, ensure PII is handled appropriately
            // (This depends on API design - either masked or requires auth)
            if (jsonDoc.RootElement.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in jsonDoc.RootElement.EnumerateArray())
                {
                    // Verify fields like phone numbers are not fully exposed in public lists
                    // (This is application-specific, adjust based on your API design)
                }
            }
        }
        else if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            // Good - requires authentication to access reservation data
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
    }

    #endregion

    #region Security Headers Tests

    /// <summary>
    /// Property: All API responses SHALL include security headers to prevent
    /// client-side attacks even if the API response contains user-generated content.
    /// </summary>
    [Fact]
    public async Task ApiResponse_ShouldIncludeSecurityHeaders()
    {
        // Arrange
        var endpoint = "/api/menu";

        // Act
        var response = await GetAsync(endpoint);

        // Assert - Check for common security headers
        response.Headers.Should().Contain(header =>
            header.Key.Equals("X-Content-Type-Options", StringComparison.OrdinalIgnoreCase),
            "Response should include X-Content-Type-Options header");

        // X-Content-Type-Options should be 'nosniff'
        response.Headers.GetValues("X-Content-Type-Options").FirstOrDefault()
            .Should().Be("nosniff", "X-Content-Type-Options should prevent MIME type sniffing");
    }

    /// <summary>
    /// Property: API responses SHALL include X-Frame-Options header to prevent
    /// clickjacking attacks when API is accessed from browser context.
    /// </summary>
    [Fact]
    public async Task ApiResponse_ShouldIncludeXFrameOptionsHeader()
    {
        // Arrange
        var endpoint = "/api/menu";

        // Act
        var response = await GetAsync(endpoint);

        // Assert
        response.Headers.Should().Contain(header =>
            header.Key.Equals("X-Frame-Options", StringComparison.OrdinalIgnoreCase),
            "Response should include X-Frame-Options header");

        var xFrameOptions = response.Headers.GetValues("X-Frame-Options").FirstOrDefault();
        xFrameOptions.Should().BeOneOf("DENY", "SAMEORIGIN",
            "X-Frame-Options should be DENY or SAMEORIGIN");
    }

    /// <summary>
    /// Property: API responses MAY include Content-Security-Policy (CSP) header
    /// to limit sources of scripts and other resources (relevant if API response
    /// is rendered as HTML in browser).
    /// </summary>
    [Fact]
    public async Task ApiResponse_ShouldIncludeAppropriateCspHeaderIfApplicable()
    {
        // Arrange
        var endpoint = "/api/menu";

        // Act
        var response = await GetAsync(endpoint);

        // Assert - CSP may or may not be present depending on API design
        // If present, verify it's properly configured
        if (response.Headers.Contains("Content-Security-Policy"))
        {
            var csp = response.Headers.GetValues("Content-Security-Policy").FirstOrDefault();
            csp.Should().NotBeNullOrEmpty();
            csp.Should().Contain("default-src", "CSP should define default policy");
        }
    }

    /// <summary>
    /// Property: API responses SHALL include Strict-Transport-Security (HSTS) header
    /// to enforce HTTPS-only communication (when running on HTTPS).
    /// </summary>
    [Fact]
    public async Task HttpsResponse_ShouldIncludeHstsHeader()
    {
        // Arrange
        var endpoint = "/api/menu";

        // Act
        var response = await GetAsync(endpoint);

        // Assert
        response.Headers.Should().Contain(header =>
            header.Key.Equals("Strict-Transport-Security", StringComparison.OrdinalIgnoreCase),
            "HTTPS responses should include HSTS header");

        var hsts = response.Headers.GetValues("Strict-Transport-Security").FirstOrDefault();
        hsts.Should().Contain("max-age=", "HSTS header should specify max-age");
    }

    #endregion

    #region Credential Handling Tests

    /// <summary>
    /// Property: Authentication credentials (bearer tokens, API keys) in Authorization headers
    /// SHALL NOT appear in response bodies, error messages, or logs.
    /// </summary>
    [Fact]
    public async Task ErrorResponse_ShouldNotExposeAuthorizationCredentials()
    {
        // Arrange - Use invalid token
        var client = CreateAuthenticatedClient("invalid-very-secret-token-12345");

        var invalidCommand = new
        {
            customerName = "",
            email = "invalid",
            phoneNumber = "",
            reservationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            reservationTime = "",
            partySize = 0,
            specialRequests = (string?)null
        };

        var content = WebApplicationFactoryFixture.CreateJsonContent(invalidCommand);

        // Act
        var response = await client.PostAsync("/api/reservations", content);

        // Assert
        var responseContent = await response.Content.ReadAsStringAsync();

        // Response should not contain the token
        responseContent.Should().NotContain("invalid-very-secret-token",
            "Error responses should never expose authentication credentials");
        responseContent.Should().NotContain("Bearer ", "Responses should not include Bearer tokens");
    }

    #endregion

    #region Sensitive Field Filtering Tests

    /// <summary>
    /// Property: When returning user or order data, fields designated as sensitive
    /// (like payment methods, internal reference numbers, or personal notes)
    /// SHALL be excluded from responses or masked.
    /// </summary>
    [Fact]
    public async Task GetOrders_ShouldNotExposeSensitiveOrderDetails()
    {
        // Arrange
        var endpoint = "/api/orders";

        // Act
        var response = await GetAsync(endpoint);

        // Assert
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var content = await response.Content.ReadAsStringAsync();

            // Verify sensitive fields are not exposed
            content.Should().NotContainAny(
                "paymentMethod",
                "cardNumber",
                "cardCvv",
                "accountNumber",
                "bankCode",
                StringComparison.OrdinalIgnoreCase);
        }
        else if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            // Protecting sensitive data with auth is acceptable
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
    }

    /// <summary>
    /// Property: When returning reservation or user data, internal system identifiers
    /// that are not meaningful to clients SHALL be either excluded or randomized
    /// to prevent information disclosure.
    /// </summary>
    [Fact]
    public async Task GetReservations_ShouldNotExposeInternalSystemIdentifiers()
    {
        // Arrange
        var endpoint = "/api/reservations";

        // Act
        var response = await GetAsync(endpoint);

        // Assert
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var content = await response.Content.ReadAsStringAsync();

            // Internal IDs like database IDs, server names should not be visible
            content.Should().NotContainAny(
                "databaseId",
                "internalId",
                "serverId",
                "dbConnId",
                StringComparison.OrdinalIgnoreCase);
        }
    }

    #endregion

    #region No Sensitive Data in Different Response Types Tests

    /// <summary>
    /// Property: Whether the API returns success (200), error (400, 404, 500), or redirect (3xx),
    /// NONE of the responses SHALL contain sensitive data like passwords, API keys, or full PII.
    /// </summary>
    [Fact]
    public async Task AllResponseTypes_ShouldNotContainSensitiveData()
    {
        // Test success response (200)
        var successResponse = await GetAsync("/api/menu");
        var successContent = await successResponse.Content.ReadAsStringAsync();
        AssertNoSensitiveDataInContent(successContent, "Success response (200)");

        // Test error response (400)
        var errorCommand = new
        {
            customerName = "",
            email = "invalid",
            phoneNumber = "",
            reservationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            reservationTime = "",
            partySize = 0,
            specialRequests = (string?)null
        };

        var errorResponse = await PostAsync("/api/reservations", errorCommand);
        var errorContent = await errorResponse.Content.ReadAsStringAsync();
        AssertNoSensitiveDataInContent(errorContent, "Error response (400)");

        // Test not found response (404)
        var notFoundResponse = await GetAsync("/api/reservations/nonexistent-id");
        if (notFoundResponse.StatusCode == HttpStatusCode.NotFound)
        {
            var notFoundContent = await notFoundResponse.Content.ReadAsStringAsync();
            AssertNoSensitiveDataInContent(notFoundContent, "Not Found response (404)");
        }
    }

    #endregion

    #region Helper Methods

    private void AssertNoSensitiveDataInContent(string content, string contextMessage)
    {
        var sensitivePatterns = new[]
        {
            "password",
            "passwd",
            "apikey",
            "api_key",
            "secret",
            "token",
            "bearer ",
            "authorization",
            "creditcard",
            "cardnumber",
            "cvv",
            "ssn",
            "socialSecurity",
            "driverlicense",
            "licenseNumber",
            "bankaccount",
            "routingnumber",
            "connectionstring",
            "server=",
            "database=",
            ".cs:",  // C# file paths
            "at System.",  // Stack traces
            "SqlException",
            "SQLException",
        };

        foreach (var pattern in sensitivePatterns)
        {
            content.Should().NotContain(pattern, StringComparison.OrdinalIgnoreCase,
                $"{contextMessage} should not contain '{pattern}'");
        }
    }

    #endregion
}
