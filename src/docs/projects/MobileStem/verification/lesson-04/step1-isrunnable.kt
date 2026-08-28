interface CapabilityChecker {
    fun isAvailable(featureName: String): Boolean
}

class FakeCapabilityChecker(private val availableFeatures: Set<String>) : CapabilityChecker {
    override fun isAvailable(featureName: String): Boolean = featureName in availableFeatures
}

data class Instrument(val id: String, val label: String, val description: String, val requiredFeature: String)

object InstrumentCatalog {
    val all = listOf(
        Instrument("accelerometer", "Accelerometer", "d", "android.hardware.sensor.accelerometer"),
        Instrument("gyroscope", "Gyroscope", "d", "android.hardware.sensor.gyroscope"),
        Instrument("microphone", "Microphone", "d", "android.hardware.microphone"),
        Instrument("gps", "GPS", "d", "android.hardware.location.gps"),
        Instrument("camera", "Camera", "d", "android.hardware.camera.any")
    )
}

data class ExperimentDefinition(
    val id: String,
    val title: String,
    val description: String,
    val category: String,
    val requiredInstrumentIds: List<String>
)

fun isRunnable(definition: ExperimentDefinition, checker: CapabilityChecker): Boolean {
    return definition.requiredInstrumentIds.all { instrumentId ->
        val instrument = InstrumentCatalog.all.first { it.id == instrumentId }
        checker.isAvailable(instrument.requiredFeature)
    }
}

fun main() {
    val checker = FakeCapabilityChecker(availableFeatures = setOf("android.hardware.sensor.accelerometer"))
    val generic = ExperimentDefinition("generic", "Generic Experiment", "d", "General", emptyList())
    val motion = ExperimentDefinition("motion", "Motion Test", "d", "Motion", listOf("accelerometer", "gyroscope"))
    println(isRunnable(generic, checker))
    println(isRunnable(motion, checker))
}
