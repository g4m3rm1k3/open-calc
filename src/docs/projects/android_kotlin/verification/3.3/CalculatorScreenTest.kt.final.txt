package com.example.calculator

import androidx.compose.ui.test.assertTextEquals
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class CalculatorScreenTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun pressingDigitsUpdatesDisplay() {
        composeTestRule.setContent {
            CalculatorScreen()
        }

        composeTestRule.onNodeWithTag("display").assertTextEquals("0")

        composeTestRule.onNodeWithText("7").performClick()
        composeTestRule.onNodeWithTag("display").assertTextEquals("7")

        composeTestRule.onNodeWithText("8").performClick()
        composeTestRule.onNodeWithTag("display").assertTextEquals("78")
    }

    @Test
    fun pressingClearResetsDisplay() {
        composeTestRule.setContent {
            CalculatorScreen()
        }

        composeTestRule.onNodeWithText("7").performClick()
        composeTestRule.onNodeWithText("8").performClick()
        composeTestRule.onNodeWithTag("display").assertTextEquals("78")

        composeTestRule.onNodeWithText("C").performClick()
        composeTestRule.onNodeWithTag("display").assertTextEquals("0")
    }

    @Test
    fun pressingSevenPlusThreeEqualsShowsTen() {
        composeTestRule.setContent {
            CalculatorScreen()
        }

        composeTestRule.onNodeWithText("7").performClick()
        composeTestRule.onNodeWithText("+").performClick()
        composeTestRule.onNodeWithTag("display").assertTextEquals("0")

        composeTestRule.onNodeWithText("3").performClick()
        composeTestRule.onNodeWithText("=").performClick()
        composeTestRule.onNodeWithTag("display").assertTextEquals("10")
    }

    @Test
    fun pressingEqualsWithNoPendingOperatorDoesNothing() {
        composeTestRule.setContent {
            CalculatorScreen()
        }

        composeTestRule.onNodeWithText("7").performClick()
        composeTestRule.onNodeWithText("=").performClick()
        composeTestRule.onNodeWithTag("display").assertTextEquals("7")
    }

    @Test
    fun pressingFiveDivideZeroEqualsShowsErrorInsteadOfCrashing() {
        composeTestRule.setContent {
            CalculatorScreen()
        }

        composeTestRule.onNodeWithTag("5").performClick()
        composeTestRule.onNodeWithTag("÷").performClick()
        composeTestRule.onNodeWithTag("0").performClick()
        composeTestRule.onNodeWithTag("=").performClick()

        composeTestRule.onNodeWithTag("display").assertTextEquals("Error")
    }

    @Test
    fun pressingDigitAfterErrorStartsFreshInsteadOfAppending() {
        composeTestRule.setContent {
            CalculatorScreen()
        }

        composeTestRule.onNodeWithTag("5").performClick()
        composeTestRule.onNodeWithTag("÷").performClick()
        composeTestRule.onNodeWithTag("0").performClick()
        composeTestRule.onNodeWithTag("=").performClick()
        composeTestRule.onNodeWithTag("display").assertTextEquals("Error")

        composeTestRule.onNodeWithTag("9").performClick()
        composeTestRule.onNodeWithTag("display").assertTextEquals("9")
    }

    @Test
    fun pressingOperatorAfterErrorStartsFreshInsteadOfCrashing() {
        composeTestRule.setContent {
            CalculatorScreen()
        }

        composeTestRule.onNodeWithTag("5").performClick()
        composeTestRule.onNodeWithTag("÷").performClick()
        composeTestRule.onNodeWithTag("0").performClick()
        composeTestRule.onNodeWithTag("=").performClick()
        composeTestRule.onNodeWithTag("display").assertTextEquals("Error")

        composeTestRule.onNodeWithTag("+").performClick()
        composeTestRule.onNodeWithTag("display").assertTextEquals("0")
    }
}
