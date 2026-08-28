package com.stemlab.app

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext

@Composable
fun InstrumentDashboard() {
    val context = LocalContext.current
    val checker: CapabilityChecker = remember { SystemCapabilityChecker(context) }
    Column {
        InstrumentCatalog.all.forEach { instrument ->
            InstrumentCard(
                instrument = instrument,
                isAvailable = checker.isAvailable(instrument.requiredFeature)
            )
        }
    }
}
