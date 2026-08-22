package com.example.calculator

import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.test.assertTextEquals
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.Modifier
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@Composable
fun LabGreeting(name: String, tag: String) {
    Text(text = "Hello, $name", modifier = Modifier.testTag(tag))
}

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class Lab1ComponentsTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun sameComposableProducesDifferentRealOutputPerCall() {
        composeTestRule.setContent {
            LabGreeting(name = "Ada", tag = "first")
            LabGreeting(name = "Grace", tag = "second")
        }

        composeTestRule.onNodeWithTag("first").assertTextEquals("Hello, Ada")
        composeTestRule.onNodeWithTag("second").assertTextEquals("Hello, Grace")
    }
}
