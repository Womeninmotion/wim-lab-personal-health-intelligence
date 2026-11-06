import { NextRequest, NextResponse } from "next/server";
import { getVerifiedOwner } from "@/lib/server-auth";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const responseHeaders = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" };
const bucket = "wim-private-medical";
const maxSize = 4 * 1024 * 1024;
const allowed = ["application/pdf", "image/jpeg", "image/png"];
const json = (data: object, status = 200) => NextResponse.json(data, { status, headers: responseHeaders });
function backend() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try { return { base: new URL(url), key }; } catch { return null; }
}
function headers(key: string) { return { apikey: key, Authorization: `Bearer ${key}` }; }
function tableUrl(base: URL, filter: string) { return new URL(`/rest/v1/medical_reports?${filter}`, base); }
export async function GET(req: NextRequest) {
  const owner = await getVerifiedOwner();
  if (!owner) return json({ error: "unauthorized" }, 401);
  const config = backend();
  if (!config) return json({ error: "unconfigured" }, 503);
  const id = req.nextUrl.searchParams.get("id");
  const filter = id
    ? `select=id,file_name,storage_path,content_type&user_id=eq.${encodeURIComponent(owner.id)}&id=eq.${encodeURIComponent(id)}&limit=1`
    : `select=id,file_name,file_size,report_date,notes,uploaded_at&user_id=eq.${encodeURIComponent(owner.id)}&order=uploaded_at.desc&limit=100`;
  try {
    const res = await fetch(tableUrl(config.base, filter), { headers: headers(config.key), cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!res.ok) return json({ error: "database_read_failed" }, 502);
    const rows = await res.json() as Record<string, unknown>[];
    if (!id) return json({ reports: rows });
    if (!rows.length) return json({ error: "not_found" }, 404);
    const record = rows[0];
    const objectPath = String(record.storage_path);
    if (!objectPath.startsWith(owner.id + "/")) return json({ error: "not_found" }, 404);
    const storageUrl = new URL(`/storage/v1/object/authenticated/${bucket}/${objectPath.split("/").map(encodeURIComponent).join("/")}`, config.base);
    const storage = await fetch(storageUrl, { headers: headers(config.key), cache: "no-store", signal: AbortSignal.timeout(12000) });
    if (!storage.ok) return json({ error: "file_read_failed" }, 502);
    const body = await storage.arrayBuffer();
    return new NextResponse(body, { status: 200, headers: { ...responseHeaders, "Content-Type": String(record.content_type), "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(String(record.file_name))}` } });
  } catch { return json({ error: "unreachable" }, 502); }
}
export async function POST(req: NextRequest) {
  const owner = await getVerifiedOwner();
  if (!owner) return json({ error: "unauthorized" }, 401);
  const config = backend();
  if (!config) return json({ error: "unconfigured" }, 503);
  const length = Number(req.headers.get("content-length") || "0");
  if (length > maxSize + 4096) return json({ error: "file_too_large" }, 413);
  let form: FormData;
  try { form = await req.formData(); } catch { return json({ error: "bad_form" }, 400); }
  const file = form.get("file");
  if (!(file instanceof File)) return json({ error: "missing_file" }, 400);
  if (file.size < 1 || file.size > maxSize) return json({ error: "file_too_large" }, 413);
  if (!allowed.includes(file.type)) return json({ error: "invalid_type" }, 400);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = bytes.length > 5 && String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes.length > 8 && [137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
  if (!(file.type === "application/pdf" && pdf || file.type === "image/jpeg" && jpeg || file.type === "image/png" && png)) return json({ error: "invalid_file" }, 400);
  const fileName = file.name.replace(/[\r\n]/g, " ").slice(0, 180);
  const reportDate = String(form.get("reportDate") || "").trim();
  if (reportDate && !/^\d{4}-\d{2}-\d{2}$/.test(reportDate)) return json({ error: "invalid_date" }, 400);
  const notes = String(form.get("notes") || "").slice(0, 500);
  const extension = file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : "jpg";
  const path = `${owner.id}/${randomUUID()}.${extension}`;
  const url = new URL(`/storage/v1/object/${bucket}/${path}`, config.base);
  try {
    const stored = await fetch(url, { method: "POST", headers: { ...headers(config.key), "Content-Type": file.type, "x-upsert": "false" }, body: bytes, cache: "no-store", signal: AbortSignal.timeout(20000) });
    if (!stored.ok) return json({ error: "storage_write_failed" }, 502);
    const meta = { user_id: owner.id, file_name: fileName, storage_path: path, file_size: file.size, content_type: file.type, report_date: reportDate || null, notes };
    const inserted = await fetch(new URL("/rest/v1/medical_reports", config.base), { method: "POST", headers: { ...headers(config.key), "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(meta), cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!inserted.ok) {
      await fetch(url, { method: "DELETE", headers: headers(config.key), signal: AbortSignal.timeout(6000) }).catch(() => undefined);
      return json({ error: "metadata_write_failed" }, 502);
    }
    return json({ ok: true });
  } catch { return json({ error: "upload_unreachable" }, 502); }
}
