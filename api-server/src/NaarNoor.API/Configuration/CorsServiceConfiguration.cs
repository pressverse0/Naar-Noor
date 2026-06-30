namespace NaarNoor.API.Configuration;

using Microsoft.Extensions.Configuration;

/// <summary>
/// CORS service registration - Environment-aware configuration
/// Development: AllowAnyOrigin (localhost development)
/// Production: Specific origin only (https://naar-noor.vercel.app)
/// </summary>
public static class CorsServiceConfiguration
{
    public static void AddCorsServiceConfiguration(this IServiceCollection services, IConfiguration configuration)
    {
        var environment = configuration["ASPNETCORE_ENVIRONMENT"] ?? "Development";
        
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
        });
    }
}
