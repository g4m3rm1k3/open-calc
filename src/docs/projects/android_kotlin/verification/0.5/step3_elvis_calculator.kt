fun add(a: Int, b: Int) = a + b
fun subtract(a: Int, b: Int) = a - b
fun multiply(a: Int, b: Int) = a * b
fun divide(a: Int, b: Int) = a / b

fun main() {
    println("Calculator starting up")
    val operandA = 6
    val operandB: Int? = null
    val operatorSymbol = "+"
    val safeOperandB = operandB ?: 0
    val result = when (operatorSymbol) {
        "+" -> add(operandA, safeOperandB)
        "-" -> subtract(operandA, safeOperandB)
        "*" -> multiply(operandA, safeOperandB)
        "/" -> divide(operandA, safeOperandB)
        else -> 0
    }
    println(result)
}
