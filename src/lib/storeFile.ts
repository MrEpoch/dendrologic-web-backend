import sharp from "sharp";
import { writeIntoBucket } from "./minio";

export async function InsertImageIntoBucket(file) {
  const replacedFile = file.replace(/^data:image\/\w+;base64,/, "");
  const validatedFile = { data: replacedFile, success: true };
  /*      fileSchema.safeParse(
      replacedFile
    );*/

  if (!validatedFile.success) {
    return { success: false };
  }

  const fileName = crypto.randomUUID();
  const imageBuffer = await convertToJPG(
    Buffer.from(validatedFile.data, "base64"),
  );
  const storageResponse = await writeIntoBucket(
    "dendrologic-bucket",
    fileName + ".jpg",
    imageBuffer,
  );
  if (!storageResponse.success) {
    return { success: false };
  }

  return {
    success: true,
    fileName: fileName + ".jpg",
  };
}

async function convertToJPG(imageBuffer: Buffer) {
  try {
    // Convert the image to JPG format using sharp
    const jpgBuffer = await sharp(imageBuffer)
      .jpeg({ quality: 90 }) // Adjust quality if needed
      .toBuffer();
    return jpgBuffer;
  } catch (err) {
    console.error("Error converting image to JPG:", err);
    throw err;
  }
}
