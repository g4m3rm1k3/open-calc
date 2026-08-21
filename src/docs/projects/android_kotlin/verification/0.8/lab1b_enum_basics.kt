enum class Direction {
    NORTH, SOUTH, EAST, WEST
}

fun main() {
    val heading = Direction.NORTH
    println(heading)
    val description = when (heading) {
        Direction.NORTH -> "up"
        Direction.SOUTH -> "down"
        Direction.EAST -> "right"
        Direction.WEST -> "left"
    }
    println(description)
}
