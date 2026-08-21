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
    calculator.perform(Addition(), 4)
    println(calculator.displayValue)
    calculator.perform(Subtraction(), 3)
    println(calculator.displayValue)
    calculator.perform(Multiplication(), 2)
    println(calculator.displayValue)
    calculator.perform(Division(), 3)
    println(calculator.displayValue)
}
