fun add(a: Int, b: Int) = a + b
fun subtract(a: Int, b: Int) = a - b
fun multiply(a: Int, b: Int) = a * b
fun divide(a: Int, b: Int) = a / b

fun main() {
    println("Calculator starting up")
    val operandA = 6
    val operandB = 2
    val operatorSymbol = "+"
    val result = when (operatorSymbol) {
        "+" -> add(operandA, operandB)
        "-" -> subtract(operandA, operandB)
        "*" -> multiply(operandA, operandB)
        "/" -> divide(operandA, operandB)
        else -> 0
    }
    println(result)
}
