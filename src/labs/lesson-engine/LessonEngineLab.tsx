import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'
import { parseLesson } from '../../engine/lesson/parser'
import { executeCode } from '../../engine/lesson/executor'
import LessonView from '../../engine/lesson/LessonView'
import { SERIES } from './series'
import type { SeriesMeta } from './series'
import type { ParsedLesson } from '../../engine/lesson/types'
import { resetSQLDatabase } from '../../utils/inlineRunner.js'
import { GLASS_META } from '../../styles/courseColors.js'
import CircularProgress from '../../components/ui/CircularProgress.jsx'
import LessonSourceEditor from '../../components/lesson-builder/blocks/LessonSourceEditor.jsx'

function getSeriesMeta(series: SeriesMeta) {
  const langColorMap: Record<string, keyof typeof GLASS_META> = {
    python: 'emerald',
    javascript: 'yellow',
    html: 'orange',
    css: 'sky',
    cpp: 'blue',
    csharp: 'purple',
    java: 'red',
    typescript: 'blue',
    sql: 'teal',
    bash: 'slate'
  }

  if (series.id === 'dsa-python') return GLASS_META['indigo'];
  if (series.id === 'css-professional') return GLASS_META['violet'];
  if (series.id === 'css-visual-design') return GLASS_META['pink'];
  if (series.id === 'contributor-series') return GLASS_META['slate'];

  const color = langColorMap[series.lang] || 'slate';
  return GLASS_META[color] || GLASS_META['slate'];
}

// Vite ?raw imports for all lesson markdown files
import pfLevel0  from './content/python-fundamentals/level-0.md?raw'
import pfLevel1  from './content/python-fundamentals/level-1.md?raw'
import pfLevel2  from './content/python-fundamentals/level-2.md?raw'
import pfLevel3  from './content/python-fundamentals/level-3.md?raw'
import pfLevel4  from './content/python-fundamentals/level-4.md?raw'
import pfLevel5  from './content/python-fundamentals/level-5.md?raw'
import pfLevel6  from './content/python-fundamentals/level-6.md?raw'
import pfLevel7  from './content/python-fundamentals/level-7.md?raw'
import pfLevel8  from './content/python-fundamentals/level-8.md?raw'
import pfLevel9  from './content/python-fundamentals/level-9.md?raw'
import pfLevel10 from './content/python-fundamentals/level-10.md?raw'
import pfLevel11 from './content/python-fundamentals/level-11.md?raw'
import pfLevel12 from './content/python-fundamentals/level-12.md?raw'
import pfLevel13 from './content/python-fundamentals/level-13.md?raw'
import pfLevel14 from './content/python-fundamentals/level-14.md?raw'
import pfLevel15 from './content/python-fundamentals/level-15.md?raw'
import pfLevel16 from './content/python-fundamentals/level-16.md?raw'
import pfLevel17 from './content/python-fundamentals/level-17.md?raw'
import pfLevel18 from './content/python-fundamentals/level-18.md?raw'
import pfLevel19 from './content/python-fundamentals/level-19.md?raw'
import pfLevel20 from './content/python-fundamentals/level-20.md?raw'
import pfLevel21 from './content/python-fundamentals/level-21.md?raw'
import pfLevel22 from './content/python-fundamentals/level-22.md?raw'
import pfLevel23 from './content/python-fundamentals/level-23.md?raw'
import pfLevel24 from './content/python-fundamentals/level-24.md?raw'
import pfLevel25 from './content/python-fundamentals/level-25.md?raw'
import pfLevel26 from './content/python-fundamentals/level-26.md?raw'
import pfLevel27 from './content/python-fundamentals/level-27.md?raw'
import pfLevel28 from './content/python-fundamentals/level-28.md?raw'
import pfLevel29 from './content/python-fundamentals/level-29.md?raw'
import pfLevel30 from './content/python-fundamentals/level-30.md?raw'
import pfLevel31 from './content/python-fundamentals/level-31.md?raw'
import pfLevel32 from './content/python-fundamentals/level-32.md?raw'
import pfLevel33 from './content/python-fundamentals/level-33.md?raw'
import pfLevel34 from './content/python-fundamentals/level-34.md?raw'
import pfLevel35 from './content/python-fundamentals/level-35.md?raw'
import pfLevel36 from './content/python-fundamentals/level-36.md?raw'

import dsaLevel0  from './content/dsa-python/level-0.md?raw'
import dsaLevel1  from './content/dsa-python/level-1.md?raw'
import dsaLevel2  from './content/dsa-python/level-2.md?raw'
import dsaLevel3  from './content/dsa-python/level-3.md?raw'
import dsaLevel4  from './content/dsa-python/level-4.md?raw'
import dsaLevel5  from './content/dsa-python/level-5.md?raw'
import dsaLevel6  from './content/dsa-python/level-6.md?raw'
import dsaLevel7  from './content/dsa-python/level-7.md?raw'
import dsaLevel8  from './content/dsa-python/level-8.md?raw'
import dsaLevel9  from './content/dsa-python/level-9.md?raw'
import dsaLevel10 from './content/dsa-python/level-10.md?raw'

import jsLevel0 from './content/javascript-fundamentals/level-0.md?raw'
import jsLevel1 from './content/javascript-fundamentals/level-1.md?raw'
import jsLevel2 from './content/javascript-fundamentals/level-2.md?raw'
import jsLevel3 from './content/javascript-fundamentals/level-3.md?raw'
import jsLevel4 from './content/javascript-fundamentals/level-4.md?raw'
import jsLevel5 from './content/javascript-fundamentals/level-5.md?raw'
import jsLevel6 from './content/javascript-fundamentals/level-6.md?raw'
import jsLevel7 from './content/javascript-fundamentals/level-7.md?raw'
import jsLevel8 from './content/javascript-fundamentals/level-8.md?raw'
import jsLevel9 from './content/javascript-fundamentals/level-9.md?raw'

import cssSelLevel0 from './content/css-selectors/level-0.md?raw'
import cssSelLevel1 from './content/css-selectors/level-1.md?raw'
import cssSelLevel2 from './content/css-selectors/level-2.md?raw'
import cssSelLevel3 from './content/css-selectors/level-3.md?raw'
import cssSelLevel4 from './content/css-selectors/level-4.md?raw'
import cssSelLevel5 from './content/css-selectors/level-5.md?raw'
import cssSelLevel6 from './content/css-selectors/level-6.md?raw'
import cssSelLevel7 from './content/css-selectors/level-7.md?raw'

import cssBmLevel0 from './content/css-box-model/level-0.md?raw'
import cssBmLevel1 from './content/css-box-model/level-1.md?raw'
import cssBmLevel2 from './content/css-box-model/level-2.md?raw'
import cssBmLevel3 from './content/css-box-model/level-3.md?raw'
import cssBmLevel4 from './content/css-box-model/level-4.md?raw'
import cssBmLevel5 from './content/css-box-model/level-5.md?raw'
import cssBmLevel6 from './content/css-box-model/level-6.md?raw'
import cssBmLevel7 from './content/css-box-model/level-7.md?raw'

import cssLayoutLevel0 from './content/css-layout/level-0.md?raw'
import cssLayoutLevel1 from './content/css-layout/level-1.md?raw'
import cssLayoutLevel2 from './content/css-layout/level-2.md?raw'
import cssLayoutLevel3 from './content/css-layout/level-3.md?raw'
import cssLayoutLevel4 from './content/css-layout/level-4.md?raw'
import cssLayoutLevel5 from './content/css-layout/level-5.md?raw'
import cssLayoutLevel6 from './content/css-layout/level-6.md?raw'
import cssLayoutLevel7 from './content/css-layout/level-7.md?raw'

