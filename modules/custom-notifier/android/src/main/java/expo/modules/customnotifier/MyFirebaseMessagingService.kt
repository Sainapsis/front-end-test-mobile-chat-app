package expo.modules.customnotifier

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import java.util.concurrent.atomic.AtomicInteger

// Define CHANNEL_ID at the top level or ensure it's accessible
private const val CHANNEL_ID = "custom_notifier_channel"
private const val TAG = "MyFirebaseMsgService"

class MyFirebaseMessagingService : FirebaseMessagingService() {

    private val notificationId = AtomicInteger(0)

    /**
     * Called when message is received.
     *
     * @param remoteMessage Object representing the message received from Firebase Cloud Messaging.
     */
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        Log.d(TAG, "From: ${remoteMessage.from}")

        // Data messages are handled here in onMessageReceived whether the app is in the foreground or background.
        // Data messages are the type traditionally used with FCM.
        if (remoteMessage.data.isNotEmpty()) {
            Log.d(TAG, "Message data payload: ${remoteMessage.data}")
            handleDataMessage(remoteMessage)
            // Optionally: If you want data-only messages to ALSO show a notification, build one here.
        }

        // Notification messages are only received here in onMessageReceived when the app
        // is in the foreground. When the app is in the background an automatically generated notification is displayed.
        // When the user taps on the notification they are returned to the app.
        // Messages containing both notification and data payloads are treated as notification messages.
        // The Firebase console always sends notification messages.
        remoteMessage.notification?.let {
            Log.d(TAG, "Message Notification Body: ${it.body}")
            // If the app is in the foreground, you might want to show a custom in-app notification
            // or just send the event to JS. If you want the OS to handle it like background,
            // you can generate the notification yourself here.
            sendNotification(it.title, it.body, remoteMessage.data)

            // Also send event to JS layer for foreground handling
             val eventData = mutableMapOf<String, Any?>()
             eventData["title"] = it.title
             eventData["body"] = it.body
             eventData["data"] = remoteMessage.data.toMap() // Convert data payload
             // Consider adding messageId, sentTime etc. if needed
             // eventData["messageId"] = remoteMessage.messageId
             CustomNotifierModule.sendNotificationReceivedEvent(applicationContext, eventData)
        }
    }

    /**
     * Called if the FCM registration token is updated. This may occur if the previous token had expired,
     * the app deletes Instance ID data, or the app is restored on a new device.
     * You should send the new token to your application server.
     */
    override fun onNewToken(token: String) {
        Log.d(TAG, "Refreshed token: $token")

        // If you want to send the token to JS or your server, do it here.
        CustomNotifierModule.sendTokenRefreshEvent(applicationContext, token)
        sendRegistrationToServer(token)
    }

    /**
     * Handle time allotted to BroadcastReceivers.
     * Can be used for long running tasks based on message data.
     */
    private fun handleDataMessage(remoteMessage: RemoteMessage) {
        Log.d(TAG, "Handling data message")
        
        val data = remoteMessage.data
        
        // Send event to JS layer if app is in foreground
        val eventData = data.toMap()
        CustomNotifierModule.sendNotificationReceivedEvent(applicationContext, eventData)
        
        // For background processing, send a broadcast intent
        // This will be picked up by the main application which can start a headless task
        val intent = Intent("com.firebase.messaging.NEW_MESSAGE")
        
        // Add data from remote message to intent
        val bundle = Bundle()
        remoteMessage.data.forEach { (key, value) ->
            bundle.putString(key, value)
        }
        
        // Add message metadata
        remoteMessage.messageId?.let { bundle.putString("messageId", it) }
        remoteMessage.collapseKey?.let { bundle.putString("collapseKey", it) }
        bundle.putString("from", remoteMessage.from ?: "")
        bundle.putLong("sentTime", remoteMessage.sentTime)
        bundle.putString("to", remoteMessage.to ?: "")
        
        // Set the action for special handling
        bundle.putString("action", "ReactNativeFirebaseMessagingHeadlessTask")
        
        intent.putExtras(bundle)
        
        // We need to set package to make sure this is delivered to our app
        intent.setPackage(applicationContext.packageName)
        
        Log.d(TAG, "Broadcasting message for headless task processing")
        applicationContext.sendBroadcast(intent)
    }

    /**
     * Persist token to third-party servers. Modify this method to associate the
     * user's FCM registration token with any server-side account maintained by your application.
     *
     * @param token The new token.
     */
    private fun sendRegistrationToServer(token: String?) {
        // TODO: Implement this method to send token to your app server.
        Log.d(TAG, "sendRegistrationToServer($token)")
    }

    /**
     * Create and show a simple notification containing the received FCM message.
     * This is used when a notification payload is received while the app is in the foreground,
     * or potentially for data-only messages if you choose to display them.
     *
     * @param messageBody FCM message body received.
     * @param messageTitle FCM message title received.
     * @param data FCM data payload.
     */
    private fun sendNotification(messageTitle: String?, messageBody: String?, data: Map<String, String>) {
        val intent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
            // Add data from the FCM message to the Intent
            // This data will be available in the Activity when the notification is tapped
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("notification_data", HashMap(data)) // Pass data payload
             // You might want to add specific flags or actions based on the notification content
             // e.g., putExtra("screenToOpen", data["screen"])
        }

        // Using a unique request code for each notification PendingIntent
        // Important if you need different intents for different notifications
        val requestCode = notificationId.incrementAndGet()

        val pendingIntentFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_ONE_SHOT
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            requestCode, // Unique request code
            intent,
            pendingIntentFlags
        )

        val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        val notificationBuilder = NotificationCompat.Builder(this, CHANNEL_ID)
            // Revert to using a default Android system icon
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(messageTitle ?: "Notification")
            .setContentText(messageBody)
            .setAutoCancel(true)
            .setSound(defaultSoundUri)
            .setContentIntent(pendingIntent) // Set the intent that will fire when the user taps the notification
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
             // Add actions if needed
             // .addAction(R.drawable.ic_action_name, "Action Text", actionPendingIntent)

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Since android Oreo notification channel is needed.
        // Ensure the channel is created (ideally in Application class or Module setup)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = notificationManager.getNotificationChannel(CHANNEL_ID)
             if (channel == null) {
                 // Log error or attempt creation? Channel should exist from module init.
                 Log.e(TAG, "Notification channel $CHANNEL_ID not found!")
                 // Optionally create it here as a fallback, though it's better practice elsewhere
                 // val name = "Default Channel"
                 // val descriptionText = "Channel for default app notifications"
                 // val importance = NotificationManager.IMPORTANCE_DEFAULT
                 // val fallbackChannel = NotificationChannel(CHANNEL_ID, name, importance).apply { description = descriptionText }
                 // notificationManager.createNotificationChannel(fallbackChannel)
                 // Log.w(TAG, "Created fallback notification channel $CHANNEL_ID.")
            }
        }

        // Use a unique ID for each notification to ensure they don't overwrite each other
        notificationManager.notify(notificationId.incrementAndGet(), notificationBuilder.build())
    }

    // Helper to convert Map<String, String> to Map<String, Any?>
    // Needed because RemoteMessage.data is Map<String, String>
    fun Map<String, String>.toMap(): Map<String, Any?> {
        return this.mapValues { it.value as Any? }
    }
} 