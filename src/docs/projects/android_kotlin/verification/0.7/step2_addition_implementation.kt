interface Operation {
    fun apply(current: Int, amount: Int): Int
}

class Addition : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return current + amount
    }
}

class Calculator(var displayValue: Int) {
    fun add(amount: Int) {
        displayValue = displayValue + amount
    }
    fun subtract(amount: Int) {
        displayValue = displayValue - amount
    }
    fun multiply(amount: Int) {
        displayValue = displayValue * amount
    }
    fun divide(amount: Int) {
        displayValue = displayValue / amount
    }
}

fun main() {
    println("Calculator starting up")
    val calculator = Calculator(6)
    val addition = Addition()
    println(addition.apply(calculator.displayValue, 0))
    val operandB: Int? = null
    val operatorSymbol = "+"
    val safeOperandB = operandB ?: 0
    when (operatorSymbol) {
        "+" -> calculator.add(safeOperandB)
        "-" -> calculator.subtract(safeOperandB)
        "*" -> calculator.multiply(safeOperandB)
        "/" -> calculator.divide(safeOperandB)
    }
    println(calculator.displayValue)
}
