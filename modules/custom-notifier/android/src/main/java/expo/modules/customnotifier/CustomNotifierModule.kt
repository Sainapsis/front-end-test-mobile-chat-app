package expo.modules.customnotifier

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
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
import com.google.firebase.messaging.FirebaseMessaging
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.functions.Coroutine
import kotlinx.coroutines.tasks.await

private const val CHANNEL_ID = "custom_notifier_channel"
private const val PERMISSION_REQUEST_CODE = 123
private const val TAG = "CustomNotifierModule"

class CustomNotifierModule : Module() {
  private val context: Context
    get() = requireNotNull(appContext.reactContext) { "React Application Context is null" }

  private val currentActivity: Activity?
    get() = appContext.activityProvider?.currentActivity

  private val notificationManager: NotificationManager?
    get() = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager

  override fun definition() = ModuleDefinition {
    Name("CustomNotifier")

    Constants()

    Events("onNotificationReceived", "onNotificationOpened", "onTokenRefreshed")

    Function("hello") {
      "Hello from CustomNotifier with FCM!"
    }

    AsyncFunction("requestPermissions").Coroutine<Boolean> {
      Log.d(TAG, "Requesting notification permissions...")
      createNotificationChannel()

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        val permission = android.Manifest.permission.POST_NOTIFICATIONS
        val activity = currentActivity ?: throw Exceptions.MissingActivity()

        when {
          ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED -> {
            Log.d(TAG, "Permission already granted.")
            return@Coroutine true
          }

          ActivityCompat.shouldShowRequestPermissionRationale(activity, permission) -> {
            Log.d(TAG, "Showing permission rationale is recommended, but rejecting for now.")
            throw CodedException("PERMISSION_DENIED", "User previously denied notification permissions.", null)
          }

          else -> {
            Log.d(TAG, "Requesting POST_NOTIFICATIONS permission.")
            try {
              ActivityCompat.requestPermissions(
                activity,
                arrayOf(permission),
                PERMISSION_REQUEST_CODE
              )
              Log.d(TAG, "Permission request initiated.")
              return@Coroutine false
            } catch (e: Exception) {
              Log.e(TAG, "Failed to request permissions", e)
              throw CodedException("REQUEST_FAILED", "Failed to request notification permissions: ${e.message}", e)
            }
          }
        }
      } else {
        Log.d(TAG, "Android version < 13, permission granted by default.")
        return@Coroutine true
      }
    }

    AsyncFunction("checkPermissions").Coroutine<Boolean> {
      Log.d(TAG, "Checking notification permissions...")
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        val permission = android.Manifest.permission.POST_NOTIFICATIONS
        val granted = ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED
        Log.d(TAG, "Permission status (Android 13+): $granted")
        return@Coroutine granted
      }
      Log.d(TAG, "Permission status (Below Android 13): true")
      return@Coroutine true
    }

    AsyncFunction("getFcmToken").Coroutine<String> {
      Log.d(TAG, "Attempting to retrieve FCM token...")
      try {
        val token: String = FirebaseMessaging.getInstance().token.await()
        Log.d(TAG, "FCM Token retrieved: $token")
        return@Coroutine token
      } catch (e: Exception) {
        Log.w(TAG, "Fetching FCM registration token failed", e)
        throw CodedException("TOKEN_FETCH_FAILED", "Failed to fetch FCM token", e)
      }
    }

    OnCreate {
      createNotificationChannel()
    }
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val name = "Default Channel"
      val descriptionText = "Channel for default app notifications"
      val importance = NotificationManager.IMPORTANCE_DEFAULT
      val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
        description = descriptionText
      }
      val notificationManager: NotificationManager =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

      if (notificationManager.getNotificationChannel(CHANNEL_ID) == null) {
        notificationManager.createNotificationChannel(channel)
        Log.d(TAG, "Notification channel '$CHANNEL_ID' created.")
      } else {
        Log.d(TAG, "Notification channel '$CHANNEL_ID' already exists.")
      }
    } else {
      Log.d(TAG, "Notification channels not required below Android Oreo (API 26).")
    }
  }

  companion object {
    fun sendNotificationReceivedEvent(context: Context?, data: Map<String, Any?>) {
      Log.d(TAG, "Would send onNotificationReceived event with data: $data")
    }

    fun sendNotificationOpenedEvent(context: Context?, data: Map<String, Any?>) {
      Log.d(TAG, "Would send onNotificationOpened event with data: $data")
    }

    fun sendTokenRefreshEvent(context: Context?, token: String) {
      Log.d(TAG, "Would send onTokenRefreshed event with token: $token")
    }
  }
}
