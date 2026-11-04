/**
 * WIM Lab #001 — Apple Health inbound bridge (single-user pilot).
 * Receives JSON exports from Health Auto Export on iOS.
 * Requires a strong, server-only bearer token. Stores unmodified JSON securely
 * in a Supabase private table for later normalization and source inspection.
 * Never expose the Supabase service role key or ingestion token to browser code.
 */
import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_BYTES = 2 * 1024 * 1024;

function safeMatch(actual: string, expected: string): boolean {
  const a = Buffer.from(actual, "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

function response(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const ingestToken = process.env.HEALTH_INGEST_TOKEN;
  const ownerId = process.env.HEALTH_OWNER_USER_ID;

  // Fail closed if not completely configured. Do not allow weak tokens.
  if (!supabaseUrl || !supabaseKey || !ingestToken || ingestToken.length < 32 || !ownerId) {
    return response({ ok: false, error: "ingest_not_configured" }, 503);
  }
  const authorization = request.headers.get("authorization") ?? "";
  if (!safeMatch(authorization, `Bearer ${ingestToken}`)) {
    return response({ ok: false, error: "unauthorized" }, 401);
  }
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return response({ ok: false, error: "json_required" }, 415);
  }
  const length = request.headers.get("content-length");
  if (length && Number(length) > MAX_BYTES) {
    return response({ ok: false, error: "payload_too_large" }, 413);
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return response({ ok: false, error: "could_not_read_body" }, 400);
  }
  if (Buffer.byteLength(raw, "utf8") > MAX_BYTES) {
    return response({ ok: false, error: "payload_too_large" }, 413);
  }
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return response({ ok: false, error: "invalid_json" }, 400);
  }
  if (payload === null || typeof payload !== "object") {
    return response({ ok: false, error: "json_object_or_array_required" }, 422);
  }

  const sha256 = createHash("sha256").update(raw).digest("hex");
  const record = {
    user_id: ownerId,
    source: "health_auto_export",
    payload_sha256: sha256,
    source_session_id: request.headers.get("session-id")?.slice(0, 200) ?? null,
    automation_name: request.headers.get("automation-name")?.slice(0, 200) ?? null,
    automation_id: request.headers.get("automation-id")?.slice(0, 200) ?? null,
    automation_period: request.headers.get("automation-period")?.slice(0, 100) ?? null,
    automation_aggregation: request.headers.get("automation-aggregation")?.slice(0, 100) ?? null,
    payload,
  };
  let endpoint: URL;
  try {
    endpoint = new URL("/rest/v1/health_ingest_events", supabaseUrl);
  } catch {
    return response({ ok: false, error: "invalid_backend_config" }, 503);
  }
  endpoint.searchParams.set("on_conflict", "user_id,payload_sha256");
  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=ignore-duplicates,return=minimal",
      },
      body: JSON.stringify(record),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!upstream.ok) {
      // Do not log raw sensitive payload or upstream error bodies.
      return response({ ok: false, error: "secure_storage_failed", status: upstream.status }, 502);
    }
  } catch {
    return response({ ok: false, error: "secure_storage_unreachable" }, 502);
  }
  return response({ ok: true, received: true, sha256: sha256.slice(0, 12) }, 200);
}
