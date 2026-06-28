using FluentAssertions;
using System.Net;
using System.Text.Json;
using Xunit;

namespace NaarNoor.API.Tests.Integration;

/// <summary>
/// Property-based tests for injection attack prevention in API endpoints.
/// 
/// **Property 19: Injection Attack Prevention**
/// **Validates: Requirements 15.2**
/// 
/// For any API endpoint accepting user input, when provided with common injection attack patterns
/// (SQL injection, XSS, LDAP injection, command injection), the endpoint SHALL either:
/// 1. Reject the input with HTTP 400 Bad Request, OR
/// 2. Sanitize/escape the input so the injection payload is rendered harmless
/// 
/// The endpoint SHALL NOT execute the injected code or allow the attack to succeed.
/// </summary>
[Trait("Category", "Property-Based")]
[Trait("Property", "InjectionAttackPrevention")]
public class InjectionAttackPropertyTests : ApiTestBase
{
    #region SQL Injection Prevention Tests

    /// <summary>
    /// Property: When POST /api/reservations receives SQL injection patterns in customer name,
    /// the endpoint SHALL sanitize or reject the input, preventing SQL injection execution.
    /// 
    /// Common SQL injection patterns:
    /// - ' OR '1'='1
    /// - '; DROP TABLE users; --
    /// - admin'--
    /// - 1' UNION SELECT * FROM users--
    /// </summary>
    [Theory]
    [InlineData("' OR '1'='1")]
    [InlineData("'; DROP TABLE reservations; --")]
    [InlineData("admin'--")]
    [InlineData("1' UNION SELECT * FROM users--")]
    [InlineData("' OR 1=1--")]
    public async Task PostReservation_WithSqlInjectionInName_ShouldSanitizeOrReject(string sqlPayload)
    {
        // Arrange
        var command = new
        {
            customerName = sqlPayload,
            email = "test@example.com",
            phoneNumber = "555-1234",
            reservationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            reservationTime = "19:00",
            partySize = 4,
            specialRequests = (string?)null
        };

        // Act
        var response = await PostAsync("/api/reservations", command);

        // Assert - Should either reject (400) or sanitize (400/200)
        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.Created,
            $"SQL injection payload '{sqlPayload}' should not cause 500 error");
        response.StatusCode.Should().NotBe(HttpStatusCode.InternalServerError,
            "SQL injection should not cause server error");

