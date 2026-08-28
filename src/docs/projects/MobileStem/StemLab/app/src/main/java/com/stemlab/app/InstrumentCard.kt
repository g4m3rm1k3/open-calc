package com.stemlab.app

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun InstrumentCard(instrument: Instrument, isAvailable: Boolean) {
    Card(modifier = Modifier.fillMaxWidth().padding(8.dp)) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = instrument.label, style = MaterialTheme.typography.titleMedium)
            Text(text = instrument.description)
            Text(
                text = if (isAvailable) "Available on this device" else "Not available on this device",
                color = if (isAvailable) Color(0xFF2E7D32) else Color(0xFF9E9E9E)
            )
        }
    }
}
