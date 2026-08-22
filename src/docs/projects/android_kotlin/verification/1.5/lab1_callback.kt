fun runIfPositive(n: Int, onPositive: () -> Unit) {
    if (n > 0) {
        onPositive()
    }
}

fun main() {
    runIfPositive(5) { println("positive!") }
    runIfPositive(-3) { println("this should not print") }
}
