/** Next.js throws this while probing static render; must rethrow so the route stays dynamic. */
export function isNextDynamicServerError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const e = error as { digest?: string; description?: string; message?: string };
  if (e.digest === "DYNAMIC_SERVER_USAGE") {
    return true;
  }
  const text = `${e.description ?? ""} ${e.message ?? ""}`;
  return text.includes("Dynamic server usage");
}
