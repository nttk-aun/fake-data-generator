const PREFIX = "[fake-data-generator]";

export function logError(context: string, error: unknown): void {
  try {
    console.error(`${PREFIX} ${context}`, error);
  } catch (loggingErr) {
    console.error(`${PREFIX} logError_failed`, loggingErr);
  }
}