import cssGridLevel0 from './content/css-grid/level-0.md?raw'
import cssGridLevel1 from './content/css-grid/level-1.md?raw'
import cssGridLevel2 from './content/css-grid/level-2.md?raw'
import cssGridLevel3 from './content/css-grid/level-3.md?raw'
import cssGridLevel4 from './content/css-grid/level-4.md?raw'
import cssGridLevel5 from './content/css-grid/level-5.md?raw'
import cssGridLevel6 from './content/css-grid/level-6.md?raw'
import cssGridLevel7 from './content/css-grid/level-7.md?raw'

import cssFlexLevel0 from './content/css-flexbox/level-0.md?raw'
import cssFlexLevel1 from './content/css-flexbox/level-1.md?raw'
import cssFlexLevel2 from './content/css-flexbox/level-2.md?raw'
import cssFlexLevel3 from './content/css-flexbox/level-3.md?raw'
import cssFlexLevel4 from './content/css-flexbox/level-4.md?raw'
import cssFlexLevel5 from './content/css-flexbox/level-5.md?raw'
import cssFlexLevel6 from './content/css-flexbox/level-6.md?raw'
import cssFlexLevel7 from './content/css-flexbox/level-7.md?raw'
import cssFlexLevel8 from './content/css-flexbox/level-8.md?raw'

import cssLevel0 from './content/css-fundamentals/level-0.md?raw'
import cssLevel1 from './content/css-fundamentals/level-1.md?raw'
import cssLevel2 from './content/css-fundamentals/level-2.md?raw'
import cssLevel3 from './content/css-fundamentals/level-3.md?raw'
import cssLevel4 from './content/css-fundamentals/level-4.md?raw'
import cssLevel5 from './content/css-fundamentals/level-5.md?raw'
import cssLevel6 from './content/css-fundamentals/level-6.md?raw'
import cssLevel7 from './content/css-fundamentals/level-7.md?raw'
import cssLevel8 from './content/css-fundamentals/level-8.md?raw'
import cssLevel9 from './content/css-fundamentals/level-9.md?raw'

import cppLevel0 from './content/cpp-fundamentals/level-0.md?raw'
import cppLevel1 from './content/cpp-fundamentals/level-1.md?raw'
import cppLevel2 from './content/cpp-fundamentals/level-2.md?raw'
import cppLevel3 from './content/cpp-fundamentals/level-3.md?raw'
import cppLevel4 from './content/cpp-fundamentals/level-4.md?raw'
import cppLevel5 from './content/cpp-fundamentals/level-5.md?raw'
import cppLevel6 from './content/cpp-fundamentals/level-6.md?raw'
import cppLevel7 from './content/cpp-fundamentals/level-7.md?raw'

import csharpLevel0 from './content/csharp-fundamentals/level-0.md?raw'
import csharpLevel1 from './content/csharp-fundamentals/level-1.md?raw'
import csharpLevel2 from './content/csharp-fundamentals/level-2.md?raw'
import csharpLevel3 from './content/csharp-fundamentals/level-3.md?raw'

import javaLevel0 from './content/java-fundamentals/level-0.md?raw'
import javaLevel1 from './content/java-fundamentals/level-1.md?raw'
import javaLevel2 from './content/java-fundamentals/level-2.md?raw'
import javaLevel3 from './content/java-fundamentals/level-3.md?raw'

import htmlDomLevel0  from './content/html-dom/level-0.md?raw'
import htmlDomLevel1  from './content/html-dom/level-1.md?raw'
import htmlDomLevel2  from './content/html-dom/level-2.md?raw'
import htmlDomLevel3  from './content/html-dom/level-3.md?raw'
import htmlDomLevel4  from './content/html-dom/level-4.md?raw'
import htmlDomLevel5  from './content/html-dom/level-5.md?raw'
import htmlDomLevel6  from './content/html-dom/level-6.md?raw'
import htmlDomLevel7  from './content/html-dom/level-7.md?raw'
import htmlDomLevel8  from './content/html-dom/level-8.md?raw'
import htmlDomLevel9  from './content/html-dom/level-9.md?raw'
import htmlDomLevel10 from './content/html-dom/level-10.md?raw'
import htmlDomLevel11 from './content/html-dom/level-11.md?raw'

import contrLevel0 from './content/contributor-series/level-0.md?raw'
import contrLevel1 from './content/contributor-series/level-1.md?raw'
import contrLevel2 from './content/contributor-series/level-2.md?raw'
import contrLevel3 from './content/contributor-series/level-3.md?raw'
import contrLevel4 from './content/contributor-series/level-4.md?raw'
import contrLevel5 from './content/contributor-series/level-5.md?raw'
import contrLevel6 from './content/contributor-series/level-6.md?raw'
import contrLevel7 from './content/contributor-series/level-7.md?raw'

import cssProfLevel0 from './content/css-professional/level-0.md?raw'
import cssProfLevel1 from './content/css-professional/level-1.md?raw'
import cssProfLevel2 from './content/css-professional/level-2.md?raw'
import cssProfLevel3 from './content/css-professional/level-3.md?raw'
import cssProfLevel4 from './content/css-professional/level-4.md?raw'
import cssProfLevel5 from './content/css-professional/level-5.md?raw'
import cssProfLevel6 from './content/css-professional/level-6.md?raw'
import cssProfLevel7 from './content/css-professional/level-7.md?raw'

import cssVdLevel0 from './content/css-visual-design/level-0.md?raw'
import cssVdLevel1 from './content/css-visual-design/level-1.md?raw'
import cssVdLevel2 from './content/css-visual-design/level-2.md?raw'
import cssVdLevel3 from './content/css-visual-design/level-3.md?raw'
import cssVdLevel4 from './content/css-visual-design/level-4.md?raw'
import cssVdLevel5 from './content/css-visual-design/level-5.md?raw'
import cssVdLevel6 from './content/css-visual-design/level-6.md?raw'
import cssVdLevel7 from './content/css-visual-design/level-7.md?raw'

import cssRespLevel0 from './content/css-responsive/level-0.md?raw'
import cssRespLevel1 from './content/css-responsive/level-1.md?raw'
import cssRespLevel2 from './content/css-responsive/level-2.md?raw'
import cssRespLevel3 from './content/css-responsive/level-3.md?raw'
import cssRespLevel4 from './content/css-responsive/level-4.md?raw'
import cssRespLevel5 from './content/css-responsive/level-5.md?raw'
import cssRespLevel6 from './content/css-responsive/level-6.md?raw'
import cssRespLevel7 from './content/css-responsive/level-7.md?raw'

import cssAnimLevel0 from './content/css-animation/level-0.md?raw'
import cssAnimLevel1 from './content/css-animation/level-1.md?raw'
import cssAnimLevel2 from './content/css-animation/level-2.md?raw'
import cssAnimLevel3 from './content/css-animation/level-3.md?raw'
import cssAnimLevel4 from './content/css-animation/level-4.md?raw'
import cssAnimLevel5 from './content/css-animation/level-5.md?raw'
import cssAnimLevel6 from './content/css-animation/level-6.md?raw'

import tsLevel0 from './content/typescript-fundamentals/level-0.md?raw'
import tsLevel1 from './content/typescript-fundamentals/level-1.md?raw'
import tsLevel2 from './content/typescript-fundamentals/level-2.md?raw'
import tsLevel3 from './content/typescript-fundamentals/level-3.md?raw'
import tsLevel4 from './content/typescript-fundamentals/level-4.md?raw'
import tsLevel5 from './content/typescript-fundamentals/level-5.md?raw'
import tsLevel6 from './content/typescript-fundamentals/level-6.md?raw'
import tsLevel7 from './content/typescript-fundamentals/level-7.md?raw'

