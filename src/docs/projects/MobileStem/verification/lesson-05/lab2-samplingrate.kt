data class Sample(val timestampMillis: Long, val value: Double)

fun samplingRateHz(samples: List<Sample>): Double {
    if (samples.size < 2) return 0.0
    val totalSpanMillis = samples.last().timestampMillis - samples.first().timestampMillis
    val intervalCount = samples.size - 1
    val averageIntervalMillis = totalSpanMillis.toDouble() / intervalCount
    return 1000.0 / averageIntervalMillis
}

fun main() {
    val samples = listOf(
        Sample(0, 0.1),
        Sample(100, 0.2),
        Sample(200, 0.15),
        Sample(300, 0.18)
    )
    println(samplingRateHz(samples))
}
