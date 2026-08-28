data class Sample(val timestampMillis: Long, val value: Double)
data class Channel(val name: String, val unit: String, val samples: List<Sample>)

fun main() {
    val liveBuffer = mutableListOf(Sample(0, 0.1), Sample(100, 0.2))
    val recorded = Channel(name = "x", unit = "m/s^2", samples = liveBuffer)
    println("Right after recording: ${recorded.samples.size} samples")
    liveBuffer.add(Sample(200, 0.99))
    println("After more data arrives elsewhere: ${recorded.samples.size} samples")

    val safeCopy = Channel(name = "x", unit = "m/s^2", samples = liveBuffer.toList())
    liveBuffer.add(Sample(300, 0.5))
    println("Safe copy after more data arrives: ${safeCopy.samples.size} samples")
}
