import { db } from "@/db";
import { geoImageTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function addDendrologicImage(kod: string, image_url: string) {
  try {
    const check_if_exists = await db
      .select()
      .from(geoImageTable)
      .where(eq(geoImageTable.kod, kod));

    if (!check_if_exists[0]) {
      const dendrologic_image = await db
        .insert(geoImageTable)
        .values({
          kod,
          images: [image_url],
        })
        .returning();

      if (!dendrologic_image || dendrologic_image.length < 1) {
        return { success: false, error: "ERROR_ADDING_GEO_IMAGE" };
      }
      return { success: true, dendrologic_image };
    } else {
      const dendrologic_image = await db
        .update(geoImageTable)
        .set({
          images: [...check_if_exists[0].images, image_url],
        })
        .where(eq(geoImageTable.kod, kod))
        .returning();

      if (!dendrologic_image || dendrologic_image.length < 1) {
        return { success: false, error: "ERROR_ADDING_GEO_IMAGE" };
      }
      return { success: true, dendrologic_image };
    }
  } catch (e) {
        console.log(e);
    return { success: false, error: "ERROR_ADDING_GEO_IMAGE" };
  }
}

export async function deleteDendrologicImage(kod: string, image_url: string) {
  try {
    const check_if_exists = await db
      .select()
      .from(geoImageTable)
      .where(eq(geoImageTable.kod, kod));

    if (!check_if_exists) {
      return { success: false, error: "ERROR_DELETING_GEO_IMAGE" };
    }

    const dendrologic_image = await db
      .update(geoImageTable)
      .set({
        images: check_if_exists[0].images.filter(
          (image) => image !== image_url,
        ),
      })
      .where(eq(geoImageTable.kod, kod))
      .returning();

    if (!dendrologic_image || dendrologic_image.length < 1) {
      return { success: false, error: "ERROR_DELETING_GEO_IMAGE" };
    }
    return { success: true, dendrologic_image };
  } catch (e) {
    return { success: false, error: "ERROR_DELETING_GEO_IMAGE" };
  }
}
