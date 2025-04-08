package expo.modules.customnotifier

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
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
import java.net.URL
import java.util.UUID

private const val CHANNEL_ID = "custom_notifier_channel"
private const val PERMISSION_REQUEST_CODE = 123
private const val TAG = "CustomNotifierModule"

class CustomNotifierModule : Module() {
  private val context
    get() = requireNotNull(appContext.reactContext)

  private val activity: Activity?
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
        Log.d(TAG, "Notification channel created")

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
          Log.d(TAG, "Device is Android 13 or higher, checking POST_NOTIFICATIONS permission")
          val permission = android.Manifest.permission.POST_NOTIFICATIONS
          val granted = ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED
          Log.d(TAG, "Current permission status: $granted")
          
          if (!granted) {
            val currentActivity = activity
            if (currentActivity == null) {
              Log.e(TAG, "Activity is null, cannot request permissions")
              promise.reject(
                "ACTIVITY_NULL",
                "No activity found to request permissions",
                Exception("Activity is null")
              )
              return@AsyncFunction
            }

            val shouldShowRationale = ActivityCompat.shouldShowRequestPermissionRationale(currentActivity, permission)
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
                currentActivity,
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
        Log.d(TAG, "Notification data - Title: $title, Body: $body")

        val id = UUID.randomUUID().toString()
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
          .setContentTitle(title)
          .setContentText(body)
          .setSmallIcon(android.R.drawable.ic_dialog_info)
          .setPriority(NotificationCompat.PRIORITY_DEFAULT)
          .setAutoCancel(true)
          .build()

        notificationManager.notify(id.hashCode(), notification)
        Log.d(TAG, "Notification shown successfully with ID: $id")
        promise.resolve(id)
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
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Log.d(TAG, "Creating notification channel")
      val channel = NotificationChannel(
        CHANNEL_ID,
        "Custom Notifications",
        NotificationManager.IMPORTANCE_DEFAULT
      ).apply {
        description = "Channel for custom notifications"
      }
      val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      notificationManager.createNotificationChannel(channel)
      Log.d(TAG, "Notification channel created successfully")
    } else {
      Log.d(TAG, "Skipping channel creation - device below Android O")
    }
  }
}
