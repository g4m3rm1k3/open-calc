interface Greeter {
    fun greet(name: String): String
}

class FormalGreeter : Greeter {
    override fun greet(name: String) = "Good day, $name."
}

class CasualGreeter : Greeter {
    override fun greet(name: String) = "Hey $name!"
}

fun printGreeting(greeter: Greeter, name: String) {
    println(greeter.greet(name))
}

fun main() {
    printGreeting(FormalGreeter(), "Ada")
    printGreeting(CasualGreeter(), "Ada")
}
