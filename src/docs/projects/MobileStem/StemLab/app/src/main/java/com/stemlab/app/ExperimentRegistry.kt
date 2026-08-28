package com.stemlab.app

data class ExperimentDefinition(
    val id: String,
    val title: String,
    val description: String,
    val category: String,
    val requiredInstrumentIds: List<String>
)

object ExperimentRegistry {
    private val definitions = mutableListOf<ExperimentDefinition>()

    fun register(definition: ExperimentDefinition) {
        definitions.add(definition)
    }

    fun all(): List<ExperimentDefinition> = definitions.toList()
}

fun isRunnable(definition: ExperimentDefinition, checker: CapabilityChecker): Boolean {
    return definition.requiredInstrumentIds.all { instrumentId ->
        val instrument = InstrumentCatalog.all.first { it.id == instrumentId }
        checker.isAvailable(instrument.requiredFeature)
    }
}

fun registerBuiltInExperiments() {
    ExperimentRegistry.register(
        ExperimentDefinition(
            id = "generic",
            title = "Generic Experiment",
            description = "A minimal configure/run/stop/save workflow with no real measurement yet.",
            category = "General",
            requiredInstrumentIds = emptyList()
        )
    )
}
