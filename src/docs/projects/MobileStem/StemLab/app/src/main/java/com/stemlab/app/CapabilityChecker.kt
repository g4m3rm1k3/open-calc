package com.stemlab.app

import android.content.Context

interface CapabilityChecker {
    fun isAvailable(featureName: String): Boolean
}

class SystemCapabilityChecker(private val context: Context) : CapabilityChecker {
    override fun isAvailable(featureName: String): Boolean {
        return context.packageManager.hasSystemFeature(featureName)
    }
}
