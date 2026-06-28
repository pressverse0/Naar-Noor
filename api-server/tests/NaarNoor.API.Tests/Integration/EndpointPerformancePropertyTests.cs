using FluentAssertions;
using System.Diagnostics;
using System.Net;
using Xunit;

namespace NaarNoor.API.Tests.Integration;

/// <summary>
/// Property-based tests for API endpoint response time SLA (Service Level Agreement).
/// 
/// **Property 22: API Endpoint Response Time**
/// **Validates: Requirements 14.2**
/// 
/// For all public API endpoints serving data (GET, POST, PUT, DELETE operations),
/// the endpoint SHALL respond within 500ms (0.5 seconds) under normal load.
/// 
/// This ensures good user experience and prevents timeouts on frontend clients
/// with typical HTTP request timeouts of 30 seconds.
/// </summary>
[Trait("Category", "Property-Based")]
[Trait("Property", "EndpointPerformance")]
public class EndpointPerformancePropertyTests : ApiTestBase
{
    #region GET Endpoint Performance Tests

    /// <summary>
    /// Property: GET /api/menu endpoint SHALL respond within 500ms.
    /// 
    /// This endpoint returns a list of menu items and is frequently called,
    /// so performance is critical for user experience.
    /// </summary>
    [Fact]
    public async Task GetMenu_ShouldRespondWithin500ms()
    {
        // Arrange
        var stopwatch = Stopwatch.StartNew();
        const int maxResponseTimeMs = 500;

        // Act
        var response = await GetAsync("/api/menu");
        stopwatch.Stop();

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(maxResponseTimeMs,
            $"GET /api/menu should respond within {maxResponseTimeMs}ms, took {stopwatch.ElapsedMilliseconds}ms");
    }

    /// <summary>
    /// Property: GET /api/chefs endpoint SHALL respond within 500ms.
    /// 
    /// This endpoint returns a list of available chefs.
    /// </summary>
    [Fact]
    public async Task GetChefs_ShouldRespondWithin500ms()
    {
        // Arrange
        var stopwatch = Stopwatch.StartNew();
        const int maxResponseTimeMs = 500;

        // Act
        var response = await GetAsync("/api/chefs");
        stopwatch.Stop();

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(maxResponseTimeMs,
            $"GET /api/chefs should respond within {maxResponseTimeMs}ms, took {stopwatch.ElapsedMilliseconds}ms");
    }

