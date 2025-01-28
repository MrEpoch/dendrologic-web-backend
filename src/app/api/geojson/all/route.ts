import { NextRequest, NextResponse } from "next/server";
import { RefillingTokenBucket } from "@/lib/rate-limit";
import { globalGETRateLimit, globalPOSTRateLimit } from "@/lib/request";
import { getCurrentSession } from "@/lib/sessionTokens";
import requestIp from "request-ip";
import { db } from "@/db";
import { feature } from "@/db/schema";
import { z } from "zod";

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

    return NextResponse.json({ success: true, data: geodata });
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
      geolocations: z
        .array(
          z.object({
            geometry: z.object({
              type: z.string().refine((value) => value === "Point"),
              coordinates: z
                .array(z.number())
                .length(2)
            }),
            properties: z.object({
              properties: z.object({
                NAZEV: z.string(),
                POCET: z.number().positive().max(100),
                FROM_APP: z.boolean().refine((value) => value === true),
              }),
              name: z.string().refine((value) => value === "Point"),
            }),
            type: z.string().refine((value) => value === "Feature"),
          }),
        )
    });

    // It can fail if JSON is missing

    const jsonFile = await request.json();

    const validated = validationSchema.safeParse(jsonFile);
    if (!validated.success) {
      console.log("fail validation");
      return NextResponse.json({ success: false, error: "BAD_REQUEST" });
    }

    await Promise.all(validated.data.geolocations.map(async (element) => {
      await db
        .insert(feature)
        .values({
          pocet: element.properties.properties.POCET,
          nazev: element.properties.properties.NAZEV,
          geometry_type: element.geometry.type,
          geometry_coordinates: { x: element.geometry.coordinates[0], y: element.geometry.coordinates[1] },
        })
    }))
    
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "BAD_REQUEST" });
  }
}
