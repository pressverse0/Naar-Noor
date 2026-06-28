# Supabase Migration Guide

## Overview

This guide documents the complete migration from SQL Server to Supabase PostgreSQL with Authentication, Storage, and Realtime features.

## Migration Changes

### 1. Database Provider Migration

#### From
- **Provider**: Microsoft SQL Server
- **Hosted**: External SQL Server instance
- **Connection String**: SQL Server format

#### To
- **Provider**: PostgreSQL via Supabase
- **Hosted**: Supabase Cloud
- **Connection String**: PostgreSQL format
- **URL**: `https://uyzocpvytoljigmcpafn.supabase.co`

### 2. NuGet Package Changes

#### Removed
```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.11" />
```

#### Added
```xml
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.0.0" />
<PackageReference Include="Supabase.Core" Version="0.3.7" />
<PackageReference Include="Supabase.Gotrue" Version="0.3.7" />
<PackageReference Include="Supabase.Storage" Version="0.3.7" />
<PackageReference Include="Supabase.Realtime" Version="0.2.10" />
```

### 3. Connection String Update

#### SQL Server Format (Old)
```
Server=db54355.public.databaseasp.net;Database=db54355;User Id=db54355;Password=eW!62%tA=bT7;Encrypt=True;TrustServerCertificate=True;MultipleActiveResultSets=True;
```

#### PostgreSQL Format (New)
```
Host=db.uyzocpvytoljigmcpafn.supabase.co;Port=5432;Database=postgres;User Id=postgres;Password=YOUR_PASSWORD_HERE;
```

### 4. EF Core Provider Configuration

#### DependencyInjection.cs
```csharp
// Old
options.UseSqlServer(connectionString, sqlServer =>
    sqlServer.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName));

// New
options.UseNpgsql(connectionString, npgsql =>
    npgsql.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName));
```

### 5. Configuration Updates

#### appsettings.json
```json
"Supabase": {
  "Url": "https://uyzocpvytoljigmcpafn.supabase.co",
  "AnonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "ServiceRoleKey": "YOUR_SERVICE_ROLE_KEY_HERE"
}
```

## New Features

### 1. Supabase Authentication Service

**Location**: `api-server/src/NaarNoor.Infrastructure/Services/SupabaseAuthService.cs`

Features:
- User registration with email/password
- Login/logout functionality
- JWT token verification
- Email updates and password changes
- Password reset workflow
- Session management

**Interface**: `ISupabaseAuthService`

**Methods**:
```csharp
Task<(bool Success, string? UserId, string? Error)> RegisterUserAsync(string email, string password);
Task<(bool Success, string? SessionToken, string? Error)> LoginUserAsync(string email, string password);
Task<(bool Success, string? Error)> LogoutUserAsync(string userId);
Task<(bool Valid, string? UserId, string? Error)> VerifyTokenAsync(string token);
Task<(bool Success, string? UserId, string? Email, string? Error)> GetCurrentUserAsync(string token);
Task<(bool Success, string? Error)> UpdateUserEmailAsync(string userId, string newEmail);
Task<(bool Success, string? Error)> UpdateUserPasswordAsync(string userId, string newPassword);
Task<(bool Success, string? Error)> ResetPasswordAsync(string email);
```

### 2. Supabase Storage Service

**Location**: `api-server/src/NaarNoor.Infrastructure/Services/SupabaseStorageService.cs`

Features:
- Upload chef profile images
- Upload menu item images
- Generate public URLs
- Delete images
- List files in buckets

**Interface**: `ISupabaseStorageService`

**Storage Buckets**:
- `chef-images` - Chef profile photos
- `menu-item-images` - Menu item photos

