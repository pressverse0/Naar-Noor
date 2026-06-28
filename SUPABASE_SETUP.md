# Supabase Integration Guide

## Quick Start

This guide covers the complete Supabase integration for Naar-Noor restaurant app with PostgreSQL database, authentication, storage, and realtime features.

### Prerequisites

- .NET 8.0 SDK
- PostgreSQL client tools (psql) - optional
- Supabase account and project credentials

### Supabase Project Credentials

Your Supabase project has been created with:
- **URL**: https://uyzocpvytoljigmcpafn.supabase.co
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5em9jcHZ5dG9samlnbWNwYWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1OTc0MzYsImV4cCI6MjA5ODE3MzQzNn0.Atyx6bnxSHNti8OAEim7qHwXbLJftU-1BxaNVXsQc3M
- **Database Host**: db.uyzocpvytoljigmcpafn.supabase.co:5432

## Configuration

### 1. Environment Variables

Create `.env` in root directory or set system environment variables:

```bash
# Database
POSTGRESQL_CONNECTION_STRING=Host=db.uyzocpvytoljigmcpafn.supabase.co;Port=5432;Database=postgres;User Id=postgres;Password=YOUR_ACTUAL_DB_PASSWORD;

# Supabase REST API
SUPABASE_URL=https://uyzocpvytoljigmcpafn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

### 2. Configuration Files

Update `api-server/src/NaarNoor.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.uyzocpvytoljigmcpafn.supabase.co;Port=5432;Database=postgres;User Id=postgres;Password=YOUR_PASSWORD;",
    "SupabasePostgresql": "Host=db.uyzocpvytoljigmcpafn.supabase.co;Port=5432;Database=postgres;User Id=postgres;Password=YOUR_PASSWORD;"
  },
  "Supabase": {
    "Url": "https://uyzocpvytoljigmcpafn.supabase.co",
    "AnonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "ServiceRoleKey": "YOUR_SERVICE_ROLE_KEY"
  }
}
```

## Migration Steps

### Step 1: Update Dependencies

All NuGet packages have been updated:
- ✅ Removed: `Microsoft.EntityFrameworkCore.SqlServer`
- ✅ Added: `Npgsql.EntityFrameworkCore.PostgreSQL`
- ✅ Added: `Microsoft.Extensions.Http`

### Step 2: Run Database Migration

Create and apply the initial PostgreSQL migration:

```bash
cd api-server

# Create initial migration (done - InitialSupabaseMigration)
dotnet ef migrations add InitialSupabaseMigration --project src/NaarNoor.Infrastructure

# Apply migration to database
dotnet ef database update --project src/NaarNoor.Infrastructure
```

### Step 3: Create Supabase Storage Buckets

Navigate to Supabase Dashboard → Storage and create two public buckets:

1. **chef-images**
   - Make public: Yes
   - File size limit: 50 MB
   - Allowed MIME types: image/*

2. **menu-item-images**
   - Make public: Yes
   - File size limit: 50 MB
   - Allowed MIME types: image/*

### Step 4: Configure Row Level Security (Optional)

For production, enable RLS policies to secure data access. See Supabase documentation.

## Services Implemented

### 1. Authentication Service (`ISupabaseAuthService`)

**Location**: `api-server/src/NaarNoor.Infrastructure/Services/SupabaseAuthService.cs`

Available methods:
- `RegisterUserAsync(email, password)` - Create new account
- `LoginUserAsync(email, password)` - Authenticate user
- `LogoutUserAsync(userId)` - End session
- `VerifyTokenAsync(token)` - Validate JWT
- `GetCurrentUserAsync(token)` - Retrieve user info
- `UpdateUserEmailAsync(userId, email)` - Change email
- `UpdateUserPasswordAsync(userId, password)` - Change password
- `ResetPasswordAsync(email)` - Send password reset email

**Example Usage**:

```csharp
private readonly ISupabaseAuthService _authService;

