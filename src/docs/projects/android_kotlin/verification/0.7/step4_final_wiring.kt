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

fun main() {
    println("Calculator starting up")
    val calculator = Calculator(6)
    val operandB: Int? = null
    val operatorSymbol = "+"
    val safeOperandB = operandB ?: 0
    val operation: Operation = when (operatorSymbol) {
        "+" -> Addition()
        "-" -> Subtraction()
        "*" -> Multiplication()
        "/" -> Division()
        else -> Addition()
    }
    calculator.perform(operation, safeOperandB)
    println(calculator.displayValue)
}
