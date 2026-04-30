import { isElasticEnabled } from "@/lib/instanceSettings";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { available: isElasticEnabled() },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}
