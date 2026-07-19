package com.quzq.stockalertpoc

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class StockAlertMessagingService : FirebaseMessagingService() {
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }

        val title = remoteMessage.notification?.title
            ?: remoteMessage.data["title"]
            ?: "Stock Alert"
        val body = remoteMessage.notification?.body
            ?: remoteMessage.data["body"]
            ?: remoteMessage.data.entries.joinToString(separator = "\n") { "${it.key}: ${it.value}" }
                .ifBlank { "New stock alert received" }

        val notificationManager = getSystemService(NotificationManager::class.java)
        notificationManager.createNotificationChannel(
            NotificationChannel(
                CHANNEL_ID,
                "Stock alerts",
                NotificationManager.IMPORTANCE_HIGH,
            )
        )

        val notification = Notification.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(Notification.BigTextStyle().bigText(body))
            .setAutoCancel(true)
            .build()

        notificationManager.notify(
            (System.currentTimeMillis() and 0x7fffffff).toInt(),
            notification,
        )
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "FCM registration token updated: $token")
    }

    companion object {
        private const val TAG = "StockAlertFCM"
        private const val CHANNEL_ID = "stock_alerts"
    }
}
