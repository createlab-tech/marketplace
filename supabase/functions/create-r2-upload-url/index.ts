import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024;
const allowedExtensions = new Set([".fbx", ".obj", ".blend", ".stl", ".3mf", ".glb", ".gltf", ".zip", ".3ds", ".dwg", ".3dm", ".step", ".stp"]);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse(401, { error: "Missing authorization header" });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return jsonResponse(401, { error: "Unauthorized" });

    const accountId = requiredEnv("R2_ACCOUNT_ID");
    const bucket = requiredEnv("R2_BUCKET_NAME");
    const accessKeyId = requiredEnv("R2_ACCESS_KEY_ID");
    const secretAccessKey = requiredEnv("R2_SECRET_ACCESS_KEY");
    const body = await req.json();
    if (body.action === "complete") {
      return await completeUpload(accountId, bucket, accessKeyId, secretAccessKey, user.id, body.key);
    }

    const fileName = typeof body.fileName === "string" ? body.fileName : "";
    const fileSize = Number(body.fileSize);
    const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();

    if (!fileName || !allowedExtensions.has(extension)) {
      return jsonResponse(400, { error: "Unsupported 3D file type" });
    }
    if (!Number.isSafeInteger(fileSize) || fileSize <= 0 || fileSize > MAX_FILE_SIZE) {
      return jsonResponse(400, { error: "Model files must be larger than 0 bytes and no larger than 5 GiB" });
    }

    const contentType = contentTypeForExtension(extension);
    const safeFileName = fileName
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .slice(-160);
    const key = `models/${user.id}/${crypto.randomUUID()}-${safeFileName}`;
    const uploadUrl = await createPresignedUrl({
      accountId,
      accessKeyId,
      secretAccessKey,
      bucket,
      key,
      method: "PUT",
      expiresIn: 900,
    });

    return jsonResponse(200, { key, uploadUrl, contentType, expiresIn: 900 });
  } catch (error) {
    return jsonResponse(500, { error: error instanceof Error ? error.message : "Unable to prepare upload" });
  }
});

async function completeUpload(accountId: string, bucket: string, accessKeyId: string, secretAccessKey: string, userId: string, key: unknown) {
  if (typeof key !== "string" || !key.startsWith(`models/${userId}/`)) {
    return jsonResponse(400, { error: "Invalid upload key" });
  }

  try {
    const response = await fetch(await createPresignedUrl({
      accountId,
      accessKeyId,
      secretAccessKey,
      bucket,
      key,
      method: "HEAD",
      expiresIn: 300,
    }), { method: "HEAD" });
    if (!response.ok) throw new Error("R2 verification failed");
    return jsonResponse(200, {
      key,
      fileSize: Number(response.headers.get("content-length")) || null,
      contentType: response.headers.get("content-type") ?? null,
    });
  } catch {
    return jsonResponse(400, { error: "The uploaded model file could not be verified" });
  }
}

async function createPresignedUrl({
  accountId,
  accessKeyId,
  secretAccessKey,
  bucket,
  key,
  method,
  contentType,
  expiresIn,
}: {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  key: string;
  method: "PUT" | "HEAD";
  contentType?: string;
  expiresIn: number;
}) {
  const region = "auto";
  const service = "s3";
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = amzDate.slice(0, 8);
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${awsEncode(bucket)}/${key.split("/").map(awsEncode).join("/")}`;
  const credential = `${accessKeyId}/${date}/${region}/${service}/aws4_request`;
  const signedHeaders = "host";
  const query = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": credential,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresIn),
    "X-Amz-SignedHeaders": signedHeaders,
  });
  const canonicalQuery = [...query.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, value]) => `${awsEncode(name)}=${awsEncode(value)}`)
    .join("&");
  const canonicalHeaders = `host:${host}\n`;
  const canonicalRequest = [method, canonicalUri, canonicalQuery, canonicalHeaders, signedHeaders, "UNSIGNED-PAYLOAD"].join("\n");
  const scope = `${date}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, await sha256(canonicalRequest)].join("\n");
  const signingKey = await hmac(await hmac(await hmac(await hmac(`AWS4${secretAccessKey}`, date), region), service), "aws4_request");
  const signature = await hmacHex(signingKey, stringToSign);
  query.set("X-Amz-Signature", signature);
  return `https://${host}${canonicalUri}?${[...query.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, value]) => `${awsEncode(name)}=${awsEncode(value)}`)
    .join("&")}`;
}

function awsEncode(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hmac(key: string | ArrayBuffer, value: string) {
  const cryptoKey = await crypto.subtle.importKey("raw", typeof key === "string" ? new TextEncoder().encode(key) : key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(value));
}

async function hmacHex(key: ArrayBuffer, value: string) {
  const signature = await hmac(key, value);
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function contentTypeForExtension(extension: string) {
  const contentTypes: Record<string, string> = {
    ".zip": "application/zip",
    ".3mf": "application/3mf",
    ".gltf": "model/gltf+json",
    ".glb": "model/gltf-binary",
    ".obj": "text/plain",
    ".stl": "model/stl",
    ".step": "application/step",
    ".stp": "application/step",
  };
  return contentTypes[extension] ?? "application/octet-stream";
}

function requiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
