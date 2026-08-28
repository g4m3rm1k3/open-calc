package com.stemlab.app

sealed class StemArea(val id: String, val label: String) {
    object Instruments : StemArea("instruments", "Instruments")
    object Experiments : StemArea("experiments", "Experiments")
    object Data : StemArea("data", "Data")
    object Analysis : StemArea("analysis", "Analysis")

    companion object {
        val all = listOf(Instruments, Experiments, Data, Analysis)
    }
}
