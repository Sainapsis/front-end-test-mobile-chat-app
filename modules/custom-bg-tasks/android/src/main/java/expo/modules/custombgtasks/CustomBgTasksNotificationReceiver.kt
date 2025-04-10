package expo.modules.custombgtasks

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import java.util.UUID

/**
 * Receptor dedicado para manejar notificaciones silenciosas
 */
class CustomBgTasksNotificationReceiver : BroadcastReceiver() {
    private val TAG = "CustomBgTasksNotif"

    override fun onReceive(context: Context, intent: Intent) {
        Log.d(TAG, "Received broadcast: ${intent.action}")
        
        try {
            val action = intent.action
            if (action == "com.google.firebase.messaging.DATA_MESSAGE" || 
                action == "io.invertase.firebase.messaging.NOTIFICATION_RECEIVED") {
                
                val data = intent.extras
                if (data != null) {
                    val isDataOnly = data.getBoolean("data_only", false) || 
                                    !data.containsKey("notification_title") && !data.containsKey("notification_body")
                    
                    if (isDataOnly) {
                        val taskId = UUID.randomUUID().toString()
                        val jsDb = data.getString("js_db_execution")
                        
                        if (jsDb != null) {
                            Log.d(TAG, "Processing silent notification with DB execution: $taskId")
                            
                            // Delegar al módulo CustomBgTasks para la ejecución
                            // Aquí podríamos iniciar un servicio o comunicarnos con el módulo principal
                            val moduleIntent = Intent(context, CustomBgTasksService::class.java).apply {
                                putExtra("taskId", taskId)
                                putExtra("jsCode", jsDb)
                                putExtra("timeout", 30000L)
                            }
                            
                            try {
                                context.startService(moduleIntent)
                                Log.d(TAG, "Started background service for task: $taskId")
                            } catch (e: Exception) {
                                Log.e(TAG, "Failed to start background service", e)
                            }
                        }
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error processing notification", e)
        }
    }
} 