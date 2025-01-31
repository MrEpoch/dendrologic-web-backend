import { db } from "@/db";
import { feature } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function addDendrologicImage(id: string, image_url: string) {
  try {
    const check_if_exists = await db
      .select({
        images: feature.images,
      })
      .from(feature)
      .where(eq(feature.id, id));

    if (check_if_exists[0] && !(check_if_exists[0].images.length > 0)) {
      const dendrologic_image = await db
        .update(feature)
        .set({
          images: [image_url],
        })
        .where(eq(feature.id, id))
        .returning();

      if (!dendrologic_image || dendrologic_image.length < 1) {
        return { success: false, error: "ERROR_ADDING_GEO_IMAGE" };
      }
      return { success: true, dendrologic_image };
    } else if (check_if_exists[0] && check_if_exists[0].images.length > 0) {
      const dendrologic_image = await db
        .update(feature)
        .set({
          images: [...check_if_exists[0].images, image_url],
        })
        .where(eq(feature.id, id))
        .returning();

      if (!dendrologic_image || dendrologic_image.length < 1) {
        return { success: false, error: "ERROR_ADDING_GEO_IMAGE" };
      }
      return { success: true, dendrologic_image };
    } else {
      return { success: false, error: "ERROR_ADDING_GEO_IMAGE" };
    }
  } catch (e) {
    console.log(e);
    return { success: false, error: "ERROR_ADDING_GEO_IMAGE" };
  }
}

export async function deleteDendrologicImage(id: string, image_url: string) {
  try {
    const check_if_exists = await db
      .select()
      .from(feature)
      .where(eq(feature.id, id));

    if (!check_if_exists) {
      return { success: false, error: "ERROR_DELETING_GEO_IMAGE" };
    }

    const dendrologic_image = await db
      .update(feature)
      .set({
        images: check_if_exists[0].images.filter(
          (image) => image !== image_url,
        ),
      })
      .where(eq(feature.id, id))
      .returning();

    if (!dendrologic_image || dendrologic_image.length < 1) {
      return { success: false, error: "ERROR_DELETING_GEO_IMAGE" };
    }
    return { success: true, dendrologic_image };
  } catch (e) {
    return { success: false, error: "ERROR_DELETING_GEO_IMAGE" };
  }
}
