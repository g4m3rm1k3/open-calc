import React from "react";

export default function AntiderivativeDefinitionLesson({ params }) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          What is an Antiderivative?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Understanding the fundamental relationship between functions and their
          rates of change
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-4">
          The Core Idea: Reversing Differentiation
        </h3>
        <div className="space-y-4 text-blue-700 dark:text-blue-400">
          <p>
            <strong>Differentiation</strong> takes a function and gives you its
            rate of change:
          </p>
          <div className="bg-white dark:bg-slate-800 p-4 rounded border-l-4 border-blue-500">
            <p className="font-mono text-center dark:text-blue-100">
              If f(x) = x², then f'(x) = 2x
            </p>
            <p className="text-sm text-center mt-2 dark:text-blue-300">
              The derivative tells us: "This function increases at twice the
              x-value"
            </p>
          </div>

          <p>
            <strong>Antidifferentiation</strong> asks the reverse question:
            given a rate of change, what function was changing at that rate?
          </p>
          <div className="bg-white dark:bg-slate-800 p-4 rounded border-l-4 border-green-500">
            <p className="font-mono text-center dark:text-green-100">
              If we know f'(x) = 2x, what is f(x)?
            </p>
            <p className="text-sm text-center mt-2 dark:text-green-300">
              The antiderivative answers: "x²" (among others)
            </p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-4">
          Precise Definition
        </h3>
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded border-l-4 border-green-500 text-green-900 dark:text-green-100">
            <p className="font-semibold">Definition:</p>
            <p className="font-mono text-lg">
              F is an antiderivative of f on an interval I if F'(x) = f(x) for
              every x in I.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded">
              <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                Example 1: Power Rule
              </h4>
              <p className="font-mono dark:text-white">f(x) = 2x</p>
              <p className="font-mono dark:text-white">F(x) = x²</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Check: F'(x) = 2x ✓</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded">
              <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                Example 2: Trigonometric
              </h4>
              <p className="font-mono dark:text-white">f(x) = cos(x)</p>
              <p className="font-mono dark:text-white">F(x) = sin(x)</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Check: F'(x) = cos(x) ✓
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-300 mb-4">
          Why "Anti" Differentiation?
        </h3>
        <div className="space-y-4 text-yellow-700 dark:text-yellow-400">
          <p>
            The prefix "anti" comes from Greek "anti" meaning "against" or
            "opposite". Just as subtraction is the "opposite" of addition,
            antidifferentiation is the "opposite" of differentiation.
          </p>

          <div className="bg-white dark:bg-slate-800 p-4 rounded">
            <p className="text-center font-mono dark:text-yellow-100">
              Differentiation: f(x) → f'(x)
            </p>
            <p className="text-center font-mono mt-2 dark:text-yellow-100">
              Antidifferentiation: f'(x) → f(x)
            </p>
          </div>

          <p>
            <strong>Key Insight:</strong> Every differentiation rule you know
            can be read backwards to give an antidifferentiation rule. You
            already know how to antidifferentiate — you just need to reverse
            your differentiation knowledge!
          </p>
        </div>
      </div>

      <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-purple-800 dark:text-purple-300 mb-4">
          The Fundamental Question
        </h3>
        <div className="space-y-4 text-purple-700 dark:text-purple-400">
          <p>
            When we ask "what function has derivative f(x)?", we're asking about
            the function's history — what it was doing before we started
            measuring its rate of change.
          </p>

          <div className="bg-white dark:bg-slate-800 p-4 rounded">
            <p className="text-center dark:text-purple-100">
              <strong>Given:</strong> A car is traveling at 60 mph right now
            </p>
            <p className="text-center mt-2 dark:text-purple-100">
              <strong>Question:</strong> Where was the car 2 hours ago?
            </p>
            <p className="text-center mt-2 text-sm text-gray-600 dark:text-purple-300">
              The antiderivative gives infinitely many possible answers
              (depending on where it started)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
