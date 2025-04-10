package expo.modules.custombgtasks

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.util.concurrent.ConcurrentHashMap

/**
 * Servicio para ejecutar tareas en segundo plano
 */
class CustomBgTasksService : Service() {
    private val TAG = "CustomBgTasksService"
    private val serviceJob = SupervisorJob()
    private val serviceScope = CoroutineScope(Dispatchers.Default + serviceJob)
    private val runningTasks = ConcurrentHashMap<String, Job>()

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        intent?.let { handleIntent(it) }
        return START_NOT_STICKY
    }

    private fun handleIntent(intent: Intent) {
        val taskId = intent.getStringExtra("taskId") ?: return
        val jsCode = intent.getStringExtra("jsCode") ?: return
        val timeout = intent.getLongExtra("timeout", 30000L)

        Log.d(TAG, "Starting background task: $taskId")

        if (runningTasks.containsKey(taskId)) {
            Log.w(TAG, "Task $taskId is already running")
            return
        }

        val job = serviceScope.launch {
            try {
                Log.d(TAG, "Executing JS code for task: $taskId")
                val result = executeJavaScriptTask(jsCode)
                Log.d(TAG, "Task completed: $taskId, result: $result")
                
                sendTaskCompletedBroadcast(taskId, true, result)
            } catch (e: Exception) {
                Log.e(TAG, "Error executing task: $taskId", e)
                sendTaskCompletedBroadcast(taskId, false, e.message ?: "Unknown error")
            } finally {
                runningTasks.remove(taskId)
                
                if (runningTasks.isEmpty()) {
                    stopSelf()
                }
            }
        }

        runningTasks[taskId] = job
    }

    private fun executeJavaScriptTask(jsCode: String): String {
        return CustomBgTasksJSIModule.evaluateScript(jsCode)
    }

    private fun sendTaskCompletedBroadcast(taskId: String, success: Boolean, result: String) {
        val intent = Intent("expo.modules.custombgtasks.TASK_COMPLETED").apply {
            putExtra("taskId", taskId)
            putExtra("success", success)
            putExtra("result", result)
        }
        
        sendBroadcast(intent)
    }

    override fun onDestroy() {
        super.onDestroy()
        
        serviceScope.cancel()
        runningTasks.clear()
        
        Log.d(TAG, "Service destroyed")
    }
} 