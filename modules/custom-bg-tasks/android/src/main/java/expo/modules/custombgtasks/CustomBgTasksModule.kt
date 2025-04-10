package expo.modules.custombgtasks

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONObject
import java.net.URL
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors

// Crear nuestras propias excepciones utilizando correctamente CodedException
class TaskExecutionError(message: String, cause: Throwable? = null) : 
    CodedException("ERR_EXECUTION", message, cause)

class TaskAlreadyRunningError(taskId: String) : 
    CodedException("ERR_TASK_ALREADY_RUNNING", "A task with ID $taskId is already running", null)

class NotificationHandlerError(message: String, cause: Throwable? = null) : 
    CodedException("ERR_NOTIFICATION_HANDLER", message, cause)

class CustomBgTasksModule : Module() {
  private val TAG = "CustomBgTasksModule"
  private val runningTasks = ConcurrentHashMap<String, Boolean>()
  private val executor = Executors.newCachedThreadPool()
  private var silentNotificationReceiver: BroadcastReceiver? = null
  private var isReceiverRegistered = false

  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('CustomBgTasks')` in JavaScript.
    Name("CustomBgTasks")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants(
      "PI" to Math.PI
    )

    // Defines event names that the module can send to JavaScript.
    Events("onChange", "onBackgroundTaskCompleted")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      "Hello world! 👋"
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { value: String ->
      // Send an event to JavaScript.
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }

    AsyncFunction("executeJsInBackground") { options: Map<String, Any>, promise: Promise ->
      try {
        val taskId = options["taskId"] as? String ?: UUID.randomUUID().toString()
        val jsCode = options["jsCode"] as? String 
          ?: throw TaskExecutionError("JavaScript code is required")
        val timeout = (options["timeout"] as? Number)?.toLong() ?: 30000L
        val persistence = options["persistence"] as? Boolean ?: false

        executeJavaScriptInBackground(taskId, jsCode, timeout, persistence, promise)
      } catch (e: Exception) {
        // Usar nuestra clase personalizada de error
        when (e) {
          is CodedException -> promise.reject(e)
          else -> promise.reject(TaskExecutionError(e.message ?: "Unknown error", e))
        }
      }
    }

    AsyncFunction("registerSilentNotificationHandler") { promise: Promise ->
      try {
        registerSilentNotificationReceiver()
        promise.resolve(null)
      } catch (e: Exception) {
        // Usar nuestra clase personalizada de error
        promise.reject(NotificationHandlerError("Failed to register notification handler", e))
      }
    }

    AsyncFunction("unregisterSilentNotificationHandler") { promise: Promise ->
      try {
        unregisterSilentNotificationReceiver()
        promise.resolve(null)
      } catch (e: Exception) {
        // Usar nuestra clase personalizada de error
        promise.reject(NotificationHandlerError("Failed to unregister notification handler", e))
      }
    }

    AsyncFunction("isBackgroundTaskRunning") { taskId: String, promise: Promise ->
      promise.resolve(runningTasks.containsKey(taskId))
    }

    AsyncFunction("stopBackgroundTask") { taskId: String, promise: Promise ->
      val wasRunning = runningTasks.remove(taskId) != null
      promise.resolve(wasRunning)
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(CustomBgTasksView::class) {
      // Defines a setter for the `url` prop.
      Prop("url") { view: CustomBgTasksView, url: URL ->
        view.webView.loadUrl(url.toString())
      }
      // Defines an event that the view can send to JavaScript.
      Events("onLoad")
    }
  }

  private fun executeJavaScriptInBackground(
    taskId: String,
    jsCode: String,
    timeout: Long,
    persistence: Boolean,
    promise: Promise
  ) {
    if (runningTasks.putIfAbsent(taskId, true) != null) {
      promise.reject(TaskAlreadyRunningError(taskId))
      return
    }

    promise.resolve(taskId)

    executor.execute {
      try {
        Log.d(TAG, "Executing background task: $taskId")
        
        val result = JSONObject()
        result.put("taskId", taskId)
        
        try {
          val jsResult = evaluateJavaScript(jsCode)
          runningTasks.remove(taskId)
          
          result.put("success", true)
          result.put("result", jsResult)
          
          sendEvent("onBackgroundTaskCompleted", mapOf(
            "taskId" to taskId,
            "success" to true,
            "result" to jsResult
          ))
        } catch (e: Exception) {
          runningTasks.remove(taskId)
          
          Log.e(TAG, "Error executing background task: $taskId", e)
          result.put("success", false)
          result.put("error", e.message ?: "Unknown error")
          
          sendEvent("onBackgroundTaskCompleted", mapOf(
            "taskId" to taskId,
            "success" to false,
            "error" to (e.message ?: "Unknown error")
          ))
        }
      } catch (e: Exception) {
        Log.e(TAG, "Error in background execution thread", e)
        runningTasks.remove(taskId)
      }
    }
  }

  private fun evaluateJavaScript(jsCode: String): Any {
    // En un módulo Expo, no tenemos acceso directo al JavaScriptContextHolder
    // Utiliza otro enfoque más simple para este tipo de módulo
    Log.d(TAG, "Executing JavaScript code: $jsCode")
    
    // Usar nuestro JSI module simplificado
    return CustomBgTasksJSIModule.evaluateScript(jsCode)
  }

  private fun registerSilentNotificationReceiver() {
    if (isReceiverRegistered) {
      return
    }

    val context = appContext.reactContext?.applicationContext ?: return
    val filter = IntentFilter().apply {
      addAction("com.google.firebase.messaging.DATA_MESSAGE")
      addAction("io.invertase.firebase.messaging.NOTIFICATION_RECEIVED")
    }

    silentNotificationReceiver = object : BroadcastReceiver() {
      override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        Log.d(TAG, "Received broadcast: $action")
        
        if (action == "com.google.firebase.messaging.DATA_MESSAGE" || 
            action == "io.invertase.firebase.messaging.NOTIFICATION_RECEIVED") {
          
          val data = intent.extras
          if (data != null) {
            val isDataOnly = data.getBoolean("data_only", false) || 
                           !data.containsKey("notification_title") && !data.containsKey("notification_body")
            
            if (isDataOnly) {
              val taskId = UUID.randomUUID().toString()
              val jsDb = data.getString("js_db_execution") ?: return
              
              Log.d(TAG, "Processing silent notification with DB execution: $taskId")
              
              executeJavaScriptInBackground(
                taskId,
                jsDb,
                30000L,
                false,
                object : Promise {
                  override fun resolve(value: Any?) {
                    Log.d(TAG, "Silent notification task started: $taskId")
                  }
                  
                  override fun reject(code: String, message: String?, cause: Throwable?) {
                    Log.e(TAG, "Failed to start silent notification task: $message", cause)
                  }
                }
              )
            }
          }
        }
      }
    }

    context.registerReceiver(silentNotificationReceiver, filter)
    isReceiverRegistered = true
    Log.d(TAG, "Silent notification receiver registered")
  }

  private fun unregisterSilentNotificationReceiver() {
    if (!isReceiverRegistered || silentNotificationReceiver == null) {
      return
    }

    val context = appContext.reactContext?.applicationContext ?: return
    context.unregisterReceiver(silentNotificationReceiver)
    silentNotificationReceiver = null
    isReceiverRegistered = false
    Log.d(TAG, "Silent notification receiver unregistered")
  }
}
