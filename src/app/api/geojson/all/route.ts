import { NextRequest, NextResponse } from "next/server";
import { RefillingTokenBucket } from "@/lib/rate-limit";
import { globalGETRateLimit } from "@/lib/request";
import { getCurrentSession } from "@/lib/sessionTokens";
import requestIp from "request-ip";
import { db } from "@/db";
import { feature } from "@/db/schema";

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

    const geodata = await db
      .select({
        id: feature.id,
        nazev: feature.nazev,
        pocet: feature.pocet,
        images: feature.images,
        geometry_type: feature.geometry_type,
        geometry_coordinates: feature.geometry_coordinates,
      })
      .from(feature);
    console.log(geodata);

    return NextResponse.json({ success: true, data: geodata });
  } catch (e) {
    console.log(e);
    return NextResponse.json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}
