data class Sample(val timestampMillis: Long, val value: Double)
data class Channel(val name: String, val unit: String, val samples: List<Sample>)
data class Dataset(val channels: List<Channel>)
data class Trial(val id: String, val startedAtMillis: Long, val stoppedAtMillis: Long, val dataset: Dataset)
data class Session(val id: String, val trials: List<Trial>)
data class Experiment(val id: String, val definitionId: String, val recordedAtMillis: Long, val sessions: List<Session>)

fun main() {
    val xChannel = Channel("x", "m/s^2", listOf(Sample(0, 0.01), Sample(100, 0.02)))
    val yChannel = Channel("y", "m/s^2", listOf(Sample(0, 9.81), Sample(100, 9.80)))
    val dataset = Dataset(listOf(xChannel, yChannel))
    val trial = Trial(id = "trial-1", startedAtMillis = 0, stoppedAtMillis = 100, dataset = dataset)
    val session = Session(id = "session-1", trials = listOf(trial))
    val experiment = Experiment(id = "exp-1", definitionId = "generic", recordedAtMillis = 1000, sessions = listOf(session))

    println(experiment.sessions.first().trials.first().dataset.channels.map { it.name })
    println(experiment.sessions.first().trials.first().dataset.channels.first().samples.size)
}
