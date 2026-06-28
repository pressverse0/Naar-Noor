using AspNetCoreRateLimit;
using Microsoft.AspNetCore.Builder;
using NaarNoor.API.Configuration;
using NaarNoor.API.Middleware;
using NaarNoor.Application;
using NaarNoor.Infrastructure;
using Serilog;
using Serilog.Formatting.Compact;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog - Phase 2.3: Structured Logging
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .Enrich.WithEnvironmentName()
    .Enrich.WithMachineName()
    .WriteTo.Console(new CompactJsonFormatter())
    .CreateLogger();

builder.Host.UseSerilog();

try
{
    Log.Information("Starting Naar-Noor API...");

    // ===== SERVICE REGISTRATION =====

    // 1. Web Host Configuration
    builder.ConfigureWebHost();

    // 2. Core Services
    builder.Services.AddServiceConfiguration();

    // 3. Swagger Services
    builder.Services.AddSwaggerServiceConfiguration();

    // 4. CORS Services - Phase 2.4
    builder.Services.AddCorsServiceConfiguration(builder.Configuration);

    // 5. Health Check Services
    builder.Services.AddHealthCheckServiceConfiguration(builder.Configuration);

    // 6. Application Layer
    builder.Services.AddApplication();

    // 7. Infrastructure Layer (includes Rate Limiting - Phase 2.2)
    builder.Services.AddInfrastructure(builder.Configuration);

    var app = builder.Build();

    // ===== MIDDLEWARE PIPELINE =====

    // 1. Exception Handling (must be first)
    app.UseExceptionHandlingMiddleware();

    // 2. Security Headers
    app.UseSecurityHeadersMiddleware();

    // 3. Rate Limiting - Phase 2.2
    app.UseIpRateLimiting();

    // 4. Swagger UI
    app.UseSwaggerMiddleware();

    // 5. CORS - Phase 2.4
    app.UseCorsMiddleware();

    // 6. Authorization
    app.UseAuthorizationMiddleware();

    // 7. Map Controllers
    app.MapControllersMiddleware();

    // 8. Map Health Checks
    app.MapHealthChecks("/health");

    // 9. Seed Database
    await app.SeedDatabaseMiddlewareAsync();

    Log.Information("Naar-Noor API started successfully");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
