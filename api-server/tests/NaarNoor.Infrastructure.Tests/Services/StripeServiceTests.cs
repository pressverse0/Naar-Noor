using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using NaarNoor.Infrastructure.Services;
using Xunit;

namespace NaarNoor.Infrastructure.Tests.Services;

public class StripeServiceTests
{
    private const string CurrentStripeApiVersion = "2025-01-27.acacia";

    private static IConfiguration BuildConfig(
        string? secretKey = "sk_test_fake_key_for_testing_only",
        string webhookSecret = "")
    {
        var dict = new Dictionary<string, string?>();
        if (secretKey is not null)
            dict["Stripe:SecretKey"] = secretKey;
        dict["Stripe:WebhookSecret"] = webhookSecret;

        return new ConfigurationBuilder()
            .AddInMemoryCollection(dict)
            .Build();
    }

    private static StripeService CreateService(
        string? secretKey = "sk_test_fake_key_for_testing_only",
        string webhookSecret = "")
    {
        Environment.SetEnvironmentVariable("STRIPE_SECRET_KEY", null);
        Environment.SetEnvironmentVariable("STRIPE_WEBHOOK_SECRET", null);

        var config = BuildConfig(secretKey, webhookSecret);
        var logger = Mock.Of<ILogger<StripeService>>();
        return new StripeService(config, logger);
    }

    private static string BuildMinimalStripeEvent(string type = "payment_intent.created") => $$"""
        {
          "id": "evt_test_abc123",
          "object": "event",
          "type": "{{type}}",
          "api_version": "{{CurrentStripeApiVersion}}",
          "created": 1234567890,
          "livemode": false,
          "pending_webhooks": 0,
          "request": null,
          "data": {
            "object": {
              "id": "pi_test",
              "object": "payment_intent",
              "amount": 2000,
              "currency": "gbp"
            }
          }
        }
        """;

    [Fact]
    public void Constructor_WithValidSecretKey_DoesNotThrow()
    {
        Action act = () => CreateService();

        act.Should().NotThrow("StripeService should construct successfully with a valid secret key");
    }

    [Fact]
    public void Constructor_WithNullSecretKeyInConfig_ThrowsInvalidOperationException()
    {
        Environment.SetEnvironmentVariable("STRIPE_SECRET_KEY", null);
        Environment.SetEnvironmentVariable("STRIPE_WEBHOOK_SECRET", null);

        // Config with NO Stripe:SecretKey entry → configuration["Stripe:SecretKey"] returns null
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();
        var logger = Mock.Of<ILogger<StripeService>>();

        Action act = () => new StripeService(config, logger);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Stripe secret key not configured*");
    }

    [Fact]
    public async Task ParseWebhookEventAsync_InProduction_WithNoWebhookSecret_ThrowsInvalidOperationException()
    {
        var prevEnv = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        try
        {
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Production");
            var service = CreateService(webhookSecret: "");

            Func<Task> act = () => service.ParseWebhookEventAsync("payload", "sig", CancellationToken.None);

            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*STRIPE_WEBHOOK_SECRET*");
        }
        finally
        {
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", prevEnv);
        }
    }

    [Fact]
    public async Task ParseWebhookEventAsync_InDevelopment_WithNoWebhookSecret_ParsesUnsignedEvent()
    {
        var prevEnv = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        try
        {
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Development");
            var service = CreateService(webhookSecret: "");

            var result = await service.ParseWebhookEventAsync(
                BuildMinimalStripeEvent("payment_intent.created"),
                "no-sig-needed",
                CancellationToken.None);

            result.Should().NotBeNull();
            result.EventType.Should().Be("payment_intent.created");
        }
        finally
        {
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", prevEnv);
        }
    }

    [Fact]
    public async Task ParseWebhookEventAsync_InDevelopment_WithInvalidJson_Throws()
    {
        var prevEnv = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        try
        {
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Development");
            var service = CreateService(webhookSecret: "");

            Func<Task> act = () => service.ParseWebhookEventAsync("not-valid-json", "no-sig", CancellationToken.None);

            await act.Should().ThrowAsync<Exception>("Invalid JSON should not be parseable as a Stripe event");
        }
        finally
        {
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", prevEnv);
        }
    }

