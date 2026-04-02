import a01 from './A01_WhatIsAProgram.js'
import a02 from './A02_ValuesAndTypes.js'
import a03 from './A03_Expressions.js'
import a04 from './A04_Variables.js'
import a05 from './A05_State.js'
import a06 from './A06_BuiltinFunctions.js'
import a07 from './A07_Composition.js'
import a08 from './A08_DefiningFunctions.js'
import a09 from './A09_BooleanLogic.js'
import a10 from './A10_Conditionals.js'
import a11 from './A11_ForLoops.js'
import a12 from './A12_WhileLoops.js'
import a13 from './A13_Lists.js'
import a14 from './A14_DictsAndSets.js'
import a15 from './A15_Debugging.js'

import b01 from './B01_Arrays.js'
import b02 from './B02_Plotting.js'
import b03 from './B03_LinearFunctions.js'
import b04 from './B04_Exponentials.js'
import b05 from './B05_Vectors.js'
import b06 from './B06_DotProduct.js'
import b07 from './B07_Matrices.js'
import b08 from './B08_LinearSystems.js'

import c01 from './C01_TabularData.js'
import c02 from './C02_DescriptiveStats.js'
import c03 from './C03_DataCleaning.js'
import c04 from './C04_Transformation.js'
import c05 from './C05_Groupby.js'
import c06 from './C06_EDA.js'

import d01 from './D01_Probability.js'
import d02 from './D02_Distributions.js'
import d03 from './D03_LinearRegression.js'
import d04 from './D04_HypothesisTesting.js'
import d05 from './D05_GradientDescent.js'
import d06 from './D06_ModelEvaluation.js'

const TrackA = {
  number: 'ds1.1',
  title: 'Computational Foundations',
  course: 'data-science-1',
  lessons: [a01, a02, a03, a04, a05, a06, a07, a08, a09, a10, a11, a12, a13, a14, a15]
}

const TrackB = {
  number: 'ds1.2',
  title: 'Mathematical Computing',
  course: 'data-science-1',
  lessons: [b01, b02, b03, b04, b05, b06, b07, b08]
}

const TrackC = {
  number: 'ds1.3',
  title: 'Data Science Core',
  course: 'data-science-1',
  lessons: [c01, c02, c03, c04, c05, c06]
}

const TrackD = {
  number: 'ds1.4',
  title: 'Modeling & Inference',
  course: 'data-science-1',
  lessons: [d01, d02, d03, d04, d05, d06]
}

export default [TrackA, TrackB, TrackC, TrackD]
