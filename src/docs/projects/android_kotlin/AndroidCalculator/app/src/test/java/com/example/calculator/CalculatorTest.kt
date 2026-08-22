package com.example.calculator

import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class CalculatorTest {

    @Test
    fun additionAppliesRealArithmetic() {
        // Arrange
        val operation = Operator.PLUS.operation

        // Act
        val result = operation.apply(2, 2)

        // Assert
        assertEquals(4, result)
    }

    @Test
    fun subtractionAppliesRealArithmetic() {
        // Arrange
        val operation = Operator.MINUS.operation

        // Act
        val result = operation.apply(10, 3)

        // Assert
        assertEquals(7, result)
    }

    @Test
    fun multiplicationAppliesRealArithmetic() {
        // Arrange
        val operation = Operator.TIMES.operation

        // Act
        val result = operation.apply(5, 6)

        // Assert
        assertEquals(30, result)
    }

    @Test
    fun divisionAppliesRealArithmetic() {
        // Arrange
        val operation = Operator.DIVIDE.operation

        // Act
        val result = operation.apply(20, 4)

        // Assert
        assertEquals(5, result)
    }

    @Test
    fun moduloAppliesRealArithmetic() {
        // Arrange
        val operation = Operator.MODULO.operation

        // Act
        val result = operation.apply(17, 5)

        // Assert
        assertEquals(2, result)
    }

    @Test
    fun divisionByZeroThrowsArithmeticException() {
        // Arrange
        val operation = Operator.DIVIDE.operation

        // Act & Assert
        assertThrows(ArithmeticException::class.java) {
            operation.apply(5, 0)
        }
    }
}
