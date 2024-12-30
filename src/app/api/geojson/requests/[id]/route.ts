import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { RefillingTokenBucket } from "@/lib/rate-limit";
import { globalGETRateLimit, globalPOSTRateLimit } from "@/lib/request";
import { getCurrentSession } from "@/lib/sessionTokens";
import requestIp from "request-ip";
import { db } from "@/db";
import { geoRequestTable } from "@/db/schema";
import { eq } from "drizzle-orm";

const ipBucket = new RefillingTokenBucket<string>(20, 1);

export async function GET(req: NextRequest, { params }) {
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

    const zodIdValidate = z.string().min(1);
    const id = zodIdValidate.safeParse(params?.id);

    if (!id.success) {
      return NextResponse.json({ success: false, error: "BAD_REQUEST" });
    }

    const request = await db
      .select()
      .from(geoRequestTable)
      .where(eq(geoRequestTable.id, id.data));

    return NextResponse.json({ success: true, georequest: request });
  } catch (e) {
    console.log(e);
    return NextResponse.json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}
