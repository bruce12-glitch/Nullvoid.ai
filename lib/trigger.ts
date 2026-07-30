export function verifyTriggerEnv() {
  if (!process.env.TRIGGER_SECRET_KEY) {
    console.warn("TRIGGER_SECRET_KEY is missing. Background jobs will fail to trigger.");
  }
  if (!process.env.NEXT_PUBLIC_TRIGGER_PUBLIC_KEY) {
    console.warn("NEXT_PUBLIC_TRIGGER_PUBLIC_KEY is missing. Client-side features may fail.");
  }
}
