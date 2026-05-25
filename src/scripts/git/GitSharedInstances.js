import { GitEngine } from "./GitEngine.js";

// Module-level maps shared across GitWorkspace, GitTerminal, GitKrakenView, etc.
// Any component with the same instanceId gets the same GitEngine.
export const sharedInstances = new Map(); // instanceId -> GitEngine
export const sharedInits = new Set(); // instanceId -> has been initialized

/**
 * Get or create a GitEngine for a given instanceId.
 * Pass null for a standalone (unshared) instance.
 */
export function getOrCreateEngine(instanceId) {
  if (instanceId && sharedInstances.has(instanceId)) {
    return sharedInstances.get(instanceId);
  }
  const engine = new GitEngine();
  if (instanceId) sharedInstances.set(instanceId, engine);
  return engine;
}
