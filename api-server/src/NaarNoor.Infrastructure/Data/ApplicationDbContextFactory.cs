using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace NaarNoor.Infrastructure.Data;

/// <summary>
/// Design-time factory for creating ApplicationDbContext instances
/// Required for migrations to work with EF Core CLI
/// </summary>
public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();

        // Use PostgreSQL connection string for migrations
        // This reads from environment variables or uses a default local connection
        var connectionString = Environment.GetEnvironmentVariable("POSTGRESQL_CONNECTION_STRING")
            ?? "Host=db.uyzocpvytoljigmcpafn.supabase.co;Port=5432;Database=postgres;User Id=postgres;Password=YOUR_PASSWORD_HERE;";

        optionsBuilder.UseNpgsql(connectionString, npgsql =>
            npgsql.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName));

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