public async Task<IActionResult> Login(LoginRequest request)
{
    var (success, token, error) = await _authService.LoginUserAsync(request.Email, request.Password);
    
    if (!success)
        return BadRequest(new { message = error });
    
    return Ok(new { token });
}
```

### 2. Storage Service (`ISupabaseStorageService`)

**Location**: `api-server/src/NaarNoor.Infrastructure/Services/SupabaseStorageService.cs`

Available methods:
- `UploadImageAsync(bucket, fileName, data, contentType)` - Upload to any bucket
- `UploadChefImageAsync(chefId, data, contentType)` - Chef profile image
- `UploadMenuItemImageAsync(itemId, data, contentType)` - Menu item image
- `DeleteFileAsync(bucket, path)` - Remove file
- `DeleteChefImageAsync(chefId)` - Remove all chef images
- `DeleteMenuItemImageAsync(itemId)` - Remove all item images
- `GetPublicUrl(bucket, path)` - Get public URL
- `ListFilesAsync(bucket, prefix)` - List bucket contents

**Example Usage**:

```csharp
private readonly ISupabaseStorageService _storageService;

public async Task<IActionResult> UploadChefImage(IFormFile file, string chefId)
{
    using var stream = file.OpenReadStream();
    using var ms = new MemoryStream();
    await stream.CopyToAsync(ms);
    
    var (success, publicUrl, error) = await _storageService.UploadChefImageAsync(
        chefId, 
        ms.ToArray(), 
        file.ContentType
    );
    
    if (!success)
        return BadRequest(new { message = error });
    
    return Ok(new { imageUrl = publicUrl });
}
```

### 3. Realtime Service (`ISupabaseRealtimeService`)

**Location**: `api-server/src/NaarNoor.Infrastructure/Services/SupabaseRealtimeService.cs`

**Note**: Realtime subscriptions are typically handled client-side via Supabase JS library. Server-side implementation supports:

- `SubscribeToOrderUpdatesAsync(orderId, onUpdate, onError)` - Order status changes
- `SubscribeToReservationUpdatesAsync(resId, onUpdate, onError)` - Reservation updates
- `SubscribeToReviewUpdatesAsync(itemId, onUpdate, onError)` - New reviews
- `SubscribeToTableAvailabilityAsync(onUpdate, onError)` - Table availability
- `UnsubscribeAsync(subscriptionId)` - End subscription
- `BroadcastMessageAsync(channel, event, payload)` - Send message
- `IsConnected` property - Connection status

**Example Usage** (typically frontend):

```javascript
// Frontend using @supabase/realtime-js
import { RealtimeClient } from '@supabase/realtime-js';

const realtimeClient = new RealtimeClient(SUPABASE_URL);
const subscription = realtimeClient.channel('orders:123')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Orders' }, payload => {
    console.log('Order updated:', payload);
  })
  .subscribe();
```

## Database Schema

The following entities have been migrated to PostgreSQL:

- **Reservations** - Table bookings
- **MenuItems** - Restaurant menu
- **Chefs** - Chef profiles
- **Reviews** - Customer reviews
- **ContactInquiries** - Contact form submissions
- **Orders** - Food orders
- **OrderItems** - Order line items

All entities maintain audit fields:
- `CreatedAt` - Created timestamp
- `UpdatedAt` - Last modified timestamp

## API Endpoints (To Be Implemented)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Current user

### Chef Management
- `POST /api/chefs/{id}/upload-image` - Upload chef image
- `GET /api/chefs/{id}/image` - Get chef image URL
- `DELETE /api/chefs/{id}/image` - Delete chef image

### Menu Management
- `POST /api/menu/{id}/upload-image` - Upload menu item image
- `GET /api/menu/{id}/image` - Get menu item image URL
- `DELETE /api/menu/{id}/image` - Delete menu item image

## Testing

### Test Database Connection

```bash
# From api-server directory
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=db.uyzocpvytoljigmcpafn.supabase.co;Port=5432;Database=postgres;User Id=postgres;Password=YOUR_PASSWORD;"

# Run migrations
dotnet ef database update --project src/NaarNoor.Infrastructure
```

### Test Services

Create unit tests for each service:

```csharp
[TestClass]
public class SupabaseAuthServiceTests
{
    private ISupabaseAuthService _authService;
    private HttpClient _httpClient;
    private SupabaseConfig _config;

