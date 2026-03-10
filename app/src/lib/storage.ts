import { put, del } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";

const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function putFile(
  fileName: string,
  file: File
): Promise<{ url: string }> {
  if (useBlob) {
    const blob = await put(fileName, file, { access: "public", allowOverwrite: true });
    return { url: blob.url };
  }
  await ensureUploadDir();
  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(UPLOAD_DIR, fileName);
  await fs.writeFile(filePath, buffer);
  return { url: `/uploads/${fileName}` };
}

export async function deleteFile(fileUrl: string): Promise<void> {
  if (useBlob) {
    try {
      await del(fileUrl);
    } catch {
      // Blob may not exist, ignore
    }
    return;
  }
  const fileName = fileUrl.replace(/^\/uploads\//, "");
  const filePath = path.join(UPLOAD_DIR, fileName);
  try {
    await fs.unlink(filePath);
  } catch {
    // File may not exist, ignore
  }
}

export async function deleteFiles(fileUrls: string[]): Promise<void> {
  await Promise.all(fileUrls.map(deleteFile));
}
