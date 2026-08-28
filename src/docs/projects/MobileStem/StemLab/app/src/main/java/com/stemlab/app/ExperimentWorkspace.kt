package com.stemlab.app

import androidx.compose.foundation.layout.Column
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue

@Composable
fun ExperimentWorkspace() {
    var state: ExperimentState by remember { mutableStateOf(ExperimentState.Configuring) }

    Column {
        Text(text = "Current state: $state")

        Button(
            onClick = { state = start(state, nowMillis = System.currentTimeMillis()) },
            enabled = state is ExperimentState.Configuring
        ) { Text("Start") }

        Button(
            onClick = { state = stop(state, nowMillis = System.currentTimeMillis()) },
            enabled = state is ExperimentState.Running
        ) { Text("Stop") }

        Button(
            onClick = { state = save(state) },
            enabled = state is ExperimentState.Stopped
        ) { Text("Save") }
    }
}
