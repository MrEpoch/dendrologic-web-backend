import { db } from "@/db";
import { geoRequestTable, userTable } from "@/db/schema";
import { RefillingTokenBucket } from "@/lib/rate-limit";
import { globalPOSTRateLimit } from "@/lib/request";
import { getCurrentSession } from "@/lib/sessionTokens";
import { InsertImageIntoBucket } from "@/lib/storeFile";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import requestIp from "request-ip";

// const fileSchema = z.string().base64();

const ipBucket = new RefillingTokenBucket<string>(20, 1);

export async function POST(request: NextRequest, params: { params: { id: string } }) {
  try {
    if (!globalPOSTRateLimit(request)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }

    const clientIp = requestIp.getClientIp(request);
    if (clientIp !== null && !ipBucket.check(clientIp, 1)) {
      return NextResponse.json({ success: false, error: "TOO_MANY_REQUESTS" });
    }


    const validateUser = await getCurrentSession();
    if (!validateUser.session || !validateUser.user) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" });
    }

    const id = z.string().length(36).safeParse(params?.params?.id);

    if (!id.success) {
      return NextResponse.json({
        success: false,
        error: "UNKNOWN_GEO_REQUEST",
      });
    }

    const validationSchema = z.object({
      image: z.string(),
      featureId: z.string().length(36),
    });

    const jsonFile = await request.json();

    const validated = validationSchema.safeParse(jsonFile);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: "BAD_REQUEST" });
    }

    const geoRequest = await db
      .select({ id: geoRequestTable.id, geojson: geoRequestTable.geojson })
      .from(geoRequestTable)
      .where(eq(geoRequestTable.id, id.data))

    if (geoRequest.length === 0) {
      return NextResponse.json({
        success: false,
        error: "UNKNOWN_GEO_REQUEST",
      });
    }

    const file = await InsertImageIntoBucket(validated.data.image, geoRequest[0].id);

    if (!file.success) {
      return NextResponse.json({ success: false, error: "FILE_UPLOAD_ERROR" });
    }

    const newGeoJson = geoRequest[0]?.geojson;
    if (!newGeoJson || !newGeoJson?.features) {
      return NextResponse.json({ success: false, error: "FILE_UPLOAD_ERROR" });
    }

    const dbRequestGeoAdd = await db
      .update(geoRequestTable)
      .set({
        geojson: JSON.stringify(newGeoJson.features.map((feature: any) => {
          if (feature.properties.id === validated.data.featureId) {
            return {
              ...feature,
              properties: {
                ...feature.properties,
                image: [...feature.properties.image, file.fileName],
                imageTakenLast: Date.now().toString()
              }
            }
          }
          return feature
        })),
      })
      .where(eq(geoRequestTable.id, id.data))
      .returning()

    if (!dbRequestGeoAdd) {
      return NextResponse.json({ success: false, error: "FILE_UPLOAD_ERROR" });
    }

    if (!file.fileName) {
      return NextResponse.json({ success: false, error: "FILE_UPLOAD_ERROR" });
    }

    const userImageAdd = await db.execute(sql`
      UPDATE ${userTable}
      SET images = array_append(images, ${file.fileName})
      WHERE id = ${validateUser.user.id}
      RETURNING *
    `);

    if (!userImageAdd) {
      return NextResponse.json({ success: false, error: "FILE_UPLOAD_ERROR" });
    }

    return NextResponse.json({ success: true, geoRequest: dbRequestGeoAdd });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "BAD_REQUEST" });
  }
}