import sqlLevel0 from './content/sql-fundamentals/level-0.md?raw'
import sqlLevel1 from './content/sql-fundamentals/level-1.md?raw'
import sqlLevel2 from './content/sql-fundamentals/level-2.md?raw'
import sqlLevel3 from './content/sql-fundamentals/level-3.md?raw'
import sqlLevel4 from './content/sql-fundamentals/level-4.md?raw'
import sqlLevel5 from './content/sql-fundamentals/level-5.md?raw'
import sqlLevel6 from './content/sql-fundamentals/level-6.md?raw'
import sqlLevel7 from './content/sql-fundamentals/level-7.md?raw'

import beLevel0 from './content/backend-fundamentals/level-0.md?raw'
import beLevel1 from './content/backend-fundamentals/level-1.md?raw'
import beLevel2 from './content/backend-fundamentals/level-2.md?raw'
import beLevel3 from './content/backend-fundamentals/level-3.md?raw'
import beLevel4 from './content/backend-fundamentals/level-4.md?raw'
import beLevel5 from './content/backend-fundamentals/level-5.md?raw'
import beLevel6 from './content/backend-fundamentals/level-6.md?raw'
import beLevel7 from './content/backend-fundamentals/level-7.md?raw'

import gitLevel0 from './content/git-version-control/level-0.md?raw'
import gitLevel1 from './content/git-version-control/level-1.md?raw'
import gitLevel2 from './content/git-version-control/level-2.md?raw'
import gitLevel3 from './content/git-version-control/level-3.md?raw'
import gitLevel4 from './content/git-version-control/level-4.md?raw'
import gitLevel5 from './content/git-version-control/level-5.md?raw'
import gitLevel6 from './content/git-version-control/level-6.md?raw'
import gitLevel7 from './content/git-version-control/level-7.md?raw'

import gitAdvLevel0 from './content/git-advanced/level-0.md?raw'
import gitAdvLevel1 from './content/git-advanced/level-1.md?raw'
import gitAdvLevel2 from './content/git-advanced/level-2.md?raw'
import gitAdvLevel3 from './content/git-advanced/level-3.md?raw'
import gitAdvLevel4 from './content/git-advanced/level-4.md?raw'
import gitAdvLevel5 from './content/git-advanced/level-5.md?raw'
import gitAdvLevel6 from './content/git-advanced/level-6.md?raw'
import gitAdvLevel7 from './content/git-advanced/level-7.md?raw'

import scLevel0  from './content/software-construction/level-0.md?raw'
import scLevel1  from './content/software-construction/level-1.md?raw'
import scLevel2  from './content/software-construction/level-2.md?raw'
import scLevel3  from './content/software-construction/level-3.md?raw'
import scLevel4  from './content/software-construction/level-4.md?raw'
import scLevel5  from './content/software-construction/level-5.md?raw'
import scLevel6  from './content/software-construction/level-6.md?raw'
import scLevel7  from './content/software-construction/level-7.md?raw'
import scLevel8  from './content/software-construction/level-8.md?raw'
import scLevel9  from './content/software-construction/level-9.md?raw'
import scLevel10 from './content/software-construction/level-10.md?raw'
import scLevel11 from './content/software-construction/level-11.md?raw'
import scLevel12 from './content/software-construction/level-12.md?raw'
import scLevel13 from './content/software-construction/level-13.md?raw'
import scLevel14 from './content/software-construction/level-14.md?raw'

import csfLevel0 from './content/cs-foundations/level-0.md?raw'
import csfLevel1 from './content/cs-foundations/level-1.md?raw'
import csfLevel2 from './content/cs-foundations/level-2.md?raw'
import csfLevel3 from './content/cs-foundations/level-3.md?raw'
import csfLevel4 from './content/cs-foundations/level-4.md?raw'
import csfLevel5 from './content/cs-foundations/level-5.md?raw'
import csfLevel6 from './content/cs-foundations/level-6.md?raw'
import csfLevel7 from './content/cs-foundations/level-7.md?raw'
import csfLevel8 from './content/cs-foundations/level-8.md?raw'

import dbgLevel0 from './content/debugging-fundamentals/level-0.md?raw'
import dbgLevel1 from './content/debugging-fundamentals/level-1.md?raw'
import dbgLevel2 from './content/debugging-fundamentals/level-2.md?raw'
import dbgLevel3 from './content/debugging-fundamentals/level-3.md?raw'
import dbgLevel4 from './content/debugging-fundamentals/level-4.md?raw'
import dbgLevel5 from './content/debugging-fundamentals/level-5.md?raw'
import dbgLevel6 from './content/debugging-fundamentals/level-6.md?raw'
import dbgLevel7 from './content/debugging-fundamentals/level-7.md?raw'

import fpLevel0 from './content/functional-programming/level-0.md?raw'
import fpLevel1 from './content/functional-programming/level-1.md?raw'
import fpLevel2 from './content/functional-programming/level-2.md?raw'
import fpLevel3 from './content/functional-programming/level-3.md?raw'
import fpLevel4 from './content/functional-programming/level-4.md?raw'
import fpLevel5 from './content/functional-programming/level-5.md?raw'

import dbdLevel0 from './content/database-design/level-0.md?raw'
import dbdLevel1 from './content/database-design/level-1.md?raw'
import dbdLevel2 from './content/database-design/level-2.md?raw'
import dbdLevel3 from './content/database-design/level-3.md?raw'
import dbdLevel4 from './content/database-design/level-4.md?raw'
import dbdLevel5 from './content/database-design/level-5.md?raw'

import bapiLevel0 from './content/browser-apis/level-0.md?raw'
import bapiLevel1 from './content/browser-apis/level-1.md?raw'
import bapiLevel2 from './content/browser-apis/level-2.md?raw'
import bapiLevel3 from './content/browser-apis/level-3.md?raw'
import bapiLevel4 from './content/browser-apis/level-4.md?raw'

import doLevel0 from './content/devops-concepts/level-0.md?raw'
import doLevel1 from './content/devops-concepts/level-1.md?raw'
import doLevel2 from './content/devops-concepts/level-2.md?raw'
import doLevel3 from './content/devops-concepts/level-3.md?raw'
import doLevel4 from './content/devops-concepts/level-4.md?raw'
import doLevel5 from './content/devops-concepts/level-5.md?raw'

import ccLevel0 from './content/clean-code/level-0.md?raw'
import ccLevel1 from './content/clean-code/level-1.md?raw'
import ccLevel2 from './content/clean-code/level-2.md?raw'
import ccLevel3 from './content/clean-code/level-3.md?raw'
import ccLevel4 from './content/clean-code/level-4.md?raw'
import ccLevel5 from './content/clean-code/level-5.md?raw'

import oopLevel0 from './content/oop-design/level-0.md?raw'
import oopLevel1 from './content/oop-design/level-1.md?raw'
import oopLevel2 from './content/oop-design/level-2.md?raw'
import oopLevel3 from './content/oop-design/level-3.md?raw'
import oopLevel4 from './content/oop-design/level-4.md?raw'

import testLevel0 from './content/testing-fundamentals/level-0.md?raw'
import testLevel1 from './content/testing-fundamentals/level-1.md?raw'
import testLevel2 from './content/testing-fundamentals/level-2.md?raw'
import testLevel3 from './content/testing-fundamentals/level-3.md?raw'
import testLevel4 from './content/testing-fundamentals/level-4.md?raw'

