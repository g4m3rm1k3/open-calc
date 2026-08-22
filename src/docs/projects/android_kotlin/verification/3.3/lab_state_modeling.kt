data class LabCounter(val count: Int, val step: Int)

fun increment(counter: LabCounter): LabCounter = counter.copy(count = counter.count + counter.step)

fun main() {
    val original = LabCounter(count = 0, step = 5)
    val updated = increment(original)
    println("original: $original")
    println("updated: $updated")
}
