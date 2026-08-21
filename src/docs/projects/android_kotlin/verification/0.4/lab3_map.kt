fun main() {
    val ages = mutableMapOf<String, Int>()
    ages["Alice"] = 30
    ages["Bob"] = 25
    println(ages)
    for (entry in ages) {
        println(entry.key)
        println(entry.value)
    }
}
