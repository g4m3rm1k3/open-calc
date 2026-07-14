import type { PracticeChallenge } from './loader'

export const title = 'Logical Operators'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Logical operators combine boolean values. Write `canRide(height, age)` returning true if `height >= 120 && age >= 8`.',
        starter: '',
        tests: `
assert canRide(130, 10) === true
assert canRide(100, 10) === false
assert canRide(130, 5) === false
`,
        solution: `function canRide(height, age) { return height >= 120 && age >= 8; }`,
      },
      {
        lang: 'typescript',
        prompt: 'Logical operators combine boolean values. Write `canRide(height, age)` returning true if `height >= 120 && age >= 8`.',
        starter: '',
        tests: `
assert canRide(130, 10) === true
assert canRide(100, 10) === false
assert canRide(130, 5) === false
`,
        solution: `function canRide(height: number, age: number): boolean { return height >= 120 && age >= 8; }`,
      },
      {
        lang: 'python',
        prompt: 'Logical operators combine boolean values. Write `can_ride(height, age)` returning True if `height >= 120 and age >= 8`.',
        starter: '',
        tests: `
assert can_ride(130, 10) == True
assert can_ride(100, 10) == False
assert can_ride(130, 5) == False
`,
        solution: `def can_ride(height, age):
    return height >= 120 and age >= 8`,
      },
      {
        lang: 'java',
        prompt: 'Logical operators combine boolean values. Write `canRide(height, age)` returning true if `height >= 120 && age >= 8`.',
        starter: '',
        tests: `
assert canRide(130, 10) == true
assert canRide(100, 10) == false
assert canRide(130, 5) == false
`,
        solution: `static boolean canRide(int height, int age) { return height >= 120 && age >= 8; }`,
      },
      {
        lang: 'csharp',
        prompt: 'Logical operators combine boolean values. Write `CanRide(height, age)` returning true if `height >= 120 && age >= 8`.',
        starter: '',
        tests: `
assert CanRide(130, 10) == true
assert CanRide(100, 10) == false
assert CanRide(130, 5) == false
`,
        solution: `static bool CanRide(int height, int age) { return height >= 120 && age >= 8; }`,
      },
      {
        lang: 'cpp',
        prompt: 'Logical operators combine boolean values. Write `canRide(height, age)` returning true if `height >= 120 && age >= 8`.',
        starter: '',
        tests: `
assert canRide(130, 10) == true
assert canRide(100, 10) == false
assert canRide(130, 5) == false
`,
        solution: `bool canRide(int height, int age) { return height >= 120 && age >= 8; }`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `shouldWater(isRaining, soilDry)`: true if the soil is dry AND it is NOT raining (use `&&` and `!`).',
        starter: `function shouldWater(isRaining, soilDry) {
  // TODO: return true if soilDry is true AND isRaining is false
}`,
        tests: `
assert shouldWater(false, true) === true
assert shouldWater(true, true) === false
assert shouldWater(false, false) === false
`,
        solution: `function shouldWater(isRaining, soilDry) {
  return soilDry && !isRaining;
}`,
      },
      {
        lang: 'typescript',
        prompt: 'Finish `shouldWater(isRaining, soilDry)`: true if the soil is dry AND it is NOT raining (use `&&` and `!`).',
        starter: `function shouldWater(isRaining: boolean, soilDry: boolean): boolean {
  // TODO: return true if soilDry is true AND isRaining is false
}`,
        tests: `
assert shouldWater(false, true) === true
assert shouldWater(true, true) === false
assert shouldWater(false, false) === false
`,
        solution: `function shouldWater(isRaining: boolean, soilDry: boolean): boolean {
  return soilDry && !isRaining;
}`,
      },
      {
        lang: 'python',
        prompt: 'Finish `should_water(is_raining, soil_dry)`: True if the soil is dry AND it is NOT raining (use `and` and `not`).',
        starter: `def should_water(is_raining, soil_dry):
    # TODO: return True if soil_dry is True AND is_raining is False
    pass`,
        tests: `
assert should_water(False, True) == True
assert should_water(True, True) == False
assert should_water(False, False) == False
`,
        solution: `def should_water(is_raining, soil_dry):
    return soil_dry and not is_raining`,
      },
      {
        lang: 'java',
        prompt: 'Finish `shouldWater(isRaining, soilDry)`: true if the soil is dry AND it is NOT raining (use `&&` and `!`).',
        starter: `static boolean shouldWater(boolean isRaining, boolean soilDry) {
    // TODO: return true if soilDry is true AND isRaining is false
    return false;
}`,
        tests: `
assert shouldWater(false, true) == true
assert shouldWater(true, true) == false
assert shouldWater(false, false) == false
`,
        solution: `static boolean shouldWater(boolean isRaining, boolean soilDry) {
    return soilDry && !isRaining;
}`,
      },
      {
        lang: 'csharp',
        prompt: 'Finish `ShouldWater(isRaining, soilDry)`: true if the soil is dry AND it is NOT raining (use `&&` and `!`).',
        starter: `static bool ShouldWater(bool isRaining, bool soilDry) {
    // TODO: return true if soilDry is true AND isRaining is false
    return false;
}`,
        tests: `
assert ShouldWater(false, true) == true
assert ShouldWater(true, true) == false
assert ShouldWater(false, false) == false
`,
        solution: `static bool ShouldWater(bool isRaining, bool soilDry) {
    return soilDry && !isRaining;
}`,
      },
      {
        lang: 'cpp',
        prompt: 'Finish `shouldWater(isRaining, soilDry)`: true if the soil is dry AND it is NOT raining (use `&&` and `!`).',
        starter: `bool shouldWater(bool isRaining, bool soilDry) {
    // TODO: return true if soilDry is true AND isRaining is false
    return false;
}`,
        tests: `
assert shouldWater(false, true) == true
assert shouldWater(true, true) == false
assert shouldWater(false, false) == false
`,
        solution: `bool shouldWater(bool isRaining, bool soilDry) {
    return soilDry && !isRaining;
}`,
      },
    ],
  },
]

export default challenges
