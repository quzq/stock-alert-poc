package com.quzq.stockalertpoc

import android.Manifest
import android.app.Activity
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.view.Gravity
import android.widget.TextView
import com.google.firebase.FirebaseApp
import com.google.firebase.messaging.FirebaseMessaging

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        createNotificationChannel()
        requestNotificationPermission()

        val message = TextView(this).apply {
            text = "Stock Alert PoC\nChecking FCM configuration..."
            textSize = 20f
            gravity = Gravity.CENTER
            setPadding(32, 32, 32, 32)
            setTextIsSelectable(true)
        }

        setContentView(message)

        val firebaseApp = FirebaseApp.initializeApp(this)
        if (firebaseApp == null) {
            message.text = "Stock Alert PoC\n\nFCM configuration not set\nAdd google-services.json via GitHub Actions secret"
            return
        }

        FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            message.text = if (task.isSuccessful) {
                "Stock Alert PoC\n\nFCM ready\n\nRegistration token:\n${task.result}"
            } else {
                val detail = task.exception?.message ?: "unknown error"
                "Stock Alert PoC\n\nFCM token fetch failed\n$detail"
            }
        }
    }

    private fun createNotificationChannel() {
        val notificationManager = getSystemService(NotificationManager::class.java)
        notificationManager.createNotificationChannel(
            NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "Stock alerts",
                NotificationManager.IMPORTANCE_HIGH,
            )
        )
    }

    private fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), NOTIFICATION_PERMISSION_REQUEST_CODE)
        }
    }

    companion object {
        private const val NOTIFICATION_CHANNEL_ID = "stock_alerts"
        private const val NOTIFICATION_PERMISSION_REQUEST_CODE = 1001
    }
}
