class Calculator(var displayValue: Int)

fun add(a: Int, b: Int) = a + b
fun subtract(a: Int, b: Int) = a - b
fun multiply(a: Int, b: Int) = a * b
fun divide(a: Int, b: Int) = a / b

fun main() {
    println("Calculator starting up")
    val calculator = Calculator(6)
    println(calculator.displayValue)
    val operandB: Int? = null
    val operatorSymbol = "+"
    val safeOperandB = operandB ?: 0
    val result = when (operatorSymbol) {
        "+" -> add(calculator.displayValue, safeOperandB)
        "-" -> subtract(calculator.displayValue, safeOperandB)
        "*" -> multiply(calculator.displayValue, safeOperandB)
        "/" -> divide(calculator.displayValue, safeOperandB)
        else -> 0
    }
    println(result)
}
