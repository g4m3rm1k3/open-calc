package com.stemlab.app

sealed class Unit(val symbol: String)
data object Meter : Unit("m")

fun doSomething(callback: () -> Unit) {
    callback()
}

fun main() {
    doSomething { println("called") }
}
