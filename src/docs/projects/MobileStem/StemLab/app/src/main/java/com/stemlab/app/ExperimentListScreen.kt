package com.stemlab.app

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp

@Composable
fun ExperimentListScreen(onExperimentClick: (ExperimentDefinition) -> Unit) {
    val context = LocalContext.current
    val checker: CapabilityChecker = remember { SystemCapabilityChecker(context) }
    Column {
        ExperimentRegistry.all().forEach { definition ->
            val runnable = isRunnable(definition, checker)
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp)
                    .clickable(enabled = runnable) { onExperimentClick(definition) }
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = definition.title, style = MaterialTheme.typography.titleMedium)
                    Text(text = definition.description)
                    Text(text = if (runnable) "Ready to run" else "Missing required instrument")
                }
            }
        }
    }
}
