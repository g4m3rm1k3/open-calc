package com.example.calculator

import org.junit.Assert.assertEquals
import org.junit.Test

class CalculatorStateTest {

    @Test
    fun pressingDigitFromInitialStateReplacesLeadingZero() {
        // Arrange
        val state = CalculatorState()

        // Act
        val result = nextState(state, "7")

        // Assert
        assertEquals(CalculatorState(display = Display.Value("7")), result)
    }

    @Test
    fun pressingSevenPlusThreeEqualsProducesTen() {
        // Arrange
        var state = CalculatorState()

        // Act
        state = nextState(state, "7")
        state = nextState(state, "+")
        state = nextState(state, "3")
        state = nextState(state, "=")

        // Assert
        assertEquals(CalculatorState(display = Display.Value("10")), state)
    }

    @Test
    fun pressingFiveDivideZeroEqualsProducesError() {
        // Arrange
        var state = CalculatorState()

        // Act
        state = nextState(state, "5")
        state = nextState(state, "÷")
        state = nextState(state, "0")
        state = nextState(state, "=")

        // Assert
        assertEquals(CalculatorState(display = Display.Error), state)
    }

    @Test
    fun pressingOperatorAfterErrorStartsFreshInsteadOfCrashing() {
        // Arrange
        var state = CalculatorState()
        state = nextState(state, "5")
        state = nextState(state, "÷")
        state = nextState(state, "0")
        state = nextState(state, "=")

        // Act
        state = nextState(state, "+")

        // Assert
        assertEquals(
            CalculatorState(display = Display.Value("0"), firstOperand = 0, pendingOperator = Operator.PLUS),
            state
        )
    }
}
