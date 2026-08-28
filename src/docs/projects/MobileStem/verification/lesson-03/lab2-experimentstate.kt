sealed class ExperimentState {
    data object Configuring : ExperimentState()
    data class Running(val startedAtMillis: Long) : ExperimentState()
    data class Stopped(val startedAtMillis: Long, val stoppedAtMillis: Long) : ExperimentState()
    data class Saved(val startedAtMillis: Long, val stoppedAtMillis: Long) : ExperimentState()
}

fun start(state: ExperimentState, nowMillis: Long): ExperimentState = when (state) {
    is ExperimentState.Configuring -> ExperimentState.Running(startedAtMillis = nowMillis)
    else -> error("Cannot start from $state")
}

fun stop(state: ExperimentState, nowMillis: Long): ExperimentState = when (state) {
    is ExperimentState.Running -> ExperimentState.Stopped(state.startedAtMillis, nowMillis)
    else -> error("Cannot stop from $state")
}

fun save(state: ExperimentState): ExperimentState = when (state) {
    is ExperimentState.Stopped -> ExperimentState.Saved(state.startedAtMillis, state.stoppedAtMillis)
    else -> error("Cannot save from $state")
}

fun main() {
    var state: ExperimentState = ExperimentState.Configuring
    println(state)
    state = start(state, nowMillis = 1000L)
    println(state)
    state = stop(state, nowMillis = 5000L)
    println(state)
    state = save(state)
    println(state)
    state = start(state, nowMillis = 9000L)
    println(state)
}
