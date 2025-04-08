package expo.modules.customnotifier

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class CustomNotifierBroadcastReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        Log.d("CustomNotifierReceiver", "Received broadcast: ${intent.action}")
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED -> {
                Log.d("CustomNotifierReceiver", "Boot completed, restoring notification state")
            }
        }
    }
} 