import asyncLevel0 from './content/async-programming/level-0.md?raw'
import asyncLevel1 from './content/async-programming/level-1.md?raw'
import asyncLevel2 from './content/async-programming/level-2.md?raw'
import asyncLevel3 from './content/async-programming/level-3.md?raw'
import asyncLevel4 from './content/async-programming/level-4.md?raw'

import perfLevel0 from './content/performance-engineering/level-0.md?raw'
import perfLevel1 from './content/performance-engineering/level-1.md?raw'
import perfLevel2 from './content/performance-engineering/level-2.md?raw'
import perfLevel3 from './content/performance-engineering/level-3.md?raw'

import feLevel0 from './content/frontend-engineering/level-0.md?raw'
import feLevel1 from './content/frontend-engineering/level-1.md?raw'
import feLevel2 from './content/frontend-engineering/level-2.md?raw'
import feLevel3 from './content/frontend-engineering/level-3.md?raw'

import wsLevel0 from './content/web-security/level-0.md?raw'
import wsLevel1 from './content/web-security/level-1.md?raw'
import wsLevel2 from './content/web-security/level-2.md?raw'
import wsLevel3 from './content/web-security/level-3.md?raw'

import dpLevel0 from './content/design-patterns/level-0.md?raw'
import dpLevel1 from './content/design-patterns/level-1.md?raw'
import dpLevel2 from './content/design-patterns/level-2.md?raw'
import dpLevel3 from './content/design-patterns/level-3.md?raw'
import dpLevel4 from './content/design-patterns/level-4.md?raw'

import restLevel0 from './content/rest-apis/level-0.md?raw'
import restLevel1 from './content/rest-apis/level-1.md?raw'
import restLevel2 from './content/rest-apis/level-2.md?raw'
import restLevel3 from './content/rest-apis/level-3.md?raw'
import restLevel4 from './content/rest-apis/level-4.md?raw'

import reactLevel0 from './content/react-fundamentals/level-0.md?raw'
import reactLevel1 from './content/react-fundamentals/level-1.md?raw'
import reactLevel2 from './content/react-fundamentals/level-2.md?raw'
import reactLevel3 from './content/react-fundamentals/level-3.md?raw'
import reactLevel4 from './content/react-fundamentals/level-4.md?raw'

import rustLevel0 from './content/rust-fundamentals/level-0.md?raw'
import rustLevel1 from './content/rust-fundamentals/level-1.md?raw'
import rustLevel2 from './content/rust-fundamentals/level-2.md?raw'
import rustLevel3 from './content/rust-fundamentals/level-3.md?raw'
import rustLevel4 from './content/rust-fundamentals/level-4.md?raw'

import goLevel0 from './content/go-fundamentals/level-0.md?raw'
import goLevel1 from './content/go-fundamentals/level-1.md?raw'
import goLevel2 from './content/go-fundamentals/level-2.md?raw'
import goLevel3 from './content/go-fundamentals/level-3.md?raw'
import goLevel4 from './content/go-fundamentals/level-4.md?raw'

import saLevel0 from './content/software-architecture/level-0.md?raw'
import saLevel1 from './content/software-architecture/level-1.md?raw'
import saLevel2 from './content/software-architecture/level-2.md?raw'
import saLevel3 from './content/software-architecture/level-3.md?raw'

import peLevel0 from './content/professional-engineering/level-0.md?raw'
import peLevel1 from './content/professional-engineering/level-1.md?raw'
import peLevel2 from './content/professional-engineering/level-2.md?raw'
import peLevel3 from './content/professional-engineering/level-3.md?raw'
import peLevel4 from './content/professional-engineering/level-4.md?raw'

import vueLevel0 from './content/vue-fundamentals/level-0.md?raw'
import vueLevel1 from './content/vue-fundamentals/level-1.md?raw'
import vueLevel2 from './content/vue-fundamentals/level-2.md?raw'
import vueLevel3 from './content/vue-fundamentals/level-3.md?raw'

