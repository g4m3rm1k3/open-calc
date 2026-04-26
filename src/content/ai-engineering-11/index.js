import promptEngineering from './ae11-01-prompt-engineering.js'
import fewShotCot from './ae11-02-few-shot-cot.js'
import structuredOutputs from './ae11-03-structured-outputs.js'
import embeddings from './ae11-04-embeddings.js'
import contextEngineering from './ae11-05-context-engineering.js'
import rag from './ae11-06-rag.js'
import advancedRag from './ae11-07-advanced-rag.js'
import fineTuningLora from './ae11-08-fine-tuning-lora.js'
import functionCalling from './ae11-09-function-calling.js'
import evals from './ae11-10-evals.js'
import cachingCost from './ae11-11-caching-cost.js'
import guardrails from './ae11-12-guardrails.js'
import production from './ae11-13-production.js'
import mcp from './ae11-14-mcp.js'
import promptCaching from './ae11-15-prompt-caching.js'
import langgraph from './ae11-16-langgraph.js'
import agentFrameworks from './ae11-17-agent-frameworks.js'

export default [
  {
    number: 'ae-p11',
    title: 'LLM Engineering',
    course: 'ai-engineering',
    lessons: [
      promptEngineering,
      fewShotCot,
      structuredOutputs,
      embeddings,
      contextEngineering,
      rag,
      advancedRag,
      fineTuningLora,
      functionCalling,
      evals,
      cachingCost,
      guardrails,
      production,
      mcp,
      promptCaching,
      langgraph,
      agentFrameworks,
    ],
  },
]
