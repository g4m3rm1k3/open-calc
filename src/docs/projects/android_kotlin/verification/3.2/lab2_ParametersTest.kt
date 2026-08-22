package com.example.calculator

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.test.assertTextEquals
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.unit.dp
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@Composable
fun LabBox(text: String, modifier: Modifier = Modifier) {
    Text(text = text, modifier = modifier.padding(4.dp))
}

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class Lab2ParametersTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun externallySuppliedModifierReachesTheUnderlyingComposable() {
        composeTestRule.setContent {
            LabBox(text = "Hi", modifier = Modifier.testTag("mytag"))
        }

        composeTestRule.onNodeWithTag("mytag").assertTextEquals("Hi")
    }
}
