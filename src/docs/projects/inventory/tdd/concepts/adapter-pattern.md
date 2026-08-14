# Concept: The Adapter Pattern

**What you'll understand by the end:** how to build a simple, purpose-fit interface on top of a more complex or general system, taking only what a specific consumer actually needs.

**Prerequisites:** none.

## Setup

No install needed — any language works. The isolated example uses TypeScript.

## The Problem

A general-purpose system (a large configuration format, a full-featured library, another team's rich API) often supports far more than any one specific consumer needs — building a direct, tightly-coupled dependency on the *whole* thing means every consumer has to understand its full complexity, and any future change to that larger system risks breaking every consumer directly.

## The Isolated Example

A rich, general system:
```typescript
interface FullWeatherReport {
    temperatureCelsius: number;
    temperatureFahrenheit: number;
    humidityPercent: number;
    windSpeedKph: number;
    windDirectionDegrees: number;
    pressureHpa: number;
    forecast: { day: string; high: number; low: number }[];
}
```

A specific consumer that only ever needs one simple fact:
```typescript
interface SimpleTemperature {
    celsius: number;
}

function adaptWeather(full: FullWeatherReport): SimpleTemperature {
    return { celsius: full.temperatureCelsius };
}

function displayTemperature(temp: SimpleTemperature) {
    console.log(`${temp.celsius}°C`);
}

const report: FullWeatherReport = {
    temperatureCelsius: 21, temperatureFahrenheit: 70, humidityPercent: 40,
    windSpeedKph: 10, windDirectionDegrees: 270, pressureHpa: 1013, forecast: [],
};

displayTemperature(adaptWeather(report));
```

**Real output:**
```
21°C
```

**What this proves:** `displayTemperature` never had to know `FullWeatherReport` exists at all — it depends only on the small, simple `SimpleTemperature` shape; `adaptWeather` is the one, isolated place that bridges the gap between the two, and only it needs to change if the full report's own shape changes later.

## Mechanical Walkthrough

- The **adapter** (`adaptWeather`) is a function (or, in object-oriented designs, a class) whose entire job is translating from one shape/interface to another — it contains real logic (deciding *which* fields matter, and how), but no business logic beyond that translation.
- The **consumer** (`displayTemperature`) depends only on the simple, adapted shape — it has zero knowledge of, and zero dependency on, the larger system's actual structure.
- If the larger system's shape changes (say, `temperatureCelsius` gets renamed), only the adapter needs updating — every consumer, isolated behind the simple interface, keeps working unchanged.
- An adapter can also discard information deliberately — `SimpleTemperature` has no `windSpeedKph` field at all; that data isn't lost from the *source*, it's simply never made part of what this specific consumer depends on.

## CS Lens

This is the **Adapter** design pattern (one of the original "Gang of Four" design patterns): converting the interface of one system into an interface a specific client expects, without modifying either the original system or the client to know about each other directly. It's a specific application of a more general principle — depending on the smallest interface that satisfies a real need, rather than the largest one that happens to be available — sometimes separately named the **Interface Segregation Principle**.

Also recognized in: a database repository layer adapting a raw SQL row into a clean domain object, a payment-processing wrapper adapting several different real payment providers' very different APIs into one consistent interface an application actually calls, and any "porting only what's needed" decision in a codebase migrating or integrating with a larger, richer external system.

## SE Lens

The real, deliberate tradeoff: building an adapter costs a small amount of upfront translation code, and the consumer only ever sees what the adapter chooses to expose — genuinely useful data in the larger system that the adapter didn't anticipate needing stays unavailable until the adapter itself is extended. This is accepted specifically because it keeps the consumer's dependency surface small and stable — a much larger, richer system evolving underneath (new fields, restructured data, an entirely different provider) only ever requires updating the one, isolated adapter, not every place that consumes the simplified result.

## Connection

A specific, named instance of the same instinct behind `pure-functions-testability.md`'s separation of concerns and `typescript-typeof-returntype-utility.md`'s "derive, don't duplicate" impulse — here applied specifically to bridging between a large, general system and a small, focused consumer.

## Try It Yourself

1. Add a second consumer needing a *different* small slice of `FullWeatherReport` (say, wind conditions only) and write a second, separate adapter function for it — confirming multiple adapters can coexist, each exposing a different, purpose-fit view of the same underlying rich system.
2. Change `FullWeatherReport`'s `temperatureCelsius` field name to `tempC`, and confirm only `adaptWeather` needs updating — `displayTemperature` and `SimpleTemperature` require zero changes.
3. Find (or imagine) a real, large third-party API response your own project might consume, and sketch a minimal adapted interface exposing only the three or four fields a specific feature actually needs — reasoning about what's deliberately left out and why that's a safe, honest choice rather than an oversight.
