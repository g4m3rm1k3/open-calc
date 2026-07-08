import { run } from "../../engines/js/interpreter/interpreter.js";
import { heapUnwrap } from "./heapUnwrap";
import type { BackendFile, HttpRequest, HttpResponseResult } from "./types";

export interface RunOutcome {
  response: HttpResponseResult | null;
  logs: string[];
  error: { message: string; type?: string } | null;
}

// The interpreter's run() executes once and returns — there is no way to
// call back into an already-executed environment. So every simulated
// request re-runs the student's ENTIRE project from scratch, registering
// routes/handlers again each time. This is deliberate, not a shortcut:
// modifying the shared engine to support "pause and resume" would be a far
// bigger, riskier change than this project needs right now, and re-running
// fresh per request is honestly closer to how a real serverless/lambda
// cold start behaves than it first appears. Any state that needs to
// survive across requests (once lessons reach persistence) has to live in
// real host JS outside the interpreter, reached through an extraGlobals
// bridge function — the same mechanism `__sendResponse` below already uses.
export function runRequest(files: BackendFile[], request: HttpRequest): RunOutcome {
  const combinedSource = files.map((f) => f.code).join("\n\n");
  const requestLiteral = JSON.stringify(request);
  const fullSource = `${combinedSource}\n\n__sendResponse(handleRequest(${requestLiteral}));\n`;

  let capturedResponse: HttpResponseResult | null = null;

  const outcome = run(fullSource, {
    extraGlobals: {
      __sendResponse: (_thisVal: unknown, args: unknown[], interp: any) => {
        capturedResponse = heapUnwrap(args[0], interp.heap) as HttpResponseResult;
        return undefined;
      },
    },
  });

  return {
    response: capturedResponse,
    logs: outcome.output ?? [],
    error: outcome.error ?? null,
  };
}
