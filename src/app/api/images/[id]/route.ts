import { db } from "@/db";
import { geoImageTable } from "@/db/schema";
import { RefillingTokenBucket } from "@/lib/rate-limit";
import { globalGETRateLimit } from "@/lib/request";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import requestIp from "request-ip";
import { z } from "zod";

const ipBucket = new RefillingTokenBucket<string>(20, 1);

export async function GET(
  request: NextRequest,
  params: { params: { id: string } },
) {
  try {
    if (!globalGETRateLimit(request)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const clientIp = requestIp.getClientIp(request);
    if (clientIp !== null && !ipBucket.check(clientIp, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const params_validate = z.string().min(1);
    const validated_params = params_validate.safeParse(params?.params?.id);

    if (!validated_params.success) {
      return NextResponse.json({ success: false, error: "BAD_REQUEST" });
    }

    const images = await db
      .select()
      .from(geoImageTable)
      .where(eq(geoImageTable.kod, validated_params.data));

    if (!images) {
      return NextResponse.json({ success: false, error: "IMAGES_NOT_FOUND" });
    }

    return NextResponse.json({ success: true, images: images });
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}
