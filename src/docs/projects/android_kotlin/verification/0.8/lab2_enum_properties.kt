interface Greeting {
    fun say(): String
}

class Hello : Greeting {
    override fun say(): String {
        return "Hello"
    }
}

class Goodbye : Greeting {
    override fun say(): String {
        return "Goodbye"
    }
}

enum class GreetingType(val greeting: Greeting) {
    ARRIVING(Hello()),
    LEAVING(Goodbye())
}

fun main() {
    val type = GreetingType.ARRIVING
    println(type.greeting.say())
}
