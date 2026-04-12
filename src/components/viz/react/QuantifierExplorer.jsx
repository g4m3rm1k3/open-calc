import React, { useState } from "react";

const SAMPLE_UNIVERSE = ["🐱", "🐶", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];
const PREDICATES = [
  {
    name: "Has fur",
    check: (animal) =>
      ["🐱", "🐶", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"].includes(animal),
  },
  {
    name: "Is a pet",
    check: (animal) => ["🐱", "🐶", "🐭", "🐹", "🐰"].includes(animal),
  },
  { name: "Can fly", check: (animal) => [].includes(animal) },
  { name: "Is dangerous", check: (animal) => ["🦊", "🐻"].includes(animal) },
];

export default function QuantifierExplorer() {
  const [selectedPredicate, setSelectedPredicate] = useState(0);
  const [showCounterexample, setShowCounterexample] = useState(false);

  const predicate = PREDICATES[selectedPredicate];
  const satisfying = SAMPLE_UNIVERSE.filter(predicate.check);
  const notSatisfying = SAMPLE_UNIVERSE.filter(
    (animal) => !predicate.check(animal),
  );

  const universalTrue = satisfying.length === SAMPLE_UNIVERSE.length;
  const existentialTrue = satisfying.length > 0;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Universal vs. Existential: How One Counterexample Destroys Everything
      </h2>

      <div className="mb-6">
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold mb-2">Choose a Property to Test</h3>
          <div className="grid grid-cols-2 gap-2">
            {PREDICATES.map((pred, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedPredicate(index);
                  setShowCounterexample(false);
                }}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  selectedPredicate === index
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white hover:bg-gray-50 border-gray-300"
                }`}
              >
                {pred.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold mb-2">
            Current Property: "{predicate.name}"
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {SAMPLE_UNIVERSE.map((animal, index) => (
              <div
                key={index}
                className={`w-12 h-12 flex items-center justify-center border-2 rounded-lg text-2xl ${
                  predicate.check(animal)
                    ? "bg-green-200 border-green-400"
                    : "bg-red-200 border-red-400"
                }`}
              >
                {animal}
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-600">
            <p>
              <strong>Satisfy the property:</strong> {satisfying.join(" ")} (
              {satisfying.length} animals)
            </p>
            <p>
              <strong>Don't satisfy:</strong> {notSatisfying.join(" ")} (
              {notSatisfying.length} animals)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border-2 border-blue-300 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 text-center text-blue-700">
            ∀ (For All)
          </h3>
          <div className="text-center mb-4">
            <div className="text-xl font-mono mb-2">
              ∀x ∈ Universe, {predicate.name.toLowerCase()}(x)
            </div>
            <div className="text-sm text-gray-600">
              "Every single animal has this property"
            </div>
          </div>

          <div
            className={`p-3 rounded-lg mb-4 ${
              universalTrue
                ? "bg-green-100 border border-green-300"
                : "bg-red-100 border border-red-300"
            }`}
          >
            <div className="font-bold mb-1">
              Status:{" "}
              <span
                className={universalTrue ? "text-green-600" : "text-red-600"}
              >
                {universalTrue ? "TRUE" : "FALSE"}
              </span>
            </div>
            <div className="text-sm">
              {universalTrue
                ? "All animals satisfy this property. The universal claim holds."
                : `Not all animals satisfy this property. The claim fails because: ${notSatisfying.join(", ")}`}
            </div>
          </div>

          <div className="text-xs text-gray-600">
            <strong>Destruction:</strong> One counterexample destroys the entire
            universal claim. Finding a single animal that doesn't have fur
            proves "all animals have fur" is false.
          </div>
        </div>

        <div className="border-2 border-green-300 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 text-center text-green-700">
            ∃ (There Exists)
          </h3>
          <div className="text-center mb-4">
            <div className="text-xl font-mono mb-2">
              ∃x ∈ Universe, {predicate.name.toLowerCase()}(x)
            </div>
            <div className="text-sm text-gray-600">
              "At least one animal has this property"
            </div>
          </div>

          <div
            className={`p-3 rounded-lg mb-4 ${
              existentialTrue
                ? "bg-green-100 border border-green-300"
                : "bg-red-100 border border-red-300"
            }`}
          >
            <div className="font-bold mb-1">
              Status:{" "}
              <span
                className={existentialTrue ? "text-green-600" : "text-red-600"}
              >
                {existentialTrue ? "TRUE" : "FALSE"}
              </span>
            </div>
            <div className="text-sm">
              {existentialTrue
                ? `At least one animal satisfies this property: ${satisfying[0]}`
                : "No animals satisfy this property. The existential claim is false."}
            </div>
          </div>

          <div className="text-xs text-gray-600">
            <strong>Proof:</strong> Finding one example proves the existential
            claim. Finding a flying squirrel proves "some animals can fly" is
            true.
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg mb-6">
        <h3 className="font-bold mb-2">Quantifier Negation Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white p-3 rounded border">
            <div className="font-mono mb-1">¬∀x P(x) ≡ ∃x ¬P(x)</div>
            <div className="text-gray-600">
              "Not all have P" means "Some don't have P"
            </div>
          </div>
          <div className="bg-white p-3 rounded border">
            <div className="font-mono mb-1">¬∃x P(x) ≡ ∀x ¬P(x)</div>
            <div className="text-gray-600">
              "None have P" means "All don't have P"
            </div>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">The Power of Counterexamples</h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Universal Claims:</strong> Require 100% success rate. One
            failure destroys everything.
          </p>
          <p>
            <strong>Existential Claims:</strong> Require only 1 success. Finding
            one example proves it.
          </p>
          <p>
            <strong>Mathematical Reality:</strong> Most "obvious" universal
            claims about infinity are false. We need proof.
          </p>
          <p>
            <strong>Testing Strategy:</strong> For ∀ claims, look for
            counterexamples. For ∃ claims, look for examples.
          </p>
          <p>
            <strong>Interactive Tip:</strong> Try the "Can fly" property to see
            how existential claims work with empty sets!
          </p>
        </div>
      </div>
    </div>
  );
}
