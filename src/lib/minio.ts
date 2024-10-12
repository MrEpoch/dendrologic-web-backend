'use server';
import * as Minio from 'minio'
import { finished } from 'stream/promises';

const minioClient = new Minio.Client({
  endPoint: process.env.S3_END_POINT ?? "",
  useSSL: true,
  accessKey: process.env.S3_ACCESS_KEY ?? "", // This is username
  secretKey: process.env.S3_SECRET_KEY ?? "", // This is user password
})

interface Bucket {
  title: string
  href: string
}

const mainBucket = "dendrologic-bucket";

export async function getFullDiaryBucket() {
  const fullBucket = await minioClient.listObjects(mainBucket, "", true);
  const stringPaths: Bucket[] = [];
  fullBucket.on('data', async (obj) => {
    if (obj.prefix) {
      const folder = await minioClient.listObjects(mainBucket, obj.prefix, true);
      folder.on('data', async (obj) => {
        const stringPath = obj.name;
        stringPaths.push({
          title: stringPath ?? "",
          href: "/" + obj.prefix + "/" + stringPath
        })
      })
    } else {
      const stringPath = obj.name;
      stringPaths.push({
        title: stringPath ?? "",
        href: "/" + stringPath,
      });
    }
  })

  await finished(fullBucket);

  return stringPaths.flat();
}

export async function writeIntoBucket(bucketName: string, fileName: string, file: Blob) {
  
}

export async function getFileFromBucket(bucketName: string, fileName: string) {
  const file = await minioClient.getObject(bucketName, fileName);
  const stringPaths: Bucket[] = [];

  file.on('data', async (obj) => {
    const stringPath = obj.name;
    stringPaths.push({
      title: stringPath ?? "",
      href: "/" + stringPath
    })
  })

  await finished(file);
  return stringPaths.flat();
}