const LESSON_FILES: Record<string, string> = {
  'python-fundamentals/level-0.md':  pfLevel0,
  'python-fundamentals/level-1.md':  pfLevel1,
  'python-fundamentals/level-2.md':  pfLevel2,
  'python-fundamentals/level-3.md':  pfLevel3,
  'python-fundamentals/level-4.md':  pfLevel4,
  'python-fundamentals/level-5.md':  pfLevel5,
  'python-fundamentals/level-6.md':  pfLevel6,
  'python-fundamentals/level-7.md':  pfLevel7,
  'python-fundamentals/level-8.md':  pfLevel8,
  'python-fundamentals/level-9.md':  pfLevel9,
  'python-fundamentals/level-10.md': pfLevel10,
  'python-fundamentals/level-11.md': pfLevel11,
  'python-fundamentals/level-12.md': pfLevel12,
  'python-fundamentals/level-13.md': pfLevel13,
  'python-fundamentals/level-14.md': pfLevel14,
  'python-fundamentals/level-15.md': pfLevel15,
  'python-fundamentals/level-16.md': pfLevel16,
  'python-fundamentals/level-17.md': pfLevel17,
  'python-fundamentals/level-18.md': pfLevel18,
  'python-fundamentals/level-19.md': pfLevel19,
  'python-fundamentals/level-20.md': pfLevel20,
  'python-fundamentals/level-21.md': pfLevel21,
  'python-fundamentals/level-22.md': pfLevel22,
  'python-fundamentals/level-23.md': pfLevel23,
  'python-fundamentals/level-24.md': pfLevel24,
  'python-fundamentals/level-25.md': pfLevel25,
  'python-fundamentals/level-26.md': pfLevel26,
  'python-fundamentals/level-27.md': pfLevel27,
  'python-fundamentals/level-28.md': pfLevel28,
  'python-fundamentals/level-29.md': pfLevel29,
  'python-fundamentals/level-30.md': pfLevel30,
  'python-fundamentals/level-31.md': pfLevel31,
  'python-fundamentals/level-32.md': pfLevel32,
  'python-fundamentals/level-33.md': pfLevel33,
  'python-fundamentals/level-34.md': pfLevel34,
  'python-fundamentals/level-35.md': pfLevel35,
  'python-fundamentals/level-36.md': pfLevel36,
  'dsa-python/level-0.md':  dsaLevel0,
  'dsa-python/level-1.md':  dsaLevel1,
  'dsa-python/level-2.md':  dsaLevel2,
  'dsa-python/level-3.md':  dsaLevel3,
  'dsa-python/level-4.md':  dsaLevel4,
  'dsa-python/level-5.md':  dsaLevel5,
  'dsa-python/level-6.md':  dsaLevel6,
  'dsa-python/level-7.md':  dsaLevel7,
  'dsa-python/level-8.md':  dsaLevel8,
  'dsa-python/level-9.md':  dsaLevel9,
  'dsa-python/level-10.md': dsaLevel10,
  'javascript-fundamentals/level-0.md': jsLevel0,
  'javascript-fundamentals/level-1.md': jsLevel1,
  'javascript-fundamentals/level-2.md': jsLevel2,
  'javascript-fundamentals/level-3.md': jsLevel3,
  'javascript-fundamentals/level-4.md': jsLevel4,
  'javascript-fundamentals/level-5.md': jsLevel5,
  'javascript-fundamentals/level-6.md': jsLevel6,
  'javascript-fundamentals/level-7.md': jsLevel7,
  'javascript-fundamentals/level-8.md': jsLevel8,
  'javascript-fundamentals/level-9.md': jsLevel9,
  'css-selectors/level-0.md': cssSelLevel0,
  'css-selectors/level-1.md': cssSelLevel1,
  'css-selectors/level-2.md': cssSelLevel2,
  'css-selectors/level-3.md': cssSelLevel3,
  'css-selectors/level-4.md': cssSelLevel4,
  'css-selectors/level-5.md': cssSelLevel5,
  'css-selectors/level-6.md': cssSelLevel6,
  'css-selectors/level-7.md': cssSelLevel7,
  'css-box-model/level-0.md': cssBmLevel0,
  'css-box-model/level-1.md': cssBmLevel1,
  'css-box-model/level-2.md': cssBmLevel2,
  'css-box-model/level-3.md': cssBmLevel3,
  'css-box-model/level-4.md': cssBmLevel4,
  'css-box-model/level-5.md': cssBmLevel5,
  'css-box-model/level-6.md': cssBmLevel6,
  'css-box-model/level-7.md': cssBmLevel7,
  'css-layout/level-0.md': cssLayoutLevel0,
  'css-layout/level-1.md': cssLayoutLevel1,
  'css-layout/level-2.md': cssLayoutLevel2,
  'css-layout/level-3.md': cssLayoutLevel3,
  'css-layout/level-4.md': cssLayoutLevel4,
  'css-layout/level-5.md': cssLayoutLevel5,
  'css-layout/level-6.md': cssLayoutLevel6,
  'css-layout/level-7.md': cssLayoutLevel7,
  'css-grid/level-0.md': cssGridLevel0,
  'css-grid/level-1.md': cssGridLevel1,
  'css-grid/level-2.md': cssGridLevel2,
  'css-grid/level-3.md': cssGridLevel3,
  'css-grid/level-4.md': cssGridLevel4,
  'css-grid/level-5.md': cssGridLevel5,
  'css-grid/level-6.md': cssGridLevel6,
  'css-grid/level-7.md': cssGridLevel7,
  'css-flexbox/level-0.md': cssFlexLevel0,
  'css-flexbox/level-1.md': cssFlexLevel1,
  'css-flexbox/level-2.md': cssFlexLevel2,
  'css-flexbox/level-3.md': cssFlexLevel3,
  'css-flexbox/level-4.md': cssFlexLevel4,
  'css-flexbox/level-5.md': cssFlexLevel5,
  'css-flexbox/level-6.md': cssFlexLevel6,
  'css-flexbox/level-7.md': cssFlexLevel7,
  'css-flexbox/level-8.md': cssFlexLevel8,
  'css-fundamentals/level-0.md': cssLevel0,
  'css-fundamentals/level-1.md': cssLevel1,
  'css-fundamentals/level-2.md': cssLevel2,
  'css-fundamentals/level-3.md': cssLevel3,
  'css-fundamentals/level-4.md': cssLevel4,
  'css-fundamentals/level-5.md': cssLevel5,
  'css-fundamentals/level-6.md': cssLevel6,
  'css-fundamentals/level-7.md': cssLevel7,
  'css-fundamentals/level-8.md': cssLevel8,
  'css-fundamentals/level-9.md': cssLevel9,
  'cpp-fundamentals/level-0.md': cppLevel0,
  'cpp-fundamentals/level-1.md': cppLevel1,
  'cpp-fundamentals/level-2.md': cppLevel2,
  'cpp-fundamentals/level-3.md': cppLevel3,
  'cpp-fundamentals/level-4.md': cppLevel4,
  'cpp-fundamentals/level-5.md': cppLevel5,
  'cpp-fundamentals/level-6.md': cppLevel6,
  'cpp-fundamentals/level-7.md': cppLevel7,
  'csharp-fundamentals/level-0.md': csharpLevel0,
  'csharp-fundamentals/level-1.md': csharpLevel1,
  'csharp-fundamentals/level-2.md': csharpLevel2,
  'csharp-fundamentals/level-3.md': csharpLevel3,
  'java-fundamentals/level-0.md': javaLevel0,
  'java-fundamentals/level-1.md': javaLevel1,
  'java-fundamentals/level-2.md': javaLevel2,
  'java-fundamentals/level-3.md': javaLevel3,
  'html-dom/level-0.md':  htmlDomLevel0,
  'html-dom/level-1.md':  htmlDomLevel1,
  'html-dom/level-2.md':  htmlDomLevel2,
  'html-dom/level-3.md':  htmlDomLevel3,
  'html-dom/level-4.md':  htmlDomLevel4,
  'html-dom/level-5.md':  htmlDomLevel5,
  'html-dom/level-6.md':  htmlDomLevel6,
  'html-dom/level-7.md':  htmlDomLevel7,
  'html-dom/level-8.md':  htmlDomLevel8,
  'html-dom/level-9.md':  htmlDomLevel9,
  'html-dom/level-10.md': htmlDomLevel10,
  'html-dom/level-11.md': htmlDomLevel11,
  'contributor-series/level-0.md': contrLevel0,
  'contributor-series/level-1.md': contrLevel1,
  'contributor-series/level-2.md': contrLevel2,
  'contributor-series/level-3.md': contrLevel3,
  'contributor-series/level-4.md': contrLevel4,
  'contributor-series/level-5.md': contrLevel5,
  'contributor-series/level-6.md': contrLevel6,
  'contributor-series/level-7.md': contrLevel7,
  'css-professional/level-0.md': cssProfLevel0,
  'css-professional/level-1.md': cssProfLevel1,
  'css-professional/level-2.md': cssProfLevel2,
  'css-professional/level-3.md': cssProfLevel3,
  'css-professional/level-4.md': cssProfLevel4,
  'css-professional/level-5.md': cssProfLevel5,
  'css-professional/level-6.md': cssProfLevel6,
  'css-professional/level-7.md': cssProfLevel7,
  'css-visual-design/level-0.md': cssVdLevel0,
  'css-visual-design/level-1.md': cssVdLevel1,
  'css-visual-design/level-2.md': cssVdLevel2,
  'css-visual-design/level-3.md': cssVdLevel3,
  'css-visual-design/level-4.md': cssVdLevel4,
  'css-visual-design/level-5.md': cssVdLevel5,
  'css-visual-design/level-6.md': cssVdLevel6,
  'css-visual-design/level-7.md': cssVdLevel7,
  'css-responsive/level-0.md': cssRespLevel0,
  'css-responsive/level-1.md': cssRespLevel1,
  'css-responsive/level-2.md': cssRespLevel2,
  'css-responsive/level-3.md': cssRespLevel3,
  'css-responsive/level-4.md': cssRespLevel4,
  'css-responsive/level-5.md': cssRespLevel5,
  'css-responsive/level-6.md': cssRespLevel6,
  'css-responsive/level-7.md': cssRespLevel7,
  'css-animation/level-0.md': cssAnimLevel0,
  'css-animation/level-1.md': cssAnimLevel1,
  'css-animation/level-2.md': cssAnimLevel2,
  'css-animation/level-3.md': cssAnimLevel3,
  'css-animation/level-4.md': cssAnimLevel4,
  'css-animation/level-5.md': cssAnimLevel5,
  'css-animation/level-6.md': cssAnimLevel6,
  'typescript-fundamentals/level-0.md': tsLevel0,
  'typescript-fundamentals/level-1.md': tsLevel1,
  'typescript-fundamentals/level-2.md': tsLevel2,
  'typescript-fundamentals/level-3.md': tsLevel3,
  'typescript-fundamentals/level-4.md': tsLevel4,
  'typescript-fundamentals/level-5.md': tsLevel5,
  'typescript-fundamentals/level-6.md': tsLevel6,
  'typescript-fundamentals/level-7.md': tsLevel7,
  'sql-fundamentals/level-0.md': sqlLevel0,
  'sql-fundamentals/level-1.md': sqlLevel1,
  'sql-fundamentals/level-2.md': sqlLevel2,
  'sql-fundamentals/level-3.md': sqlLevel3,
  'sql-fundamentals/level-4.md': sqlLevel4,
  'sql-fundamentals/level-5.md': sqlLevel5,
  'sql-fundamentals/level-6.md': sqlLevel6,
  'sql-fundamentals/level-7.md': sqlLevel7,
  'backend-fundamentals/level-0.md': beLevel0,
  'backend-fundamentals/level-1.md': beLevel1,
  'backend-fundamentals/level-2.md': beLevel2,
  'backend-fundamentals/level-3.md': beLevel3,
  'backend-fundamentals/level-4.md': beLevel4,
  'backend-fundamentals/level-5.md': beLevel5,
  'backend-fundamentals/level-6.md': beLevel6,
  'backend-fundamentals/level-7.md': beLevel7,
  'git-version-control/level-0.md': gitLevel0,
  'git-version-control/level-1.md': gitLevel1,
  'git-version-control/level-2.md': gitLevel2,
  'git-version-control/level-3.md': gitLevel3,
  'git-version-control/level-4.md': gitLevel4,
  'git-version-control/level-5.md': gitLevel5,
  'git-version-control/level-6.md': gitLevel6,
  'git-version-control/level-7.md': gitLevel7,
  'git-advanced/level-0.md': gitAdvLevel0,
  'git-advanced/level-1.md': gitAdvLevel1,
  'git-advanced/level-2.md': gitAdvLevel2,
  'git-advanced/level-3.md': gitAdvLevel3,
  'git-advanced/level-4.md': gitAdvLevel4,
  'git-advanced/level-5.md': gitAdvLevel5,
  'git-advanced/level-6.md': gitAdvLevel6,
  'git-advanced/level-7.md': gitAdvLevel7,
  'software-construction/level-0.md':  scLevel0,
  'software-construction/level-1.md':  scLevel1,
  'software-construction/level-2.md':  scLevel2,
  'software-construction/level-3.md':  scLevel3,
  'software-construction/level-4.md':  scLevel4,
  'software-construction/level-5.md':  scLevel5,
  'software-construction/level-6.md':  scLevel6,
  'software-construction/level-7.md':  scLevel7,
  'software-construction/level-8.md':  scLevel8,
  'software-construction/level-9.md':  scLevel9,
  'software-construction/level-10.md': scLevel10,
  'software-construction/level-11.md': scLevel11,
  'software-construction/level-12.md': scLevel12,
  'software-construction/level-13.md': scLevel13,
  'software-construction/level-14.md': scLevel14,
  'cs-foundations/level-0.md': csfLevel0,
  'cs-foundations/level-1.md': csfLevel1,
  'cs-foundations/level-2.md': csfLevel2,
  'cs-foundations/level-3.md': csfLevel3,
  'cs-foundations/level-4.md': csfLevel4,
  'cs-foundations/level-5.md': csfLevel5,
  'cs-foundations/level-6.md': csfLevel6,
  'cs-foundations/level-7.md': csfLevel7,
  'cs-foundations/level-8.md': csfLevel8,
  'debugging-fundamentals/level-0.md': dbgLevel0,
  'debugging-fundamentals/level-1.md': dbgLevel1,
  'debugging-fundamentals/level-2.md': dbgLevel2,
  'debugging-fundamentals/level-3.md': dbgLevel3,
  'debugging-fundamentals/level-4.md': dbgLevel4,
  'debugging-fundamentals/level-5.md': dbgLevel5,
  'debugging-fundamentals/level-6.md': dbgLevel6,
  'debugging-fundamentals/level-7.md': dbgLevel7,
  'functional-programming/level-0.md': fpLevel0,
  'functional-programming/level-1.md': fpLevel1,
  'functional-programming/level-2.md': fpLevel2,
  'functional-programming/level-3.md': fpLevel3,
  'functional-programming/level-4.md': fpLevel4,
  'functional-programming/level-5.md': fpLevel5,
  'database-design/level-0.md': dbdLevel0,
  'database-design/level-1.md': dbdLevel1,
  'database-design/level-2.md': dbdLevel2,
  'database-design/level-3.md': dbdLevel3,
  'database-design/level-4.md': dbdLevel4,
  'database-design/level-5.md': dbdLevel5,
  'browser-apis/level-0.md': bapiLevel0,
  'browser-apis/level-1.md': bapiLevel1,
  'browser-apis/level-2.md': bapiLevel2,
  'browser-apis/level-3.md': bapiLevel3,
  'browser-apis/level-4.md': bapiLevel4,
  'devops-concepts/level-0.md': doLevel0,
  'devops-concepts/level-1.md': doLevel1,
  'devops-concepts/level-2.md': doLevel2,
  'devops-concepts/level-3.md': doLevel3,
  'devops-concepts/level-4.md': doLevel4,
  'devops-concepts/level-5.md': doLevel5,
  'clean-code/level-0.md': ccLevel0,
  'clean-code/level-1.md': ccLevel1,
  'clean-code/level-2.md': ccLevel2,
  'clean-code/level-3.md': ccLevel3,
  'clean-code/level-4.md': ccLevel4,
  'clean-code/level-5.md': ccLevel5,
  'oop-design/level-0.md': oopLevel0,
  'oop-design/level-1.md': oopLevel1,
  'oop-design/level-2.md': oopLevel2,
  'oop-design/level-3.md': oopLevel3,
  'oop-design/level-4.md': oopLevel4,
  'testing-fundamentals/level-0.md': testLevel0,
  'testing-fundamentals/level-1.md': testLevel1,
  'testing-fundamentals/level-2.md': testLevel2,
  'testing-fundamentals/level-3.md': testLevel3,
  'testing-fundamentals/level-4.md': testLevel4,
  'async-programming/level-0.md': asyncLevel0,
  'async-programming/level-1.md': asyncLevel1,
  'async-programming/level-2.md': asyncLevel2,
  'async-programming/level-3.md': asyncLevel3,
  'async-programming/level-4.md': asyncLevel4,
  'performance-engineering/level-0.md': perfLevel0,
  'performance-engineering/level-1.md': perfLevel1,
  'performance-engineering/level-2.md': perfLevel2,
  'performance-engineering/level-3.md': perfLevel3,
  'frontend-engineering/level-0.md': feLevel0,
  'frontend-engineering/level-1.md': feLevel1,
  'frontend-engineering/level-2.md': feLevel2,
  'frontend-engineering/level-3.md': feLevel3,
  'web-security/level-0.md': wsLevel0,
  'web-security/level-1.md': wsLevel1,
  'web-security/level-2.md': wsLevel2,
  'web-security/level-3.md': wsLevel3,
  'design-patterns/level-0.md': dpLevel0,
  'design-patterns/level-1.md': dpLevel1,
  'design-patterns/level-2.md': dpLevel2,
  'design-patterns/level-3.md': dpLevel3,
  'design-patterns/level-4.md': dpLevel4,
  'rest-apis/level-0.md': restLevel0,
  'rest-apis/level-1.md': restLevel1,
  'rest-apis/level-2.md': restLevel2,
  'rest-apis/level-3.md': restLevel3,
  'rest-apis/level-4.md': restLevel4,
  'react-fundamentals/level-0.md': reactLevel0,
  'react-fundamentals/level-1.md': reactLevel1,
  'react-fundamentals/level-2.md': reactLevel2,
  'react-fundamentals/level-3.md': reactLevel3,
  'react-fundamentals/level-4.md': reactLevel4,
  'rust-fundamentals/level-0.md': rustLevel0,
  'rust-fundamentals/level-1.md': rustLevel1,
  'rust-fundamentals/level-2.md': rustLevel2,
  'rust-fundamentals/level-3.md': rustLevel3,
  'rust-fundamentals/level-4.md': rustLevel4,
  'go-fundamentals/level-0.md': goLevel0,
  'go-fundamentals/level-1.md': goLevel1,
  'go-fundamentals/level-2.md': goLevel2,
  'go-fundamentals/level-3.md': goLevel3,
  'go-fundamentals/level-4.md': goLevel4,
  'software-architecture/level-0.md': saLevel0,
  'software-architecture/level-1.md': saLevel1,
  'software-architecture/level-2.md': saLevel2,
  'software-architecture/level-3.md': saLevel3,
  'professional-engineering/level-0.md': peLevel0,
  'professional-engineering/level-1.md': peLevel1,
  'professional-engineering/level-2.md': peLevel2,
  'professional-engineering/level-3.md': peLevel3,
  'professional-engineering/level-4.md': peLevel4,
  'vue-fundamentals/level-0.md': vueLevel0,
  'vue-fundamentals/level-1.md': vueLevel1,
  'vue-fundamentals/level-2.md': vueLevel2,
  'vue-fundamentals/level-3.md': vueLevel3,
}

