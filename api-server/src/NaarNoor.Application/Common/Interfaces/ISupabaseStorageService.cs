namespace NaarNoor.Application.Common.Interfaces;

/// <summary>
/// Supabase Storage Service Interface
/// Manages file uploads and retrieval for chefs and menu items
/// </summary>
public interface ISupabaseStorageService
{
    /// <summary>
    /// Upload image file to Supabase Storage
    /// </summary>
    Task<(bool Success, string? PublicUrl, string? Error)> UploadImageAsync(string bucket, string fileName, byte[] fileData, string contentType);

    /// <summary>
    /// Upload chef profile image
    /// </summary>
    Task<(bool Success, string? PublicUrl, string? Error)> UploadChefImageAsync(string chefId, byte[] imageData, string contentType);

    /// <summary>
    /// Upload menu item image
    /// </summary>
    Task<(bool Success, string? PublicUrl, string? Error)> UploadMenuItemImageAsync(string menuItemId, byte[] imageData, string contentType);

    /// <summary>
    /// Delete file from storage
    /// </summary>
    Task<(bool Success, string? Error)> DeleteFileAsync(string bucket, string filePath);

    /// <summary>
    /// Delete chef image
    /// </summary>
    Task<(bool Success, string? Error)> DeleteChefImageAsync(string chefId);

    /// <summary>
    /// Delete menu item image
    /// </summary>
    Task<(bool Success, string? Error)> DeleteMenuItemImageAsync(string menuItemId);

    /// <summary>
    /// Get public URL for a file
    /// </summary>
    string GetPublicUrl(string bucket, string filePath);

    /// <summary>
    /// List files in a bucket
    /// </summary>
    Task<(bool Success, List<string>? Files, string? Error)> ListFilesAsync(string bucket, string prefix = "");
}
