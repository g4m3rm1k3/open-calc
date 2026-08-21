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

enum class Operator {
    PLUS, MINUS, TIMES, DIVIDE
}

fun main() {
    println("Calculator starting up")
    val calculator = Calculator(6)
    val operandB: Int? = null
    val operatorChoice = Operator.PLUS
    val safeOperandB = operandB ?: 0
    val operation: Operation = when (operatorChoice) {
        Operator.PLUS -> Addition()
        Operator.MINUS -> Subtraction()
        Operator.TIMES -> Multiplication()
        Operator.DIVIDE -> Division()
    }
    calculator.perform(operation, safeOperandB)
    println(calculator.displayValue)
}
