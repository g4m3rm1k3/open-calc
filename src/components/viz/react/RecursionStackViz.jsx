import React, { useState, useEffect } from "react";

const factorial = (n) => {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
};

const fibonacci = (n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

const power = (base, exp) => {
  if (exp === 0) return 1;
  return base * power(base, exp - 1);
};

const FUNCTIONS = {
  factorial: {
    name: "Factorial",
    func: factorial,
    description: "n! = n × (n-1)!",
    baseCase: "n ≤ 1 → 1",
    example: "5! = 5 × 4 × 3 × 2 × 1 = 120",
  },
  fibonacci: {
    name: "Fibonacci",
    func: fibonacci,
    description: "F(n) = F(n-1) + F(n-2)",
    baseCase: "n ≤ 1 → n",
    example: "F(5) = F(4) + F(3) = 3 + 2 = 5",
  },
  power: {
    name: "Power",
    func: (n) => power(2, n),
    description: "2^n = 2 × 2^(n-1)",
    baseCase: "n = 0 → 1",
    example: "2^3 = 2 × 2 × 2 = 8",
  },
};

export default function RecursionStackViz() {
  const [selectedFunction, setSelectedFunction] = useState("factorial");
  const [inputValue, setInputValue] = useState(4);
  const [callStack, setCallStack] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [finalResult, setFinalResult] = useState(null);

  const func = FUNCTIONS[selectedFunction];

  const simulateRecursion = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setCallStack([]);
    setCurrentStep(0);
    setFinalResult(null);

    const stack = [];
    let step = 0;

    const traceCall = (name, args, depth) => {
      const callId = `${name}-${args.join(",")}-${depth}-${step++}`;
      stack.push({
        id: callId,
        function: name,
        args,
        depth,
        result: null,
        state: "calling",
      });
      setCallStack([...stack]);
      setCurrentStep(step);
      return callId;
    };

    const traceReturn = (callId, result) => {
      const callIndex = stack.findIndex((call) => call.id === callId);
      if (callIndex !== -1) {
        stack[callIndex].result = result;
        stack[callIndex].state = "returning";
        setCallStack([...stack]);
      }
    };

    const factorialWithTrace = (n, depth = 0) => {
      const callId = traceCall("factorial", [n], depth);

      if (n <= 1) {
        traceReturn(callId, 1);
        return 1;
      }

      const subResult = factorialWithTrace(n - 1, depth + 1);
      const result = n * subResult;
      traceReturn(callId, result);
      return result;
    };

    const fibonacciWithTrace = (n, depth = 0) => {
      const callId = traceCall("fibonacci", [n], depth);

      if (n <= 1) {
        traceReturn(callId, n);
        return n;
      }

      const subResult1 = fibonacciWithTrace(n - 1, depth + 1);
      const subResult2 = fibonacciWithTrace(n - 2, depth + 1);
      const result = subResult1 + subResult2;
      traceReturn(callId, result);
      return result;
    };

    const powerWithTrace = (base, exp, depth = 0) => {
      const callId = traceCall("power", [base, exp], depth);

      if (exp === 0) {
        traceReturn(callId, 1);
        return 1;
      }

      const subResult = powerWithTrace(base, exp - 1, depth + 1);
      const result = base * subResult;
      traceReturn(callId, result);
      return result;
    };

    let result;
    if (selectedFunction === "factorial") {
      result = factorialWithTrace(inputValue);
    } else if (selectedFunction === "fibonacci") {
      result = fibonacciWithTrace(inputValue);
    } else if (selectedFunction === "power") {
      result = powerWithTrace(2, inputValue);
    }

    setFinalResult(result);
    setIsAnimating(false);
  };

  const reset = () => {
    setCallStack([]);
    setCurrentStep(0);
    setFinalResult(null);
    setIsAnimating(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">
        The Call Stack: How Recursion Really Works
      </h2>

      <div className="mb-6">
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold mb-2">Choose a Recursive Function</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(FUNCTIONS).map(([key, f]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedFunction(key);
                  reset();
                }}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  selectedFunction === key
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white hover:bg-gray-50 border-gray-300"
                }`}
              >
                <div className="font-semibold mb-1">{f.name}</div>
                <div className="text-sm opacity-80">{f.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold mb-2">Current Function: {func.name}</h3>
          <p className="mb-2">
            <strong>Definition:</strong> {func.description}
          </p>
          <p className="mb-2">
            <strong>Base Case:</strong> {func.baseCase}
          </p>
          <p className="mb-2">
            <strong>Example:</strong> {func.example}
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Input Value: {inputValue}
            </label>
            <input
              type="range"
              min="1"
              max={selectedFunction === "fibonacci" ? "8" : "6"}
              value={inputValue}
              onChange={(e) => setInputValue(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              disabled={isAnimating}
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={simulateRecursion}
              disabled={isAnimating}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors font-bold"
            >
              {isAnimating ? "Running..." : "Simulate Recursion"}
            </button>
            <button
              onClick={reset}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-bold"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4 text-center">
          Call Stack Visualization
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg min-h-96">
          <div className="space-y-2">
            {callStack.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Click "Simulate Recursion" to see the call stack in action
              </div>
            ) : (
              callStack.map((call, index) => (
                <div
                  key={call.id}
                  className={`p-4 border-2 rounded-lg transition-all duration-300 ${
                    call.state === "calling"
                      ? "border-blue-300 bg-blue-50"
                      : "border-green-300 bg-green-50"
                  }`}
                  style={{
                    marginLeft: `${call.depth * 40}px`,
                    maxWidth: `calc(100% - ${call.depth * 40}px)`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-sm">
                      <span className="font-bold">{call.function}</span>
                      <span className="text-gray-600">
                        ({call.args.join(", ")})
                      </span>
                    </div>
                    <div className="text-sm">
                      {call.state === "calling" ? (
                        <span className="text-blue-600">📞 Calling...</span>
                      ) : (
                        <span className="text-green-600">
                          ✅ Returns: {call.result}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Depth: {call.depth} | Step: {index + 1}
                  </div>
                </div>
              ))
            )}
          </div>

          {finalResult !== null && (
            <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-700 mb-2">
                🎉 Final Result
              </div>
              <div className="text-xl font-mono">
                {func.name}({inputValue}) = {finalResult}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border-2 border-green-300 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 text-center text-green-700">
            Stack Memory
          </h3>
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">📚</div>
            <div className="font-mono text-lg">LIFO Structure</div>
          </div>
          <p className="text-sm text-gray-600">
            Each function call creates a new "frame" on the stack. When a
            function returns, its frame is popped off. The stack grows downward
            as recursion deepens.
          </p>
        </div>

        <div className="border-2 border-blue-300 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 text-center text-blue-700">
            Base Case
          </h3>
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🎯</div>
            <div className="font-mono text-lg">n ≤ 1 → 1</div>
          </div>
          <p className="text-sm text-gray-600">
            The base case stops the recursion. Without it, the stack would grow
            forever until it causes a stack overflow error. Every recursive
            function needs a base case.
          </p>
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Recursion vs Stack Overflow</h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Stack Limit:</strong> Every computer has a maximum stack
            size. Too deep recursion = crash
          </p>
          <p>
            <strong>Tail Recursion:</strong> Some languages optimize
            tail-recursive functions to avoid stack growth
          </p>
          <p>
            <strong>Iterative Alternative:</strong> Every recursive function can
            be rewritten iteratively using a loop
          </p>
          <p>
            <strong>Memory Cost:</strong> Each call frame stores local
            variables, return address, and parameters
          </p>
          <p>
            <strong>Debugging Tip:</strong> Use a debugger to step through the
            call stack and see exactly what's happening
          </p>
          <p>
            <strong>Real-World:</strong> Web browsers limit recursion depth to
            prevent infinite loops from crashing the page
          </p>
        </div>
      </div>
    </div>
  );
}
