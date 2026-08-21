fun interface Operation {
    fun apply(current: Int, amount: Int): Int
}

class Addition : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return current + amount
    }
}

class Subtraction : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return current - amount
    }
}

class Multiplication : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return current * amount
    }
}

class Division : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return current / amount
    }
}

class Calculator(var displayValue: Int) {
    fun perform(operation: Operation, amount: Int) {
        displayValue = operation.apply(displayValue, amount)
    }
}

enum class Operator(val operation: Operation) {
    PLUS(Addition()),
    MINUS(Subtraction()),
    TIMES(Multiplication()),
    DIVIDE(Division())
}

data class Calculation(val operator: Operator, val operandA: Int, val operandB: Int, val result: Int)

fun Calculation.describe(): String {
    return "$operandA $operator $operandB = $result"
}

fun main() {
    val calculator = Calculator(6).apply {
        println("Calculator initialized with displayValue = $displayValue")
    }
    val operandB: Int? = null
    operandB?.let { println("Using provided operand: $it") }
    val operatorChoice = Operator.PLUS
    val safeOperandB = operandB ?: 0
    val operandA = calculator.displayValue
    calculator.perform(operatorChoice.operation, safeOperandB)
    val calculation = Calculation(operatorChoice, operandA, safeOperandB, calculator.displayValue)
    println(calculation.describe())
}
