package com.example.calculator

fun interface Operation {
    fun apply(current: Int, amount: Int): Int
}

private class Addition : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return current + amount
    }
}

private class Subtraction : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return current - amount
    }
}

private class Multiplication : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return current * amount
    }
}

private class Division : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return current / amount
    }
}

private class Modulo : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return current % amount
    }
}

enum class Operator(val operation: Operation) {
    PLUS(Addition()),
    MINUS(Subtraction()),
    TIMES(Multiplication()),
    DIVIDE(Division()),
    MODULO(Modulo())
}

val operatorSymbols = mapOf(
    "+" to Operator.PLUS,
    "−" to Operator.MINUS,
    "×" to Operator.TIMES,
    "÷" to Operator.DIVIDE
)

sealed class Display {
    data class Value(val text: String) : Display()
    object Error : Display()
}

private fun Display.textOrZero(): String = when (this) {
    is Display.Value -> text
    Display.Error -> "0"
}

data class CalculatorState(
    val display: Display = Display.Value("0"),
    val firstOperand: Int? = null,
    val pendingOperator: Operator? = null
)

fun nextState(current: CalculatorState, label: String): CalculatorState {
    return when {
        label[0].isDigit() -> {
            val currentText = current.display.textOrZero()
            val newText = if (currentText == "0") label else currentText + label
            current.copy(display = Display.Value(newText))
        }
        label == "C" -> current.copy(display = Display.Value("0"))
        label in operatorSymbols -> current.copy(
            firstOperand = current.display.textOrZero().toInt(),
            pendingOperator = operatorSymbols[label],
            display = Display.Value("0")
        )
        label == "=" -> {
            val operator = current.pendingOperator
            val first = current.firstOperand
            val newDisplay = if (operator != null && first != null) {
                try {
                    Display.Value(operator.operation.apply(first, current.display.textOrZero().toInt()).toString())
                } catch (invalidOperation: ArithmeticException) {
                    Display.Error
                }
            } else {
                current.display
            }
            current.copy(display = newDisplay, pendingOperator = null, firstOperand = null)
        }
        else -> current
    }
}