interface Props {
  onBack?: () => void
}

type View =
  | { kind: 'series-list' }
  | { kind: 'level-list'; series: SeriesMeta }
  | { kind: 'lesson'; lesson: ParsedLesson; series: SeriesMeta }

const PROGRESS_KEY = 'oc-lesson-progress'

export default function LessonEngineLab({ onBack }: Props) {
  const { themeStyles, studioTheme } = useGlobalTheme()
  const ui = (themeStyles as any).ui

  const [view, setView] = useState<View>({ kind: 'series-list' })
  const [editingFile, setEditingFile] = useState<string | null>(null)

  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY)
      return new Set(raw ? JSON.parse(raw) : [])
    } catch { return new Set() }
  })

  function markComplete(seriesId: string, level: number) {
    const key = `${seriesId}:${level}`
    setCompleted(prev => {
      const next = new Set(prev)
      next.add(key)
      try { localStorage.setItem(PROGRESS_KEY, JSON.stringify([...next])) } catch {}
      return next
    })
  }

  function resetSeriesProgress(seriesId: string) {
    setCompleted(prev => {
      const next = new Set([...prev].filter(k => !k.startsWith(`${seriesId}:`)))
      try { localStorage.setItem(PROGRESS_KEY, JSON.stringify([...next])) } catch {}
      return next
    })
  }

  function openLesson(file: string, series: SeriesMeta) {
    const raw = LESSON_FILES[file]
    if (!raw) return
    resetSQLDatabase()
    setView({ kind: 'lesson', lesson: parseLesson(raw), series })
  }

  return (
    <div
      className={`w-full h-full flex flex-col overflow-hidden ${ui.bg0} ${ui.txt1}`}
    >
      {view.kind === 'series-list' && (
        <SeriesListView ui={ui} onBack={onBack} onSelectSeries={s => setView({ kind: 'level-list', series: s })} completed={completed} />
      )}
      {view.kind === 'level-list' && (
        <LevelListView ui={ui} series={view.series} completed={completed} available={LESSON_FILES} onBack={() => setView({ kind: 'series-list' })} onSelectLevel={file => openLesson(file, view.series)} onResetProgress={() => resetSeriesProgress(view.series.id)} />
      )}
      {view.kind === 'lesson' && (() => {
        const currentIdx = view.series.levels.findIndex(l => l.level === view.lesson.level)
        const nextLevel = view.series.levels[currentIdx + 1]
        const currentFile = view.series.levels[currentIdx]?.file
        return (
          <LessonView
            lesson={view.lesson}
            executor={executeCode}
            ui={ui}
            seriesLabel={view.series.label}
            onBack={() => setView({ kind: 'level-list', series: view.series })}
            onBackToSeriesList={() => setView({ kind: 'series-list' })}
            onComplete={() => {
              markComplete(view.series.id, view.lesson.level)
              if (nextLevel) openLesson(nextLevel.file, view.series)
              else setView({ kind: 'level-list', series: view.series })
            }}
            onEdit={currentFile ? () => setEditingFile(currentFile) : undefined}
          />
        )
      })()}
      {editingFile && (
        <LessonSourceEditor
          filePath={`src/labs/lesson-engine/content/${editingFile}`}
          onClose={() => setEditingFile(null)}
          onSaved={(newSource: string) => {
            setView(v => v.kind === 'lesson' ? { ...v, lesson: parseLesson(newSource) } : v)
          }}
        />
      )}
      <LessonJumpTool onJump={openLesson} />
    </div>
  )
}

