data class Person(val name: String, val age: Int)

fun main() {
    val a = Person("Ada", 36)
    val b = Person("Ada", 36)
    println(a == b)
    println(a)
    println(a.copy(age = 37))
}
