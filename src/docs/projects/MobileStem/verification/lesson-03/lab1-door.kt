sealed class DoorState {
    data object Closed : DoorState()
    data object Open : DoorState()
    data object Locked : DoorState()
}

fun open(state: DoorState): DoorState = when (state) {
    is DoorState.Closed -> DoorState.Open
    else -> error("Cannot open from $state")
}

fun close(state: DoorState): DoorState = when (state) {
    is DoorState.Open -> DoorState.Closed
    else -> error("Cannot close from $state")
}

fun lock(state: DoorState): DoorState = when (state) {
    is DoorState.Closed -> DoorState.Locked
    else -> error("Cannot lock from $state")
}

fun main() {
    var door: DoorState = DoorState.Closed
    door = open(door)
    println(door)
    door = close(door)
    println(door)
    door = lock(door)
    println(door)
    door = open(door)
    println(door)
}
