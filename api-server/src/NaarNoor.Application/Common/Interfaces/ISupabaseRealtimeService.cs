namespace NaarNoor.Application.Common.Interfaces;

/// <summary>
/// Supabase Realtime Service Interface
/// Manages real-time subscriptions for order status updates, reservations, and reviews
/// </summary>
public interface ISupabaseRealtimeService
{
    /// <summary>
    /// Subscribe to order status changes
    /// </summary>
    Task SubscribeToOrderUpdatesAsync(string orderId, Func<dynamic, Task> onUpdate, Func<Exception, Task> onError);

    /// <summary>
    /// Subscribe to reservation changes
    /// </summary>
    Task SubscribeToReservationUpdatesAsync(string reservationId, Func<dynamic, Task> onUpdate, Func<Exception, Task> onError);

    /// <summary>
    /// Subscribe to new reviews for a menu item
    /// </summary>
    Task SubscribeToReviewUpdatesAsync(string menuItemId, Func<dynamic, Task> onUpdate, Func<Exception, Task> onError);

    /// <summary>
    /// Subscribe to table availability changes
    /// </summary>
    Task SubscribeToTableAvailabilityAsync(Func<dynamic, Task> onUpdate, Func<Exception, Task> onError);

    /// <summary>
    /// Unsubscribe from a specific subscription
    /// </summary>
    Task UnsubscribeAsync(string subscriptionId);

    /// <summary>
    /// Broadcast a message to a channel
    /// </summary>
    Task BroadcastMessageAsync(string channel, string eventName, dynamic payload);

    /// <summary>
    /// Check connection status
    /// </summary>
    bool IsConnected { get; }

    /// <summary>
    /// Reconnect to realtime service
    /// </summary>
    Task ReconnectAsync();
}
