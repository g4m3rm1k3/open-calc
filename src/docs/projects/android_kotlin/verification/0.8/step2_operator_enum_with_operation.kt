interface Operation {
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

fun main() {
    println("Calculator starting up")
    val calculator = Calculator(6)
    val operandB: Int? = null
    val operatorChoice = Operator.PLUS
    val safeOperandB = operandB ?: 0
    calculator.perform(operatorChoice.operation, safeOperandB)
    println(calculator.displayValue)
}