    [TestInitialize]
    public void Setup()
    {
        _httpClient = new HttpClient();
        _config = new SupabaseConfig 
        { 
            Url = "https://uyzocpvytoljigmcpafn.supabase.co",
            AnonKey = "YOUR_ANON_KEY"
        };
        _authService = new SupabaseAuthService(_httpClient, _config, LoggerFactory.Create(x => {}).CreateLogger<SupabaseAuthService>());
    }

    [TestMethod]
    public async Task RegisterUserAsync_WithValidCredentials_ReturnsUserId()
    {
        var (success, userId, error) = await _authService.RegisterUserAsync("test@example.com", "password123");
        Assert.IsTrue(success);
        Assert.IsNotNull(userId);
    }
}
```

## Docker & Kubernetes

### Docker Environment

Update `docker-compose.yml` to use Supabase PostgreSQL:

```yaml
environment:
  POSTGRESQL_CONNECTION_STRING: "Host=db.uyzocpvytoljigmcpafn.supabase.co;Port=5432;Database=postgres;User Id=postgres;Password=${DB_PASSWORD};"
```

### Kubernetes Deployment

Update `k8s/backend-deployment.yaml`:

```yaml
env:
- name: POSTGRESQL_CONNECTION_STRING
  valueFrom:
    secretKeyRef:
      name: supabase-secrets
      key: connection-string
- name: SUPABASE_URL
  valueFrom:
    secretKeyRef:
      name: supabase-secrets
      key: url
- name: SUPABASE_ANON_KEY
  valueFrom:
    secretKeyRef:
      name: supabase-secrets
      key: anon-key
```

Create Kubernetes secret:

```bash
kubectl create secret generic supabase-secrets \
  --from-literal=connection-string="Host=db.uyzocpvytoljigmcpafn.supabase.co;..." \
  --from-literal=url="https://uyzocpvytoljigmcpafn.supabase.co" \
  --from-literal=anon-key="eyJhbGc..."
```

## Troubleshooting

### Connection Issues

**Error**: `Unable to connect to PostgreSQL`

**Solution**:
1. Verify credentials are correct
2. Check firewall allows outbound connection to `db.uyzocpvytoljigmcpafn.supabase.co:5432`
3. Test connection with psql:
   ```bash
   psql -h db.uyzocpvytoljigmcpafn.supabase.co -U postgres -d postgres
   ```

### Migration Failures

**Error**: `DbContext configuration missing`

**Solution**:
- Ensure `ApplicationDbContextFactory` is present
- Set `POSTGRESQL_CONNECTION_STRING` environment variable
- Run: `dotnet ef database update --project src/NaarNoor.Infrastructure`

### Service Registration Issues

**Error**: `Unable to resolve ISupabaseAuthService`

**Solution**:
- Verify services are registered in `DependencyInjection.cs`
- Check `appsettings.json` has Supabase configuration
- Ensure `SupabaseConfig` is registered as singleton

## Next Steps

1. ✅ Database migration (PostgreSQL)
2. ✅ Authentication service (REST API)
3. ✅ Storage service (File uploads)
4. ✅ Realtime service (WebSocket subscriptions)
5. ⏳ Create API endpoints for auth
6. ⏳ Create API endpoints for file uploads
7. ⏳ Implement frontend auth UI
8. ⏳ Implement frontend image upload
9. ⏳ Implement frontend realtime updates
10. ⏳ Add unit tests
11. ⏳ Add integration tests

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Npgsql Entity Framework Core Provider](https://www.npgsql.org/efcore/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Authentication](https://tools.ietf.org/html/rfc7519)
- [REST API Best Practices](https://restfulapi.net/)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase documentation
3. Check migration files for SQL errors
4. Review application logs

## Rollback Instructions

To revert to SQL Server (if needed):

```bash
# 1. Restore SQL Server NuGet package
# Update NaarNoor.Infrastructure.csproj:
# Remove: Npgsql.EntityFrameworkCore.PostgreSQL
# Add: Microsoft.EntityFrameworkCore.SqlServer

# 2. Restore DependencyInjection.cs
# Change: UseNpgsql() → UseSqlServer()

# 3. Restore appsettings.json connection string
# Set to SQL Server connection string

# 4. Create migration
dotnet ef migrations add RevertToSqlServer --project src/NaarNoor.Infrastructure

# 5. Update database
dotnet ef database update --project src/NaarNoor.Infrastructure
```
