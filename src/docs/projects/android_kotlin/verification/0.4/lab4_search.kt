fun main() {
    val ages = mutableMapOf<String, Int>()
    ages["Alice"] = 30
    ages["Bob"] = 25
    val searchName = "Bob"
    for (entry in ages) {
        if (entry.key == searchName) {
            println(entry.value)
        }
    }
}
