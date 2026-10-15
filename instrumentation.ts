// Runs once when the server starts.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  // Logs "[mailer] contact: ok/failed" and "[mailer] quote: ok/failed" (never credentials).
  // Not awaited: a slow mail server mustn't delay the site starting.
  const { verifyMailers } = await import("@/lib/mailer");
  void verifyMailers();
}
