interface Operation {
    fun apply(current: Int, amount: Int): Int
}

class Calculator(var displayValue: Int) {
    fun perform(operation: Operation, amount: Int) {
        displayValue = operation.apply(displayValue, amount)
    }
}

class Average : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return (current + amount) / 2
    }
}

fun main() {
    val calculator = Calculator(17)
    calculator.perform(Average(), 5)
    println(calculator.displayValue)
}