**Methods**:
```csharp
Task<(bool Success, string? PublicUrl, string? Error)> UploadImageAsync(string bucket, string fileName, byte[] fileData, string contentType);
Task<(bool Success, string? PublicUrl, string? Error)> UploadChefImageAsync(string chefId, byte[] imageData, string contentType);
Task<(bool Success, string? PublicUrl, string? Error)> UploadMenuItemImageAsync(string menuItemId, byte[] imageData, string contentType);
Task<(bool Success, string? Error)> DeleteFileAsync(string bucket, string filePath);
Task<(bool Success, string? Error)> DeleteChefImageAsync(string chefId);
Task<(bool Success, string? Error)> DeleteMenuItemImageAsync(string menuItemId);
string GetPublicUrl(string bucket, string filePath);
Task<(bool Success, List<string>? Files, string? Error)> ListFilesAsync(string bucket, string prefix = "");
```

### 3. Supabase Realtime Service

**Location**: `api-server/src/NaarNoor.Infrastructure/Services/SupabaseRealtimeService.cs`

Features:
- Real-time order status updates
- Real-time reservation changes
- Real-time review notifications
- Table availability broadcasts
- Channel subscriptions and messaging

**Interface**: `ISupabaseRealtimeService`

**Subscriptions**:
- Order updates: `public:Orders:id=eq.{orderId}`
- Reservation updates: `public:Reservations:id=eq.{reservationId}`
- Review updates: `public:Reviews:menuItemId=eq.{menuItemId}`
- Table availability: `public:Reservations`

**Methods**:
```csharp
Task SubscribeToOrderUpdatesAsync(string orderId, Func<dynamic, Task> onUpdate, Func<Exception, Task> onError);
Task SubscribeToReservationUpdatesAsync(string reservationId, Func<dynamic, Task> onUpdate, Func<Exception, Task> onError);
Task SubscribeToReviewUpdatesAsync(string menuItemId, Func<dynamic, Task> onUpdate, Func<Exception, Task> onError);
Task SubscribeToTableAvailabilityAsync(Func<dynamic, Task> onUpdate, Func<Exception, Task> onError);
Task UnsubscribeAsync(string subscriptionId);
Task BroadcastMessageAsync(string channel, string eventName, dynamic payload);
bool IsConnected { get; }
Task ReconnectAsync();
```

## Database Entity Compatibility

No entity code changes are required. Entity Framework Core 8.0.11 with Npgsql handles database differences automatically:

**Entities**:
- `Reservation` - Fully compatible
- `MenuItem` - Fully compatible
- `Chef` - Fully compatible
- `Review` - Fully compatible
- `ContactInquiry` - Fully compatible
- `Order` - Fully compatible
- `OrderItem` - Fully compatible

**Enums**:
- `MenuCategory` - Fully compatible
- `OrderStatus` - Fully compatible
- `OrderType` - Fully compatible
- `ReservationStatus` - Fully compatible

## Setup Steps

### 1. Environment Variables

Copy `.env.example` to `.env` and update:

```bash
POSTGRESQL_CONNECTION_STRING=Host=db.uyzocpvytoljigmcpafn.supabase.co;Port=5432;Database=postgres;User Id=postgres;Password=YOUR_ACTUAL_PASSWORD;
SUPABASE_URL=https://uyzocpvytoljigmcpafn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

### 2. Database Migration

Run EF Core migrations:

```bash
cd api-server
dotnet ef database update --project src/NaarNoor.Infrastructure
```

### 3. Supabase Storage Buckets

Create two public storage buckets:

1. **chef-images**: For chef profile photos
2. **menu-item-images**: For menu item photos

### 4. Dependency Injection

All services are automatically registered in `DependencyInjection.cs`:

```csharp
services.AddScoped<ISupabaseAuthService, SupabaseAuthService>();
services.AddScoped<ISupabaseStorageService, SupabaseStorageService>();
services.AddScoped<ISupabaseRealtimeService, SupabaseRealtimeService>();
```

### 5. Usage Examples

#### Authentication
```csharp
var authService = serviceProvider.GetRequiredService<ISupabaseAuthService>();
var (success, token, error) = await authService.LoginUserAsync("user@example.com", "password");

