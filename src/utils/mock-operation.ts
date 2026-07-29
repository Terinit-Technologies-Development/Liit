/**
 * Reusable helper for artificial latency and scenario-based controlled failures.
 */

export interface MockOptions {
  latencyMs?: number;
  shouldFail?: boolean;
  failureMessage?: string;
  isEmpty?: boolean;
}

export async function simulateMockOperation<T>(
  getData: () => T,
  options: MockOptions = {},
): Promise<T> {
  const {
    latencyMs = 300,
    shouldFail = false,
    failureMessage = "Simulated operation failure for testing",
    isEmpty = false,
  } = options;

  if (latencyMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, latencyMs));
  }

  if (shouldFail) {
    throw new Error(failureMessage);
  }

  if (isEmpty && Array.isArray(getData())) {
    return [] as unknown as T;
  }

  return getData();
}
