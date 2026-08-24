const baseUrl = (process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const attempts = Number(process.env.SMOKE_ATTEMPTS ?? 20);

async function waitUntilReady() {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`, { redirect: "manual" });
      if (response.ok) return;
    } catch {
      // The server may still be binding its port.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Web server did not become ready at ${baseUrl}.`);
}

async function expectResponse(path, expectedStatus, expectedLocation) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  if (response.status !== expectedStatus) {
    throw new Error(`${path}: expected HTTP ${expectedStatus}, received ${response.status}.`);
  }
  if (expectedLocation && response.headers.get("location") !== expectedLocation) {
    throw new Error(`${path}: expected redirect to ${expectedLocation}, received ${response.headers.get("location")}.`);
  }
  return response;
}

await waitUntilReady();
const health = await expectResponse("/api/health", 200);
const payload = await health.json();
if (payload.status !== "ok" || payload.service !== "phumspace-web") {
  throw new Error("Health endpoint returned an invalid payload.");
}

const welcome = await expectResponse("/welcome", 200);
const html = await welcome.text();
if (!html.includes("PhumSpace") || !html.includes("Đăng nhập")) {
  throw new Error("Welcome page did not contain the expected application shell.");
}

await expectResponse("/scan", 307, "/welcome");
await expectResponse("/me", 307, "/welcome");
process.stdout.write("Web smoke checks passed: health, public shell, and protected redirects.\n");
