package com.example.calculator

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.test.junit4.createComposeRule
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.junit.Assert.assertEquals

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class ThemeCaptureTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Composable
    fun ReadTheme(onRead: (Color) -> Unit) {
        onRead(MaterialTheme.colorScheme.primary)
    }

    @Test
    fun calculatorThemeProvidesRealCustomPrimaryColor() {
        var captured: Color? = null
        composeTestRule.setContent {
            CalculatorTheme {
                ReadTheme { color -> captured = color }
            }
        }
        assertEquals(Color(0xFF1565C0), captured)
    }
}
