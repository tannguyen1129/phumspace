import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Lightweight probe for container/load-balancer checks. It does not expose secrets or dependency details. */
export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "phumspace-web",
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