    /// <summary>
    /// Property: GET /api/reservations endpoint SHALL respond within 500ms.
    /// 
    /// This endpoint returns user's reservations (may require authentication).
    /// </summary>
    [Fact]
    public async Task GetReservations_ShouldRespondWithin500ms()
    {
        // Arrange
        var stopwatch = Stopwatch.StartNew();
        const int maxResponseTimeMs = 500;

        // Act
        var response = await GetAsync("/api/reservations");
        stopwatch.Stop();

        // Assert
        // May return 401 if authentication is required, but should still respond quickly
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.OK, HttpStatusCode.Unauthorized, HttpStatusCode.Forbidden);
        
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(maxResponseTimeMs,
            $"GET /api/reservations should respond within {maxResponseTimeMs}ms, took {stopwatch.ElapsedMilliseconds}ms");
    }

    /// <summary>
    /// Property: GET /api/orders endpoint SHALL respond within 500ms.
    /// </summary>
    [Fact]
    public async Task GetOrders_ShouldRespondWithin500ms()
    {
        // Arrange
        var stopwatch = Stopwatch.StartNew();
        const int maxResponseTimeMs = 500;

        // Act
        var response = await GetAsync("/api/orders");
        stopwatch.Stop();

        // Assert
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.OK, HttpStatusCode.Unauthorized, HttpStatusCode.Forbidden);
        
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(maxResponseTimeMs,
            $"GET /api/orders should respond within {maxResponseTimeMs}ms, took {stopwatch.ElapsedMilliseconds}ms");
    }

    #endregion

    #region POST Endpoint Performance Tests

    /// <summary>
    /// Property: POST /api/reservations endpoint (create reservation) SHALL respond within 500ms.
    /// 
    /// This is a write operation that may involve database inserts, so performance
    /// is crucial for user experience during peak booking times.
    /// </summary>
    [Fact]
    public async Task PostReservation_ShouldRespondWithin500ms()
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

        var stopwatch = Stopwatch.StartNew();
        const int maxResponseTimeMs = 500;

        // Act
        var response = await PostAsync("/api/reservations", command);
        stopwatch.Stop();

        // Assert
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.Created, HttpStatusCode.BadRequest, HttpStatusCode.Unauthorized);
        
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(maxResponseTimeMs,
            $"POST /api/reservations should respond within {maxResponseTimeMs}ms, took {stopwatch.ElapsedMilliseconds}ms");
    }

    /// <summary>
    /// Property: POST /api/orders endpoint (create order) SHALL respond within 500ms.
    /// </summary>
    [Fact]
    public async Task PostOrder_ShouldRespondWithin500ms()
    {
        // Arrange
        var command = new
        {
            customerId = Guid.NewGuid(),
            items = new[]
            {
                new { menuItemId = Guid.NewGuid(), quantity = 2 }
            },
            specialInstructions = (string?)null
        };

        var stopwatch = Stopwatch.StartNew();
        const int maxResponseTimeMs = 500;

        // Act
        var response = await PostAsync("/api/orders", command);
        stopwatch.Stop();

        // Assert
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.Created, HttpStatusCode.BadRequest, HttpStatusCode.Unauthorized);
        
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(maxResponseTimeMs,
            $"POST /api/orders should respond within {maxResponseTimeMs}ms, took {stopwatch.ElapsedMilliseconds}ms");
    }

    /// <summary>
    /// Property: POST /api/contact endpoint (submit inquiry) SHALL respond within 500ms.
    /// 
    /// This endpoint handles contact form submissions and should respond quickly.
    /// </summary>
    [Fact]
    public async Task PostContact_ShouldRespondWithin500ms()
    {
        // Arrange
        var command = new
        {
            name = "John Doe",
            email = "john@example.com",
            subject = "Question about the restaurant",
            message = "I would like to know more about your catering services."
        };

        var stopwatch = Stopwatch.StartNew();
        const int maxResponseTimeMs = 500;

        // Act
        var response = await PostAsync("/api/contact", command);
        stopwatch.Stop();

        // Assert
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.Created, HttpStatusCode.BadRequest, HttpStatusCode.OK);
        
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(maxResponseTimeMs,
            $"POST /api/contact should respond within {maxResponseTimeMs}ms, took {stopwatch.ElapsedMilliseconds}ms");
    }

    #endregion

    #region DELETE Endpoint Performance Tests

    /// <summary>
    /// Property: DELETE /api/reservations/{id} endpoint SHALL respond within 500ms.
    /// 
    /// This endpoint cancels a reservation and should provide quick feedback to users.
    /// </summary>
    [Fact]
    public async Task DeleteReservation_ShouldRespondWithin500ms()
    {
        // Arrange
        var reservationId = Guid.NewGuid();
        var stopwatch = Stopwatch.StartNew();
        const int maxResponseTimeMs = 500;

        // Act
        var response = await DeleteAsync($"/api/reservations/{reservationId}");
        stopwatch.Stop();

        // Assert
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.NoContent, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
        
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(maxResponseTimeMs,
            $"DELETE /api/reservations/{{id}} should respond within {maxResponseTimeMs}ms, took {stopwatch.ElapsedMilliseconds}ms");
    }

    #endregion

    #region Error Response Performance Tests

    /// <summary>
    /// Property: Even when returning error responses (400, 404, 500), the API
    /// SHALL respond within 500ms to avoid frustrating users with slow error messages.
    /// </summary>
    [Fact]
    public async Task ErrorResponse_ShouldStillRespondWithin500ms()
    {
        // Arrange - Request that will generate validation error
        var invalidCommand = new
        {
            customerName = "",
            email = "not-an-email",
            phoneNumber = "",
            reservationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)),
            reservationTime = "",
            partySize = -1,
            specialRequests = (string?)null
        };

        var stopwatch = Stopwatch.StartNew();
        const int maxResponseTimeMs = 500;

        // Act
        var response = await PostAsync("/api/reservations", invalidCommand);
        stopwatch.Stop();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(maxResponseTimeMs,
            $"Error responses should respond within {maxResponseTimeMs}ms, took {stopwatch.ElapsedMilliseconds}ms");
    }

    /// <summary>
    /// Property: Requests to non-existent endpoints (404) SHALL respond quickly,
    /// without slow exception handling or logging overhead.
    /// </summary>
    [Fact]
    public async Task NotFoundResponse_ShouldRespondQuickly()
    {
        // Arrange
        var stopwatch = Stopwatch.StartNew();
        const int maxResponseTimeMs = 500;

        // Act
        var response = await GetAsync("/api/nonexistent/endpoint");
        stopwatch.Stop();

        // Assert
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(maxResponseTimeMs,
            $"404 responses should respond within {maxResponseTimeMs}ms, took {stopwatch.ElapsedMilliseconds}ms");
    }

    #endregion

    #region Consistency Tests

    /// <summary>
    /// Property: Multiple consecutive requests to the same endpoint SHALL
    /// maintain consistent response times (not degrade over time).
    /// 
    /// This tests for memory leaks, resource accumulation, or cache degradation.
    /// </summary>
    [Fact]
    public async Task MultipleRequests_ShouldMaintainConsistentPerformance()
    {
        // Arrange
        const int requestCount = 5;
        const int maxResponseTimeMs = 500;
        var responseTimes = new List<long>();

        // Act - Make multiple requests and measure each
        for (int i = 0; i < requestCount; i++)
        {
            var stopwatch = Stopwatch.StartNew();
            var response = await GetAsync("/api/menu");
            stopwatch.Stop();

            response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
            responseTimes.Add(stopwatch.ElapsedMilliseconds);
        }

        // Assert - All requests should be within SLA
        foreach (var time in responseTimes)
        {
            time.Should().BeLessThan(maxResponseTimeMs,
                $"All requests should respond within {maxResponseTimeMs}ms");
        }

        // Check for degradation (last request not significantly slower than first)
        var firstRequestTime = responseTimes[0];
        var lastRequestTime = responseTimes[requestCount - 1];
        var degradationPercent = ((lastRequestTime - firstRequestTime) / (double)firstRequestTime) * 100;

        degradationPercent.Should().BeLessThan(100,
            "Performance should not degrade by more than 100% over multiple requests");
    }

    /// <summary>
    /// Property: Different endpoints SHALL have consistent performance characteristics,
    /// with read operations (GET) generally faster than write operations (POST).
    /// </summary>
    [Fact]
    public async Task DifferentEndpoints_ShouldHaveConsistentPerformance()
    {
        // Arrange
        const int maxResponseTimeMs = 500;

        // Act - Measure various endpoints
        var getMenuTime = await MeasureEndpointResponseTimeAsync(() => GetAsync("/api/menu"));
        var getChiefsTime = await MeasureEndpointResponseTimeAsync(() => GetAsync("/api/chefs"));

        // Assert
        getMenuTime.Should().BeLessThan(maxResponseTimeMs,
            $"GET /api/menu should respond within {maxResponseTimeMs}ms, took {getMenuTime}ms");
        getChiefsTime.Should().BeLessThan(maxResponseTimeMs,
            $"GET /api/chefs should respond within {maxResponseTimeMs}ms, took {getChiefsTime}ms");

        // Both should be reasonably close (within 2x of each other)
        var ratio = (double)Math.Max(getMenuTime, getChiefsTime) / Math.Min(getMenuTime, getChiefsTime);
        ratio.Should().BeLessThan(3,
            "Similar endpoints should have comparable performance (within 3x)");
    }

    #endregion

    #region Helper Methods

    private async Task<long> MeasureEndpointResponseTimeAsync(Func<Task<HttpResponseMessage>> requestFunc)
    {
        var stopwatch = Stopwatch.StartNew();
        var response = await requestFunc();
        stopwatch.Stop();
        return stopwatch.ElapsedMilliseconds;
    }

    #endregion
}
