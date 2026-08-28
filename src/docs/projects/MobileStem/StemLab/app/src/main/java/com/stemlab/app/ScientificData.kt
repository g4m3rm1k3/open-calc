package com.stemlab.app

data class Sample(val timestampMillis: Long, val value: Double)

data class Channel(val name: String, val unit: String, val samples: List<Sample>)

data class Dataset(val channels: List<Channel>)

fun samplingRateHz(samples: List<Sample>): Double {
    if (samples.size < 2) return 0.0
    val totalSpanMillis = samples.last().timestampMillis - samples.first().timestampMillis
    val intervalCount = samples.size - 1
    val averageIntervalMillis = totalSpanMillis.toDouble() / intervalCount
    return 1000.0 / averageIntervalMillis
}

data class Trial(
    val id: String,
    val startedAtMillis: Long,
    val stoppedAtMillis: Long,
    val dataset: Dataset
)

data class Session(val id: String, val trials: List<Trial>)

data class Experiment(
    val id: String,
    val definitionId: String,
    val recordedAtMillis: Long,
    val sessions: List<Session>
)