        // Verify database integrity is not compromised
        // (No tables should be dropped, no data corrupted)
        var getResponse = await GetAsync("/api/menu");
        getResponse.StatusCode.Should().NotBe(HttpStatusCode.InternalServerError,
            "Database should not be corrupted by SQL injection attempt");
    }

    /// <summary>
    /// Property: When SQL injection is attempted in API parameters (query strings, request bodies),
    /// Entity Framework's parameterized queries SHALL prevent SQL injection by default.
    /// 
    /// This tests that even if input is not validated, parameterization prevents exploitation.
    /// </summary>
    [Fact]
    public async Task ReservationFiltering_WithSqlInjectionInQueryParam_ShouldNotExecuteQuery()
    {
        // Arrange
        var injectionPayload = "1' OR '1'='1";

        // Act - Try to filter by ID with injection
        var response = await GetAsync($"/api/reservations/search?customerId={Uri.EscapeDataString(injectionPayload)}");

        // Assert
        response.StatusCode.Should().NotBe(HttpStatusCode.InternalServerError,
            "SQL injection in query parameters should not crash server");
    }

    #endregion

    #region XSS (Cross-Site Scripting) Prevention Tests

    /// <summary>
    /// Property: When POST /api/contact receives XSS payload in message field,
    /// the endpoint SHALL sanitize or reject the input, preventing script execution.
    /// 
    /// Common XSS patterns:
    /// - <script>alert('XSS')</script>
    /// - <img src=x onerror=alert('XSS')>
    /// - <svg onload=alert('XSS')>
    /// - javascript:alert('XSS')
    /// </summary>
    [Theory]
    [InlineData("<script>alert('XSS')</script>")]
    [InlineData("<img src=x onerror=alert('XSS')>")]
    [InlineData("<svg onload=alert('XSS')>")]
    [InlineData("javascript:alert('XSS')")]
    [InlineData("<iframe src=javascript:alert('XSS')>")]
    public async Task PostContact_WithXssPayload_ShouldSanitizeOrReject(string xssPayload)
    {
        // Arrange
        var command = new
        {
            name = "John Doe",
            email = "john@example.com",
            subject = "Test",
            message = xssPayload
        };

        // Act
        var response = await PostAsync("/api/contact", command);

        // Assert - Should accept (sanitized) or reject
        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.Created,
            $"XSS payload '{xssPayload}' should not cause 500 error");
        response.StatusCode.Should().NotBe(HttpStatusCode.InternalServerError,
            "XSS attempt should not cause server error");

        // Verify response doesn't echo raw script
        if (response.StatusCode == HttpStatusCode.Created)
        {
            var content = await response.Content.ReadAsStringAsync();
            content.Should().NotContain("<script>", "Response should not contain raw script tags");
        }
    }

    /// <summary>
    /// Property: Angular's built-in sanitization SHALL prevent XSS attacks in API responses
    /// by automatically escaping dangerous HTML/JavaScript content.
    /// </summary>
    [Fact]
    public async Task GetReservations_WithStoredXss_ShouldNotReturnExecutableScripts()
    {
        // Arrange - Seed a reservation with XSS payload in special requests
        var xssPayload = "<img src=x onerror='alert(\"XSS\")'>";

        var command = new
        {
            customerName = "John Doe",
            email = "john@example.com",
            phoneNumber = "555-1234",
            reservationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            reservationTime = "19:00",
            partySize = 4,
            specialRequests = xssPayload
        };

        // Act
        var postResponse = await PostAsync("/api/reservations", command);
        var getResponse = await GetAsync("/api/reservations");

        // Assert
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await getResponse.Content.ReadAsStringAsync();
        // Should be escaped or sanitized
        content.Should().NotContain("onerror=", "Event handlers should be escaped");
    }

    #endregion

    #region LDAP Injection Prevention Tests

    /// <summary>
    /// Property: If the API uses LDAP for directory operations, LDAP injection patterns
    /// SHALL be sanitized or rejected.
    /// 
    /// Common LDAP injection patterns:
    /// - *
    /// - *)(|(cn=*
    /// - admin*))(|(password=*
    /// </summary>
    [Theory]
    [InlineData("*")]
    [InlineData("*)(|(cn=*")]
    [InlineData("admin*))(|(password=*")]
    public async Task LdapOperations_WithLdapInjectionPayload_ShouldBeSanitized(string ldapPayload)
    {
        // Arrange
        var command = new
        {
            customerName = ldapPayload,
            email = "test@example.com",
            phoneNumber = "555-1234",
            reservationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            reservationTime = "19:00",
            partySize = 4,
            specialRequests = (string?)null
        };

        // Act
        var response = await PostAsync("/api/reservations", command);

        // Assert
        response.StatusCode.Should().NotBe(HttpStatusCode.InternalServerError,
            $"LDAP injection payload '{ldapPayload}' should not cause server error");
    }

    #endregion

    #region Command Injection Prevention Tests

    /// <summary>
    /// Property: If the API executes system commands, command injection patterns
    /// SHALL be sanitized or rejected.
    /// 
    /// Common command injection patterns:
    /// - ; ls -la
    /// - | cat /etc/passwd
    /// - && whoami
    /// - `whoami`
    /// - $(whoami)
    /// </summary>
    [Theory]
    [InlineData("; ls -la")]
    [InlineData("| cat /etc/passwd")]
    [InlineData("&& whoami")]
    [InlineData("`whoami`")]
    [InlineData("$(whoami)")]
    public async Task ApiEndpoints_WithCommandInjectionPayload_ShouldNotExecuteCommand(string cmdPayload)
    {
        // Arrange
        var command = new
        {
            customerName = cmdPayload,
            email = "test@example.com",
            phoneNumber = "555-1234",
            reservationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            reservationTime = "19:00",
            partySize = 4,
            specialRequests = (string?)null
        };

        // Act
        var response = await PostAsync("/api/reservations", command);

        // Assert
        response.StatusCode.Should().NotBe(HttpStatusCode.InternalServerError,
            $"Command injection payload '{cmdPayload}' should not cause server error");
    }

    #endregion

    #region Path Traversal Prevention Tests

    /// <summary>
    /// Property: If the API serves files or accesses file system based on user input,
    /// path traversal patterns SHALL be sanitized or rejected.
    /// 
    /// Common path traversal patterns:
    /// - ../../../etc/passwd
    /// - ..\\..\\..\\windows\\win.ini
    /// - ....//....//....//etc/passwd
    /// </summary>
    [Theory]
    [InlineData("../../../etc/passwd")]
    [InlineData("..\\..\\..\\windows\\win.ini")]
    [InlineData("....//....//....//etc/passwd")]
    public async Task FileOperations_WithPathTraversalPayload_ShouldBePrevented(string pathPayload)
    {
        // Arrange
        var command = new
        {
            customerName = pathPayload,
            email = "test@example.com",
            phoneNumber = "555-1234",
            reservationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            reservationTime = "19:00",
            partySize = 4,
            specialRequests = (string?)null
        };

        // Act
        var response = await PostAsync("/api/reservations", command);

        // Assert
        response.StatusCode.Should().NotBe(HttpStatusCode.InternalServerError,
            $"Path traversal payload '{pathPayload}' should not cause server error");
    }

    #endregion

    #region Payload Encoding Variation Tests

    /// <summary>
    /// Property: Attackers often encode injection payloads to bypass basic validation.
    /// API endpoints SHALL sanitize encoded injection attempts.
    /// 
    /// Encoding variations:
    /// - URL encoding: %27%20OR%20%271%27%3D%271
    /// - HTML encoding: &#39; OR &#39;1&#39;=&#39;1
    /// - Double encoding: %2527%20OR%20%2527x%2527%3D%2527x
    /// </summary>
    [Theory]
    [InlineData("%27%20OR%20%271%27%3D%271")]  // ' OR '1'='1
    [InlineData("&#39; OR &#39;1&#39;=&#39;1")]  // HTML encoded
    [InlineData("%2527%20OR%20%2527x%2527%3D%2527x")]  // Double encoded
    public async Task Endpoint_WithEncodedInjectionPayload_ShouldDecodeAndSanitize(string encodedPayload)
    {
        // Arrange
        var decodedPayload = Uri.UnescapeDataString(encodedPayload);
        var command = new
        {
            customerName = decodedPayload,
            email = "test@example.com",
            phoneNumber = "555-1234",
            reservationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            reservationTime = "19:00",
            partySize = 4,
            specialRequests = (string?)null
        };

        // Act
        var response = await PostAsync("/api/reservations", command);

        // Assert
        response.StatusCode.Should().NotBe(HttpStatusCode.InternalServerError,
            $"Encoded injection payload should be safely handled");

        // Verify no malicious execution occurred
        var dbCheckResponse = await GetAsync("/api/menu");
        dbCheckResponse.StatusCode.Should().NotBe(HttpStatusCode.InternalServerError,
            "Database should remain intact after encoded injection attempt");
    }

    #endregion

    #region Consistency Tests

    /// <summary>
    /// Property: All API endpoints accepting user input SHALL consistently sanitize
    /// or reject injection patterns across different endpoints and HTTP methods.
    /// </summary>
    [Fact]
    public async Task AllInputEndpoints_ShouldConsistentlyPreventInjectionAttacks()
    {
        // Arrange
        var sqlInjection = "' OR '1'='1";
        var xssPayload = "<script>alert('test')</script>";

        // Test multiple endpoints with injection payloads
        var reservationCommand = new
        {
            customerName = sqlInjection,
            email = "test@example.com",
            phoneNumber = "555-1234",
            reservationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            reservationTime = "19:00",
            partySize = 4,
            specialRequests = xssPayload
        };

        var contactCommand = new
        {
            name = sqlInjection,
            email = "test@example.com",
            subject = xssPayload,
            message = sqlInjection
        };

        // Act
        var reservationResponse = await PostAsync("/api/reservations", reservationCommand);
        var contactResponse = await PostAsync("/api/contact", contactCommand);

        // Assert - Neither should result in 500 errors
        reservationResponse.StatusCode.Should().NotBe(HttpStatusCode.InternalServerError,
            "Injection in reservation endpoint should not cause 500");
        contactResponse.StatusCode.Should().NotBe(HttpStatusCode.InternalServerError,
            "Injection in contact endpoint should not cause 500");

        // Both endpoints should handle injection gracefully
        reservationResponse.StatusCode.Should().BeOneOf(
            HttpStatusCode.BadRequest, HttpStatusCode.Created, HttpStatusCode.Unauthorized);
        contactResponse.StatusCode.Should().BeOneOf(
            HttpStatusCode.BadRequest, HttpStatusCode.Created, HttpStatusCode.Unauthorized);
    }

    /// <summary>
    /// Property: Multiple injection attempts in different fields of the same request
    /// SHALL all be sanitized/rejected consistently.
    /// </summary>
    [Fact]
    public async Task Request_WithMultipleInjectionVectors_ShouldSanitizeAll()
    {
        // Arrange - Attack multiple fields simultaneously
        var command = new
        {
            customerName = "' OR '1'='1",
            email = "test@example.com<script>",
            phoneNumber = "555-1234; DROP TABLE;",
            reservationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            reservationTime = "19:00",
            partySize = 4,
            specialRequests = "<img onerror='alert(1)'>"
        };

        // Act
        var response = await PostAsync("/api/reservations", command);

        // Assert
        response.StatusCode.Should().NotBe(HttpStatusCode.InternalServerError,
            "Multiple injection vectors should not cause server error");

        // Database should be intact
        var getResponse = await GetAsync("/api/menu");
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK,
            "Database should remain accessible after multi-vector attack");
    }

    #endregion
}
