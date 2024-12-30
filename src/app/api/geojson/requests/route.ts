import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { RefillingTokenBucket } from "@/lib/rate-limit";
import { globalGETRateLimit, globalPOSTRateLimit } from "@/lib/request";
import { getCurrentSession } from "@/lib/sessionTokens";
import requestIp from "request-ip";
import { db } from "@/db";
import { geoRequestTable } from "@/db/schema";

const ipBucket = new RefillingTokenBucket<string>(20, 1);

export async function GET(req: NextRequest) {
  try {
    if (!globalGETRateLimit(req)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const clientIp = await requestIp.getClientIp(req);
    if (clientIp !== null && !ipBucket.check(clientIp, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const validateUser = await getCurrentSession();
    if (!validateUser.session || !validateUser.user) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" });
    }

    const limit = parseInt(req.nextUrl.searchParams.get("limit") || ""),
      offset = parseInt(req.nextUrl.searchParams.get("offset") || "");

    const requests = await db
      .select()
      .from(geoRequestTable)
      .offset(offset ?? 0)
      .limit(limit ?? 10);

    return NextResponse.json({ success: true, data: requests });
  } catch (e) {
    console.log(e);
    return NextResponse.json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting validation

    if (!globalPOSTRateLimit(request)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const clientIp = await requestIp.getClientIp(request);
    if (clientIp !== null && !ipBucket.check(clientIp, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    // User session validation

    const validateUser = await getCurrentSession();
    if (!validateUser.session || !validateUser.user) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" });
    }

    // Schema of request JSON data

    const validationSchema = z.object({
      georequest: z.string(),
    });

    // It can fail if JSON is missing

    const jsonFile = await request.json();

    const validated = validationSchema.safeParse(jsonFile);
    if (!validated.success) {
      console.log("fail validation");
      return NextResponse.json({ success: false, error: "BAD_REQUEST" });
    }

    console.log(validateUser.user.id);
    const geoRequest = await db
      .insert(geoRequestTable)
      .values({
        geodata: validated.data.georequest,
        userId: validateUser.user.id,
      })
      .returning();

    return NextResponse.json({ success: true, geoRequest });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "BAD_REQUEST" });
  }
}
