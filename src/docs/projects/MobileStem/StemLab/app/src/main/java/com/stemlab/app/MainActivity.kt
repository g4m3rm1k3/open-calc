package com.stemlab.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            StemLabApp()
        }
    }
}

@Composable
fun StemLabApp() {
    registerBuiltInExperiments()
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "home") {
        composable("home") {
            HomeScreen(
                onAreaClick = { area -> navController.navigate("area/${area.id}") }
            )
        }
        composable("area/{areaId}") { backStackEntry ->
            val areaId = backStackEntry.arguments?.getString("areaId")
            val area = StemArea.all.first { it.id == areaId }
            AreaScreen(
                area = area,
                onExperimentClick = { definition ->
                    navController.navigate("experiment/${definition.id}")
                }
            )
        }
        composable("experiment/{experimentId}") {
            ExperimentWorkspace()
        }
    }
}

@Composable
fun HomeScreen(onAreaClick: (StemArea) -> Unit) {
    Scaffold(
        topBar = { TopAppBar(title = { Text("STEM Lab") }) }
    ) { innerPadding ->
        Column(modifier = Modifier.padding(innerPadding)) {
            StemArea.all.forEach { area ->
                Text(
                    text = area.label,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onAreaClick(area) }
                        .padding(16.dp)
                )
            }
        }
    }
}

@Composable
fun AreaScreen(area: StemArea, onExperimentClick: (ExperimentDefinition) -> Unit) {
    Scaffold(
        topBar = { TopAppBar(title = { Text(area.label) }) }
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            when (area) {
                StemArea.Instruments -> InstrumentDashboard()
                StemArea.Experiments -> ExperimentListScreen(onExperimentClick)
                else -> Text(text = "${area.label} — coming soon")
            }
        }
    }
}
