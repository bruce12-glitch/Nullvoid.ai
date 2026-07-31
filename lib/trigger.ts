export function verifyTriggerEnv() {
  if (!process.env.TRIGGER_SECRET_KEY) {
    throw new Error("TRIGGER_SECRET_KEY is not set. Background jobs cannot be triggered.");
  }
}
