package expo.modules.customnotifier

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import android.app.Activity
import androidx.core.app.ActivityCompat
import android.util.Log
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.exception.Exceptions
import java.net.URL
import java.util.UUID

private const val CHANNEL_ID = "custom_notifier_channel"
private const val SILENT_CHANNEL_ID = "custom_notifier_silent_channel"
private const val PERMISSION_REQUEST_CODE = 123
private const val TAG = "CustomNotifierModule"
private const val NOTIFICATION_PRESSED_ACTION = "expo.modules.customnotifier.NOTIFICATION_PRESSED"

class CustomNotifierModule : Module() {
  private val context
    get() = requireNotNull(appContext.reactContext)

  private val currentActivity: Activity?
    get() = appContext.activityProvider?.currentActivity

  private val notificationManager
    get() = NotificationManagerCompat.from(context)

  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('CustomNotifier')` in JavaScript.
    Name("CustomNotifier")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants(
      "PI" to Math.PI
    )

    // Defines event names that the module can send to JavaScript.
    Events("onNotificationReceived", "onNotificationPressed")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      "Hello world! 👋"
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("requestPermissions") { promise: Promise ->
      try {
        Log.d(TAG, "Starting permission request process")
        createNotificationChannel()
        createSilentNotificationChannel()
        Log.d(TAG, "Notification channels created")

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
          Log.d(TAG, "Device is Android 13 or higher, checking POST_NOTIFICATIONS permission")
          val permission = android.Manifest.permission.POST_NOTIFICATIONS
          val granted = ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED
          Log.d(TAG, "Current permission status: $granted")
          
          if (!granted) {
            val activity = currentActivity
            if (activity == null) {
              Log.e(TAG, "Activity is null, cannot request permissions")
              promise.reject(
                "ACTIVITY_NULL",
                "No activity found to request permissions",
                Exception("Activity is null")
              )
              return@AsyncFunction
            }

            val shouldShowRationale = ActivityCompat.shouldShowRequestPermissionRationale(activity, permission)
            Log.d(TAG, "Should show permission rationale: $shouldShowRationale")

            if (shouldShowRationale) {
              Log.d(TAG, "User previously denied permission, showing rationale")
              promise.reject(
                "PERMISSION_DENIED",
                "User previously denied notification permissions",
                Exception("Permission previously denied")
              )
              return@AsyncFunction
            }

            try {
              Log.d(TAG, "Requesting POST_NOTIFICATIONS permission")
              ActivityCompat.requestPermissions(
                activity,
                arrayOf(permission),
                PERMISSION_REQUEST_CODE
              )
              Log.d(TAG, "Permission request dialog shown")
              promise.resolve(false)
            } catch (e: Exception) {
              Log.e(TAG, "Failed to request permissions", e)
              promise.reject(
                "PERMISSION_REQUEST_FAILED",
                "Failed to request notification permissions: ${e.localizedMessage}",
                e
              )
            }
            return@AsyncFunction
          }
          Log.d(TAG, "Permission already granted")
          promise.resolve(granted)
          return@AsyncFunction
        } else {
          Log.d(TAG, "Device is below Android 13, no runtime permission needed")
          promise.resolve(true)
        }
      } catch (e: Exception) {
        Log.e(TAG, "Unexpected error in requestPermissions", e)
        promise.reject(
          "UNEXPECTED_ERROR",
          "Unexpected error while requesting permissions: ${e.localizedMessage}",
          e
        )
      }
    }

    AsyncFunction("checkPermissions") { promise: Promise ->
      try {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
          Log.d(TAG, "Checking POST_NOTIFICATIONS permission status")
          val permission = android.Manifest.permission.POST_NOTIFICATIONS
          val granted = ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED
          Log.d(TAG, "Permission status: $granted")
          promise.resolve(granted)
          return@AsyncFunction
        }
        Log.d(TAG, "Device below Android 13, permissions always granted")
        promise.resolve(true)
      } catch (e: Exception) {
        Log.e(TAG, "Error checking permissions", e)
        promise.reject(
          "CHECK_PERMISSION_ERROR",
          "Error checking notification permissions: ${e.localizedMessage}",
          e
        )
      }
    }

    AsyncFunction("showNotification") { options: Map<String, Any>, promise: Promise ->
      try {
        Log.d(TAG, "Attempting to show notification")
        val title = options["title"] as? String ?: ""
        val body = options["body"] as? String ?: ""
        val data = options["data"] as? Map<String, Any>
        val isSilent = options["isSilent"] as? Boolean ?: false
        Log.d(TAG, "Notification data - Title: $title, Body: $body, Silent: $isSilent")

        val notificationId = UUID.randomUUID().toString()
        val targetChannelId = if (isSilent) SILENT_CHANNEL_ID else CHANNEL_ID

        val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)?.apply {
            action = NOTIFICATION_PRESSED_ACTION
            putExtra("notificationId", notificationId)
            putExtra("notificationData", data?.let { HashMap(it) })
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        
        val pendingIntentFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            notificationId.hashCode(),
            intent,
            pendingIntentFlags
        )

        val notificationBuilder = NotificationCompat.Builder(context, targetChannelId)
          .setContentTitle(title)
          .setContentText(body)
          .setSmallIcon(android.R.drawable.ic_dialog_info)
          .setAutoCancel(true)
          .setContentIntent(pendingIntent)

        if (isSilent) {
            notificationBuilder
                .setPriority(NotificationCompat.PRIORITY_MIN)
        } else {
            notificationBuilder
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
        }

        val notification = notificationBuilder.build()

        notificationManager.notify(notificationId.hashCode(), notification)
        Log.d(TAG, "Notification shown successfully with ID: $notificationId (Silent: $isSilent)")
        
        sendEvent("onNotificationReceived", mapOf(
            "notificationId" to notificationId,
            "data" to data,
            "action" to "received"
        ))

        promise.resolve(notificationId)
      } catch (e: Exception) {
        Log.e(TAG, "Error showing notification", e)
        promise.reject(
          "NOTIFICATION_ERROR",
          "Failed to show notification: ${e.localizedMessage}",
          e
        )
      }
    }

    AsyncFunction("cancelNotification") { id: String, promise: Promise ->
      try {
        Log.d(TAG, "Cancelling notification with ID: $id")
        notificationManager.cancel(id.hashCode())
        Log.d(TAG, "Notification cancelled successfully")
        promise.resolve(null)
      } catch (e: Exception) {
        Log.e(TAG, "Error cancelling notification", e)
        promise.reject(
          "CANCEL_ERROR",
          "Failed to cancel notification: ${e.localizedMessage}",
          e
        )
      }
    }

    AsyncFunction("cancelAllNotifications") { promise: Promise ->
      try {
        Log.d(TAG, "Cancelling all notifications")
        notificationManager.cancelAll()
        Log.d(TAG, "All notifications cancelled successfully")
        promise.resolve(null)
      } catch (e: Exception) {
        Log.e(TAG, "Error cancelling all notifications", e)
        promise.reject(
          "CANCEL_ALL_ERROR",
          "Failed to cancel all notifications: ${e.localizedMessage}",
          e
        )
      }
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(CustomNotifierView::class) {
      // Defines a setter for the `url` prop.
      Prop("url") { view: CustomNotifierView, url: URL ->
        view.webView.loadUrl(url.toString())
      }
      // Defines an event that the view can send to JavaScript.
      Events("onLoad")
    }

    OnActivityEntersForeground {
      currentActivity?.intent?.let { handleIntent(it) }
    }

    OnNewIntent {
      handleIntent(it)
    }
  }

  private fun handleIntent(intent: Intent?) {
    intent?.let {
      if (it.action == NOTIFICATION_PRESSED_ACTION) {
        val notificationId = it.getStringExtra("notificationId")
        val data = try {
             if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                 it.getSerializableExtra("notificationData", HashMap::class.java)
             } else {
                 @Suppress("DEPRECATION")
                 it.getSerializableExtra("notificationData") as? HashMap<*, *>
             }
        } catch (e: Exception) {
             Log.e(TAG, "Error extracting notification data from intent", e)
             null
        }

        Log.d(TAG, "Notification pressed event received for ID: $notificationId")
        sendEvent("onNotificationPressed", mapOf(
            "notificationId" to notificationId,
            "data" to data?.toMap(),
            "action" to "pressed"
        ))
        it.action = null
      }
    }
  }

  private fun createNotificationChannel() {
    createChannel(CHANNEL_ID, "Custom Notifications", NotificationManager.IMPORTANCE_DEFAULT)
  }

  private fun createSilentNotificationChannel() {
    createChannel(SILENT_CHANNEL_ID, "Silent Notifications", NotificationManager.IMPORTANCE_MIN, silent = true)
  }

  private fun createChannel(id: String, name: String, importance: Int, silent: Boolean = false) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Log.d(TAG, "Creating notification channel - ID: $id, Name: $name, Importance: $importance, Silent: $silent")
      try {
          val channel = NotificationChannel(id, name, importance)
          channel.description = if (silent) "Channel for silent notifications" else "Channel for custom notifications"
          if (silent) {
              channel.setSound(null, null)
              channel.enableVibration(false)
              channel.enableLights(false)
          }
          val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
          manager.createNotificationChannel(channel)
          Log.d(TAG, "Notification channel $id created successfully")
      } catch (e: Exception) {
          Log.e(TAG, "Failed to create notification channel $id", e)
      }
    } else {
      Log.d(TAG, "Skipping channel creation - device below Android O")
    }
  }
}

fun HashMap<*, *>?.toMap(): Map<String, Any?>? {
    return this?.mapNotNull { (key, value) ->
        if (key is String) {
            key to value
        } else {
            null
        }
    }?.toMap()
}