if (success)
{
    // Use token for API calls
}
```

#### Storage
```csharp
var storageService = serviceProvider.GetRequiredService<ISupabaseStorageService>();
var (success, publicUrl, error) = await storageService.UploadChefImageAsync(chefId, imageBytes, "image/jpeg");

if (success)
{
    // Store publicUrl in database
    chef.ImageUrl = publicUrl;
}
```

#### Realtime
```csharp
var realtimeService = serviceProvider.GetRequiredService<ISupabaseRealtimeService>();

await realtimeService.SubscribeToOrderUpdatesAsync(
    orderId,
    async (payload) => {
        // Handle order updates
        Console.WriteLine($"Order updated: {payload}");
    },
    async (error) => {
        // Handle errors
        Console.WriteLine($"Error: {error.Message}");
    }
);
```

## Database Schema Notes

### PostgreSQL Compatibility

- **Sequences**: PostgreSQL uses sequences for auto-increment (supported by EF Core)
- **String Types**: `nvarchar` → `character varying` (handled by EF Core)
- **Boolean**: `bit` → `boolean`
- **DateTime**: `datetime2` → `timestamp`
- **GUIDs**: `uniqueidentifier` → `uuid`
- **Decimal**: `decimal(18,2)` → `numeric(18,2)`

### Entity Framework Core Considerations

1. **Migrations**: Create new migrations for PostgreSQL-specific types
2. **Functions**: Some SQL Server functions have PostgreSQL equivalents
3. **Constraints**: All constraints are preserved and compatible
4. **Indices**: All indices are preserved and compatible

## Deployment

### Docker

Update `api-server/Dockerfile` connection string environment variables to use Supabase credentials.

### Kubernetes

Update `k8s/backend-deployment.yaml` to inject Supabase credentials as secrets:

```yaml
env:
- name: POSTGRESQL_CONNECTION_STRING
  valueFrom:
    secretKeyRef:
      name: supabase-secrets
      key: connection-string
```

### CI/CD Workflows

Update GitHub Actions workflows (`.github/workflows/`) to include Supabase credentials in environment variables during deployment.

## Troubleshooting

### Connection Issues
1. Verify Supabase credentials are correct
2. Check firewall rules allow connections to `db.uyzocpvytoljigmcpafn.supabase.co:5432`
3. Test connection with psql: `psql -h db.uyzocpvytoljigmcpafn.supabase.co -U postgres -d postgres`

### EF Core Migration Issues
1. Clear pending migrations: `dotnet ef migrations remove`
2. Create fresh migration: `dotnet ef migrations add InitialSupabaseMigration`
3. Update database: `dotnet ef database update`

### Realtime Connection Issues
1. Verify Supabase Realtime is enabled in project settings
2. Check network allows WebSocket connections
3. Review Supabase logs for connection errors

### Storage Issues
1. Verify buckets exist and are set to public
2. Check RLS (Row Level Security) policies allow public access
3. Test with curl: `curl https://storage.supabase.co/object/public/chef-images/{path}`

## Rollback Plan

If issues occur:

1. Keep SQL Server connection string accessible
2. Revert to `Microsoft.EntityFrameworkCore.SqlServer` package
3. Update `DependencyInjection.cs` to use `UseSqlServer()`
4. Revert appsettings.json connection string
5. Run `dotnet ef database update` to revert migrations

## Next Steps

1. ✅ Backend Infrastructure - Database, Auth, Storage, Realtime
2. ⏳ Frontend Integration - Auth UI, Image Upload, Real-time Updates
3. ⏳ API Endpoints - Authentication endpoints, Storage endpoints, Realtime endpoints
4. ⏳ Testing - Integration tests with Supabase
5. ⏳ Documentation - API documentation with Supabase features

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Entity Framework Core PostgreSQL Provider](https://www.npgsql.org/efcore/)
- [Supabase C# Client](https://github.com/supabase-community/supabase-csharp)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
