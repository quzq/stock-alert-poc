package com.quzq.stockalertpoc

import android.app.Activity
import android.os.Bundle
import android.view.Gravity
import android.widget.TextView

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val message = TextView(this).apply {
            text = "Stock Alert PoC\nAPK build successful"
            textSize = 24f
            gravity = Gravity.CENTER
        }

        setContentView(message)
    }
}
