fun interface Operation {
    fun apply(current: Int, amount: Int): Int
}

class Calculator(var displayValue: Int) {
    fun perform(operation: Operation, amount: Int) {
        displayValue = operation.apply(displayValue, amount)
    }
}

fun main() {
    val calculator = Calculator(17)
    val average = Operation { current, amount -> (current + amount) / 2 }
    calculator.perform(average, 5)
    println(calculator.displayValue)
}
