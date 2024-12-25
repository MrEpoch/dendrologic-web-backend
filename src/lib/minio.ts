"use server";
import * as Minio from "minio";
import { finished } from "stream/promises";
import { z } from "zod";

const minioClient = new Minio.Client({
  endPoint: process.env.S3_END_POINT ?? "",
  useSSL: true,
  accessKey: process.env.S3_ACCESS_KEY ?? "", // This is username
  secretKey: process.env.S3_SECRET_KEY ?? "", // This is user password
});

interface Bucket {
  title: string;
  href: string;
}

const mainBucket = "dendrologic-bucket";

export async function getFullDiaryBucket() {
  const fullBucket = minioClient.listObjects(mainBucket, "", true);
  const stringPaths: Bucket[] = [];
  fullBucket.on("data", async (obj) => {
    if (obj.prefix) {
      const folder = minioClient.listObjects(mainBucket, obj.prefix, true);
      folder.on("data", async (obj) => {
        const stringPath = obj.name;
        stringPaths.push({
          title: stringPath ?? "",
          href: "/" + obj.prefix + "/" + stringPath,
        });
      });
    } else {
      const stringPath = obj.name;
      stringPaths.push({
        title: stringPath ?? "",
        href: "/" + stringPath,
      });
    }
  });

  await finished(fullBucket);

  return stringPaths.flat();
}

export async function writeIntoBucket(
  bucketName: string,
  fileName: string,
  file: Buffer,
) {
  try {
    const zodSchemaValidation = z.object({
      bucketName: z.string(),
      fileName: z.string(),
      file: z.instanceof(Buffer),
    });

    const validatedFile = zodSchemaValidation.safeParse({
      bucketName,
      fileName,
      file,
    });
    if (!validatedFile.success) {
      return { success: false };
    }
    await minioClient.putObject(bucketName, fileName, file);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}

export async function getFileFromBucket(bucketName: string, fileName: string) {
  const file = await minioClient.getObject(bucketName, fileName);
  const stringPaths: Bucket[] = [];

  file.on("data", async (obj) => {
    const stringPath = obj.name;
    stringPaths.push({
      title: stringPath ?? "",
      href: "/" + stringPath,
    });
  });

  await finished(file);
  return stringPaths.flat();
}
