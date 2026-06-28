using Microsoft.Extensions.Logging;
using NaarNoor.Application.Common.Interfaces;
using System.Text;
using System.Text.Json;

namespace NaarNoor.Infrastructure.Services;

/// <summary>
/// Implements Supabase Storage Service using REST API
/// Manages file uploads and retrieval for chef and menu item images
/// </summary>
public class SupabaseStorageService : ISupabaseStorageService
{
    private readonly HttpClient _httpClient;
    private readonly SupabaseConfig _config;
    private readonly ILogger<SupabaseStorageService> _logger;

    private const string ChefImagesBucket = "chef-images";
    private const string MenuItemImagesBucket = "menu-item-images";

    public SupabaseStorageService(HttpClient httpClient, SupabaseConfig config, ILogger<SupabaseStorageService> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _logger = logger;
    }

    private string GetStorageUrl() => $"{_config.Url}/storage/v1";

    public async Task<(bool Success, string? PublicUrl, string? Error)> UploadImageAsync(string bucket, string fileName, byte[] fileData, string contentType)
    {
        try
        {
            _logger.LogInformation("Uploading image to bucket: {Bucket}, file: {FileName}", bucket, fileName);
            
            var request = new HttpRequestMessage(HttpMethod.Post, $"{GetStorageUrl()}/object/{bucket}/{fileName}");
            request.Headers.Add("Authorization", $"Bearer {_config.AnonKey}");
            request.Content = new ByteArrayContent(fileData);
            request.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);
            
            var response = await _httpClient.SendAsync(request);
            
            if (!response.IsSuccessStatusCode)
                return (false, null, await response.Content.ReadAsStringAsync());

            var publicUrl = GetPublicUrl(bucket, fileName);
            _logger.LogInformation("Image uploaded successfully to {Bucket}/{Path}", bucket, fileName);
            return (true, publicUrl, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading image to bucket: {Bucket}", bucket);
            return (false, null, ex.Message);
        }
    }

    public async Task<(bool Success, string? PublicUrl, string? Error)> UploadChefImageAsync(string chefId, byte[] imageData, string contentType)
    {
        try
        {
            _logger.LogInformation("Uploading chef image for chef: {ChefId}", chefId);
            
            var fileName = $"{chefId}/{Guid.NewGuid()}.jpg";
            var result = await UploadImageAsync(ChefImagesBucket, fileName, imageData, contentType);

            if (!result.Success)
                return result;

            _logger.LogInformation("Chef image uploaded successfully for chef: {ChefId}", chefId);
            return (true, result.PublicUrl, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading chef image for chef: {ChefId}", chefId);
            return (false, null, ex.Message);
        }
    }

    public async Task<(bool Success, string? PublicUrl, string? Error)> UploadMenuItemImageAsync(string menuItemId, byte[] imageData, string contentType)
    {
        try
        {
            _logger.LogInformation("Uploading menu item image for item: {MenuItemId}", menuItemId);
            
            var fileName = $"{menuItemId}/{Guid.NewGuid()}.jpg";
            var result = await UploadImageAsync(MenuItemImagesBucket, fileName, imageData, contentType);

            if (!result.Success)
                return result;

            _logger.LogInformation("Menu item image uploaded successfully for item: {MenuItemId}", menuItemId);
            return (true, result.PublicUrl, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading menu item image for item: {MenuItemId}", menuItemId);
            return (false, null, ex.Message);
        }
    }

    public async Task<(bool Success, string? Error)> DeleteFileAsync(string bucket, string filePath)
    {
        try
        {
            _logger.LogInformation("Deleting file from bucket: {Bucket}, path: {FilePath}", bucket, filePath);
            
            var request = new HttpRequestMessage(HttpMethod.Delete, $"{GetStorageUrl()}/object/{bucket}/{filePath}");
            request.Headers.Add("Authorization", $"Bearer {_config.AnonKey}");
            
            var response = await _httpClient.SendAsync(request);
            
            if (!response.IsSuccessStatusCode)
                return (false, await response.Content.ReadAsStringAsync());

            _logger.LogInformation("File deleted successfully from {Bucket}/{FilePath}", bucket, filePath);
            return (true, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file from bucket: {Bucket}, path: {FilePath}", bucket, filePath);
            return (false, ex.Message);
        }
    }

    public async Task<(bool Success, string? Error)> DeleteChefImageAsync(string chefId)
    {
        try
        {
            _logger.LogInformation("Deleting chef image for chef: {ChefId}", chefId);
            
            var files = await ListFilesAsync(ChefImagesBucket, chefId);
            
            if (!files.Success || files.Files == null || files.Files.Count == 0)
                return (true, null); // No images to delete

            foreach (var file in files.Files)
            {
                await DeleteFileAsync(ChefImagesBucket, file);
            }

            _logger.LogInformation("Chef images deleted successfully for chef: {ChefId}", chefId);
            return (true, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting chef images for chef: {ChefId}", chefId);
            return (false, ex.Message);
        }
    }

    public async Task<(bool Success, string? Error)> DeleteMenuItemImageAsync(string menuItemId)
    {
        try
        {
            _logger.LogInformation("Deleting menu item image for item: {MenuItemId}", menuItemId);
            
            var files = await ListFilesAsync(MenuItemImagesBucket, menuItemId);
            
            if (!files.Success || files.Files == null || files.Files.Count == 0)
                return (true, null); // No images to delete

            foreach (var file in files.Files)
            {
                await DeleteFileAsync(MenuItemImagesBucket, file);
            }

            _logger.LogInformation("Menu item images deleted successfully for item: {MenuItemId}", menuItemId);
            return (true, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting menu item images for item: {MenuItemId}", menuItemId);
            return (false, ex.Message);
        }
    }

    public string GetPublicUrl(string bucket, string filePath)
    {
        return $"{_config.Url}/storage/v1/object/public/{bucket}/{filePath}";
    }

    public async Task<(bool Success, List<string>? Files, string? Error)> ListFilesAsync(string bucket, string prefix = "")
    {
        try
        {
            _logger.LogInformation("Listing files in bucket: {Bucket}, prefix: {Prefix}", bucket, prefix);
            
            var request = new HttpRequestMessage(HttpMethod.Get, $"{GetStorageUrl()}/object/list/{bucket}");
            request.Headers.Add("Authorization", $"Bearer {_config.AnonKey}");
            
            var response = await _httpClient.SendAsync(request);
            
            if (!response.IsSuccessStatusCode)
                return (false, null, await response.Content.ReadAsStringAsync());

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            
            var fileNames = new List<string>();
            if (root.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in root.EnumerateArray())
                {
                    if (item.TryGetProperty("name", out var name))
                    {
                        var fileName = name.GetString();
                        if (!string.IsNullOrEmpty(fileName) && (string.IsNullOrEmpty(prefix) || fileName.StartsWith(prefix)))
                        {
                            fileNames.Add(fileName);
                        }
                    }
                }
            }
            
            _logger.LogInformation("Listed {FileCount} files in bucket: {Bucket}", fileNames.Count, bucket);
            return (true, fileNames, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing files in bucket: {Bucket}", bucket);
            return (false, null, ex.Message);
        }
    }
}
