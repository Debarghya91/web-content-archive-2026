// supabase/functions/record-cohort-registration/index.ts
// Payments Training Hub Edge Function: register a signed-in
// learner for a free live cohort session, and report whether
// they are already registered. Registration is free and grants
// no course access: it only records the learner's login email
// so joining details can be emailed before the session.
//
// Deploy with the Supabase CLI from the project root:
//   supabase functions deploy record-cohort-registration --project-ref eofsotgclhwsdwvbbtib
// Secrets (set in the Supabase dashboard, never in this file):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// The service-role key bypasses Row Level Security, so it must
// only ever live in the server environment, never in the browser.
//
// Request: POST or GET with a Bearer JWT in the Authorization
// header. POST body: { "cohort_id": "<known cohort id>" }.
// GET query: ?cohort_id=<known cohort id>.
// Response: { "registered": true, "already_registered": false,
//             "cohort_id": "<cohort id>" }.
// The cohort id must be one of KNOWN_COHORTS below; anything
// else is rejected. Add a new id here when a new cohort opens.
// The email recorded is the login email from the verified JWT,
// never anything the request body supplies.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Cohort ids this function accepts. The first cohort is the
// free introductory session on Saturday 28 November 2026,
// 6:00 to 7:00 PM IST.
const KNOWN_COHORTS = ["intro-payments-ba-2026-11-28"];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST" && req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.log("record-cohort-registration outcome=config_missing");
    return jsonResponse({ error: "Server is not configured" }, 500);
  }

  // The caller must be signed in. The user comes ONLY from the
  // verified JWT; no identity input from the body is trusted.
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return jsonResponse({ error: "Missing Authorization header" }, 401);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Verify the caller's JWT and read their user record.
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return jsonResponse({ error: "Invalid or expired token" }, 401);
  }
  const user = userData.user;
  const email = user.email ?? "";
  if (!email) {
    console.log("record-cohort-registration outcome=account_email_missing");
    return jsonResponse({ error: "The signed-in account has no email address" }, 500);
  }

  // The cohort id comes from the query string (GET) or the JSON
  // body (POST), and must be a known cohort.
  let cohortId = "";
  if (req.method === "GET") {
    cohortId = new URL(req.url).searchParams.get("cohort_id") ?? "";
  } else {
    let body: { cohort_id?: unknown };
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Body must be JSON" }, 400);
    }
    cohortId = typeof body.cohort_id === "string" ? body.cohort_id.trim() : "";
  }
  if (!KNOWN_COHORTS.includes(cohortId)) {
    return jsonResponse({ error: "Unknown cohort_id" }, 400);
  }

  // GET only reports whether this learner is already registered.
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("cohort_registrations")
      .select("id")
      .eq("user_id", user.id)
      .eq("cohort_id", cohortId)
      .maybeSingle();
    if (error) {
      console.log("record-cohort-registration outcome=status_failed");
      return jsonResponse({ error: "Could not check the registration" }, 500);
    }
    return jsonResponse({ registered: !!data, cohort_id: cohortId });
  }

  // POST records the registration. The unique (user_id,
  // cohort_id) key makes a repeat registration a no-op: the
  // insert is ignored and the caller is told they are already
  // registered. No purchase, no entitlement, no course access.
  const { data, error } = await supabase
    .from("cohort_registrations")
    .upsert(
      { user_id: user.id, email: email, cohort_id: cohortId },
      { onConflict: "user_id,cohort_id", ignoreDuplicates: true },
    )
    .select("id");
  if (error) {
    console.log("record-cohort-registration outcome=insert_failed");
    return jsonResponse({ error: "Could not record the registration" }, 500);
  }
  const alreadyRegistered = !data || data.length === 0;
  console.log(
    "record-cohort-registration outcome=" + (alreadyRegistered ? "already_registered" : "registered"),
  );
  return jsonResponse({
    registered: true,
    already_registered: alreadyRegistered,
    cohort_id: cohortId,
  });
});
