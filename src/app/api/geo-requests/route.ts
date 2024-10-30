import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/index";
import { geoRequestTable } from "@/db/schema";
import { RefillingTokenBucket } from "@/lib/rate-limit";
import { globalGETRateLimit } from "@/lib/request";
import requestIp from "request-ip";

const ipBucket = new RefillingTokenBucket<string>(20, 1);

export async function GET(request: NextRequest) {
  try {
    if (!globalGETRateLimit(request)) {
      console.log("get");
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }
    const clientIp = requestIp.getClientIp(request);
    if (clientIp !== null && !ipBucket.check(clientIp, 1)) {
      console.log("ip");
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const searchParamsValidationZod = z.object({
      page: z.string().optional(),
    });

    const validatedSearchParams =
      searchParamsValidationZod.safeParse(request?.nextUrl?.searchParams);

    if (!validatedSearchParams.success) {
      return NextResponse.json({ success: false });
    }

    const page = validatedSearchParams.data.page || "1";
    const geoRequests = await db
      .select({ id: geoRequestTable.id, name: geoRequestTable.name })
      .from(geoRequestTable)
      .limit(10)
      .offset((parseInt(page) - 1) * 10);
    console.log(geoRequests);

    return NextResponse.json({ success: true, geoRequests });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false });
  }
}