    [Fact]
    public async Task ParseWebhookEventAsync_WithWebhookSecret_InvalidSignature_ThrowsStripeException()
    {
        var service = CreateService(webhookSecret: "whsec_test_secret_for_validation");

        Func<Task> act = () => service.ParseWebhookEventAsync(
            "some payload",
            "t=1,v1=badsignature",
            CancellationToken.None);

        await act.Should().ThrowAsync<Stripe.StripeException>("An invalid signature should cause a StripeException");
    }

    [Fact]
    public async Task ParseWebhookEventAsync_PaymentIntentCreated_ReturnsCorrectEventType()
    {
        var prevEnv = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        try
        {
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Development");
            var service = CreateService(webhookSecret: "");

            var result = await service.ParseWebhookEventAsync(
                BuildMinimalStripeEvent("payment_intent.succeeded"),
                "no-sig",
                CancellationToken.None);

            result.EventType.Should().Be("payment_intent.succeeded");
        }
        finally
        {
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", prevEnv);
        }
    }

    [Fact]
    public async Task ParseWebhookEventAsync_NonSessionEvent_ReturnsNullSessionId()
    {
        var prevEnv = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        try
        {
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Development");
            var service = CreateService(webhookSecret: "");

            var result = await service.ParseWebhookEventAsync(
                BuildMinimalStripeEvent("payment_intent.created"),
                "no-sig",
                CancellationToken.None);

            result.SessionId.Should().BeNull("payment_intent events don't have a checkout session");
        }
        finally
        {
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", prevEnv);
        }
    }

    private static string BuildCheckoutSessionEvent(string orderId, string sessionId = "cs_test_session_abc") => $$"""
        {
          "id": "evt_test_checkout_001",
          "object": "event",
          "type": "checkout.session.completed",
          "api_version": "{{CurrentStripeApiVersion}}",
          "created": 1234567890,
          "livemode": false,
          "pending_webhooks": 0,
          "request": null,
          "data": {
            "object": {
              "id": "{{sessionId}}",
              "object": "checkout.session",
              "payment_intent": "pi_test_xyz",
              "amount_total": 2000,
              "currency": "gbp",
              "customer_email": "test@example.com",
              "mode": "payment",
              "payment_status": "paid",
              "status": "complete",
              "success_url": "https://example.com/success",
              "cancel_url": "https://example.com/cancel",
              "metadata": {
                "orderId": "{{orderId}}",
                "customerName": "Test Customer"
              }
            }
          }
        }
        """;

    [Fact]
    public async Task ParseWebhookEventAsync_CheckoutSessionCompleted_ReturnsSessionIdAndOrderId()
    {
        var prevEnv = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        try
        {
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Development");
            var service = CreateService(webhookSecret: "");
            var expectedOrderId = Guid.NewGuid().ToString();

            var result = await service.ParseWebhookEventAsync(
                BuildCheckoutSessionEvent(expectedOrderId),
                "no-sig",
                CancellationToken.None);

            result.EventType.Should().Be("checkout.session.completed");
            result.SessionId.Should().Be("cs_test_session_abc", "Session events should return the session ID");
            result.OrderId.Should().Be(expectedOrderId, "Order ID should be extracted from session metadata");
        }
        finally
        {
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", prevEnv);
        }
    }

    [Fact]
    public async Task ParseWebhookEventAsync_CheckoutSessionCompleted_ReturnsPaymentIntentId()
    {
        var prevEnv = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        try
        {
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Development");
            var service = CreateService(webhookSecret: "");

            var result = await service.ParseWebhookEventAsync(
                BuildCheckoutSessionEvent(Guid.NewGuid().ToString()),
                "no-sig",
                CancellationToken.None);

            result.PaymentIntentId.Should().Be("pi_test_xyz", "Payment intent ID should be extracted from session");
        }
        finally
        {
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", prevEnv);
        }
    }
}
