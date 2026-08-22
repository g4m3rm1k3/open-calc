fun printAndReturn(label: String, value: Boolean): Boolean {
    println("Checking $label")
    return value
}

fun main() {
    val result = printAndReturn("left", true) || printAndReturn("right", true)
    println("Result: $result")
}
