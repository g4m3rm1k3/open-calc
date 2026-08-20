fun add(a: Int, b: Int) = a + b
fun subtract(a: Int, b: Int) = a - b
fun multiply(a: Int, b: Int) = a * b

fun main() {
    println("Calculator starting up")
    println(2)
    println(3.5)
    println(true)
    var displayValue = add(2, 3)
    println(displayValue)
    displayValue = subtract(displayValue, 4)
    println(displayValue)
    displayValue = multiply(displayValue, 5)
    println(displayValue)
}
