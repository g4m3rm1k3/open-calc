import callback from './callback.js'
import observer from './observer.js'
import strategy from './strategy.js'
import singleton from './singleton.js'
import hof from './hof.js'
import currying from './currying.js'
import memoization from './memoization.js'
import linked_list from './linked-list.js'
import stack from './stack.js'
import scope_chain from './scope-chain.js'
import closures from './closures.js'
import js_classes from './js-classes.js'
import inheritance from './inheritance.js'
import ts_interfaces from './ts-interfaces.js'
import ts_classes_mod from './ts-classes-mod.js'
import ts_generics_basics from './ts-generics-basics.js'
import factory from './factory.js'
import decorator from './decorator.js'
import command from './command.js'
import facade from './facade.js'
import builder from './builder.js'
import iterator from './iterator.js'
import queue from './queue.js'
import bst from './bst.js'
import hash_map from './hash-map.js'
import doubly_linked_list from './doubly-linked-list.js'
import event_loop from './event-loop.js'
import prototype_chain from './prototype-chain.js'
import promise from './promise.js'
import generator from './generator.js'
import proxy_reflect from './proxy-reflect.js'
import ts_union_types from './ts-union-types.js'
import ts_utility_types from './ts-utility-types.js'
import ts_conditional_types from './ts-conditional-types.js'

export const LESSONS = [
  // JS Fundamentals
  callback,
  hof,
  currying,
  memoization,
  closures,
  scope_chain,
  prototype_chain,
  generator,
  promise,
  proxy_reflect,
  event_loop,
  // OOP & Classes
  js_classes,
  inheritance,
  // Design Patterns
  observer,
  strategy,
  singleton,
  factory,
  decorator,
  command,
  facade,
  builder,
  iterator,
  // Data Structures
  linked_list,
  doubly_linked_list,
  stack,
  queue,
  bst,
  hash_map,
  // TypeScript
  ts_interfaces,
  ts_classes_mod,
  ts_generics_basics,
  ts_union_types,
  ts_utility_types,
  ts_conditional_types,
]
