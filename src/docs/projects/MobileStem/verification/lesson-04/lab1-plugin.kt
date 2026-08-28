interface Plugin {
    val name: String
    fun run(): String
}

object PluginRegistry {
    private val plugins = mutableListOf<Plugin>()
    fun register(plugin: Plugin) {
        plugins.add(plugin)
    }
    fun all(): List<Plugin> = plugins.toList()
}

class GreetingPlugin : Plugin {
    override val name = "Greeting"
    override fun run() = "Hello from a plugin!"
}

class FarewellPlugin : Plugin {
    override val name = "Farewell"
    override fun run() = "Goodbye from a plugin!"
}

fun main() {
    PluginRegistry.register(GreetingPlugin())
    PluginRegistry.register(FarewellPlugin())
    PluginRegistry.all().forEach { plugin ->
        println("${plugin.name}: ${plugin.run()}")
    }
    println("Registered count: ${PluginRegistry.all().size}")
}