// ── Dev lesson-jump tool — type any series/level/file, bypasses progression locks ──

function LessonJumpTool({ onJump }: { onJump: (file: string, series: SeriesMeta) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const all = useMemo(
    () => SERIES.flatMap(s => s.levels.map(level => ({ series: s, level }))),
    []
  )

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return all.slice(0, 30)
    return all
      .filter(({ series, level }) =>
        series.id.toLowerCase().includes(q) ||
        series.label.toLowerCase().includes(q) ||
        level.title.toLowerCase().includes(q) ||
        level.file.toLowerCase().includes(q) ||
        `level-${level.level}` === q ||
        String(level.level) === q
      )
      .slice(0, 30)
  }, [all, query])

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Jump to any lesson (dev)"
        style={{ position: 'fixed', bottom: 8, right: 8, zIndex: 9998, opacity: 0.25, fontSize: 11 }}
        className="px-1.5 py-0.5 rounded border border-white/20 bg-black/40 text-white hover:opacity-100 transition-opacity cursor-pointer"
      >
        🔧
      </button>
    )
  }

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh' }}
      onClick={() => { setOpen(false); setQuery('') }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: 560, maxHeight: '70vh', background: '#161b22', border: '1px solid #30363d', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
      >
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="series id, level title, or file path…"
          style={{ padding: '12px 16px', background: '#0d1117', color: '#e6edf3', border: 'none', outline: 'none', fontSize: 14, borderBottom: '1px solid #30363d' }}
          onKeyDown={e => {
            if (e.key === 'Escape') { setOpen(false); setQuery('') }
            if (e.key === 'Enter' && matches[0]) {
              onJump(matches[0].level.file, matches[0].series)
              setOpen(false); setQuery('')
            }
          }}
        />
        <div style={{ overflowY: 'auto' }}>
          {matches.map(({ series, level }) => (
            <button
              key={level.file}
              type="button"
              onClick={() => { onJump(level.file, series); setOpen(false); setQuery('') }}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', background: 'transparent', border: 'none', borderTop: '1px solid #21262d', color: '#c9d1d9', cursor: 'pointer', fontSize: 13 }}
            >
              <span style={{ color: '#58a6ff' }}>{series.id}</span>{' '}
              <span style={{ color: '#8b949e' }}>/ level-{level.level}</span> — {level.title}
            </button>
          ))}
          {query && matches.length === 0 && (
            <div style={{ padding: 16, color: '#8b949e', fontSize: 13 }}>No matches</div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Series list ───────────────────────────────────────────────────────────────

function SeriesListView({ ui, onBack, onSelectSeries, completed }: {
  ui: any
  onBack?: () => void
  onSelectSeries: (s: SeriesMeta) => void
  completed: Set<string>
}) {
  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-3 px-4 py-2.5 border-b ${ui.border} ${ui.bg1} shrink-0 shadow-sm z-10 relative`}>
        {onBack && (
          <button type="button" onClick={onBack} className={`text-sm ${ui.txt2} ${ui.hoverTx} bg-transparent border-none cursor-pointer flex items-center gap-1`}>
            ← Labs
          </button>
        )}
        <span className={`text-sm font-bold ${ui.txt1}`}>Learn to Code</span>
      </div>
      <div className={`flex-1 overflow-y-auto p-6 lg:p-12 bg-gradient-to-br from-transparent to-black/5 dark:to-white/5`}>
        <div className="max-w-7xl mx-auto">
          <h1 className={`text-4xl font-black tracking-tight mb-2 ${ui.txt1}`}>Choose a series</h1>
          <p className={`text-lg mb-10 ${ui.txt2} max-w-2xl`}>Write real code. Run it against real tests. See what's happening inside.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERIES.map(s => {
              const meta = getSeriesMeta(s);
              const doneCount = s.levels.filter(l => completed.has(`${s.id}:${l.level}`)).length;
              const progress = s.levels.length > 0 ? (doneCount / s.levels.length) * 100 : 0;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelectSeries(s)}
                  className={`relative flex flex-col text-left p-6 rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden group 
                    ${ui.border} ${ui.bg1} hover:-translate-y-1 hover:shadow-xl`}
                >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${meta.bar}`} />
                  <div className={`text-4xl mb-4 w-14 h-14 flex items-center justify-center rounded-2xl bg-white/50 dark:bg-black/20 backdrop-blur-sm border ${meta.border} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <span style={{ filter: `drop-shadow(${meta.glow})` }}>{s.emoji}</span>
                  </div>
                  <div className={`font-black text-xl mb-2 bg-clip-text text-transparent bg-gradient-to-r ${meta.header}`}>
                    {s.label}
                  </div>
                  <div className={`text-sm mb-6 leading-relaxed ${ui.txt2} opacity-80 group-hover:opacity-100 transition-opacity`}>
                    {s.description}
                  </div>
                  
                  <div className="mt-auto pt-4 flex w-full">
                    <CircularProgress
                      progress={progress}
                      label={doneCount === s.levels.length ? "Completed" : (doneCount === 0 ? "Not started" : "In progress")}
                      subLabel={`${doneCount}/${s.levels.length} complete`}
                      colorClass={meta.text.split(' ')[0]} // Get the non-dark class for the stroke
                      glow={meta.glow}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Level list ────────────────────────────────────────────────────────────────

function LevelListView({ ui, series, completed, available, onBack, onSelectLevel, onResetProgress }: {
  ui: any
  series: SeriesMeta
  completed: Set<string>
  available: Record<string, string>
  onBack: () => void
  onSelectLevel: (file: string) => void
  onResetProgress: () => void
}) {
  const doneCount = series.levels.filter(l => completed.has(`${series.id}:${l.level}`)).length
  const meta = getSeriesMeta(series)
  const progress = series.levels.length > 0 ? (doneCount / series.levels.length) * 100 : 0

  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-3 px-4 py-2.5 border-b ${ui.border} ${ui.bg1} shrink-0 shadow-sm z-10 relative`}>
        <button type="button" onClick={onBack} className={`text-sm ${ui.txt2} ${ui.hoverTx} bg-transparent border-none cursor-pointer flex items-center gap-1`}>
          ← Series
        </button>
        <span className={`text-sm font-bold ${ui.txt1}`}>{series.label}</span>
        {doneCount > 0 && (
          <button
            type="button"
            onClick={() => { if (window.confirm('Reset all progress for this series?')) onResetProgress() }}
            className={`ml-auto text-xs ${ui.txt2} hover:text-red-400 bg-transparent border-none cursor-pointer transition-colors`}
          >Reset progress</button>
        )}
      </div>
      <div className={`flex-1 overflow-y-auto p-6 lg:p-12 bg-gradient-to-br from-transparent to-black/5 dark:to-white/5`}>
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
            <div className={`text-6xl w-24 h-24 flex items-center justify-center rounded-3xl bg-white/50 dark:bg-black/20 backdrop-blur-md border ${meta.border} shadow-lg shrink-0`}>
              <span style={{ filter: `drop-shadow(${meta.glow})` }}>{series.emoji}</span>
            </div>
            <div>
              <h1 className={`text-4xl md:text-5xl font-black tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r ${meta.header}`}>
                {series.label}
              </h1>
              <p className={`text-lg mb-6 ${ui.txt2} max-w-2xl leading-relaxed`}>{series.description}</p>
              
              {/* Progress bar */}
              <div className="flex items-center gap-4 max-w-md">
                <div className={`flex-1 h-3 rounded-full ${ui.bg2} overflow-hidden border ${ui.border}`}>
                  <div className={`h-full ${meta.bar} transition-all duration-500`} style={{ width: `${progress}%` }} />
                </div>
                <span className={`text-sm font-bold ${doneCount === series.levels.length ? 'text-emerald-500' : ui.txt2}`}>
                  {doneCount} / {series.levels.length} complete
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 relative">
            {/* Connecting line */}
            <div className={`absolute left-7 top-6 bottom-6 w-0.5 ${ui.bg2} -z-10 rounded-full`} />
            
            {series.levels.map((lvl, idx) => {
              const isDone     = completed.has(`${series.id}:${lvl.level}`)
              const isReady    = !!available[lvl.file]
              const prevLevel  = series.levels[idx - 1]
              const prevDone   = idx === 0 || completed.has(`${series.id}:${prevLevel.level}`)
              const isUnlocked = isReady && prevDone
              
              return (
                <button
                  key={lvl.level}
                  type="button"
                  onClick={() => isUnlocked && onSelectLevel(lvl.file)}
                  disabled={!isUnlocked}
                  className={`relative text-left px-6 py-5 rounded-2xl border transition-all duration-300 flex items-center gap-5 group
                    ${!isReady    ? `opacity-40 cursor-not-allowed ${ui.border} ${ui.bg1}` :
                      !isUnlocked ? `opacity-60 cursor-not-allowed ${ui.border} ${ui.bg1}` :
                      isDone      ? `cursor-pointer ${meta.border} bg-white/40 dark:bg-black/20 hover:scale-[1.01] hover:shadow-md` :
                                    `cursor-pointer ${meta.border} ${ui.bg1} hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10`}`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-2 shadow-sm transition-colors duration-300
                    ${isDone ? `border-emerald-500 bg-emerald-500/10 text-emerald-500` : 
                      isUnlocked ? `${meta.border} ${meta.bar} text-white` : 
                      `${ui.border} ${ui.bg2} ${ui.txt2}`}`}>
                    {isDone ? (
                      <span className="text-xl font-black">✓</span>
                    ) : !isUnlocked ? (
                      <span className="text-lg">🔒</span>
                    ) : (
                      <span className="text-xl font-black">{lvl.level}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <span className={`block text-xs font-bold uppercase tracking-widest mb-1
                      ${isDone ? 'text-emerald-500' : isUnlocked ? meta.text : ui.txt2}`}>
                      Level {lvl.level}
                    </span>
                    <span className={`block text-lg font-bold truncate ${isUnlocked ? ui.txt1 : ui.txt2}`}>
                      {lvl.title}
                    </span>
                  </div>

                  {!isReady ? (
                    <span className={`shrink-0 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${ui.bg2} ${ui.txt2}`}>
                      Coming soon
                    </span>
                  ) : !isUnlocked ? null : isDone ? null : (
                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${meta.bar} text-white opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 shadow-sm`}>
                      <span className="font-bold text-lg">→</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
