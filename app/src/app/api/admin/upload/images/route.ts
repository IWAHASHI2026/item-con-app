import { prisma } from "@/lib/prisma";
import { putFile, deleteFile } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

const VALID_EXTENSIONS = [".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const FILE_NAME_REGEX = /^([a-zA-Z]+)(\d{3})-([a-y])\.(jpg|jpeg|png)$/i;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "ファイルが選択されていません" }, { status: 400 });
    }

    const results = { success: 0, skipped: 0, errors: [] as string[] };

    for (const file of files) {
      const match = file.name.match(FILE_NAME_REGEX);
      if (!match) {
        results.errors.push(`${file.name}: ファイル名の形式が不正です`);
        results.skipped++;
        continue;
      }

      const ext = path.extname(file.name).toLowerCase();
      if (!VALID_EXTENSIONS.includes(ext)) {
        results.errors.push(`${file.name}: 非対応の拡張子です`);
        results.skipped++;
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        results.errors.push(`${file.name}: 5MBを超えています`);
        results.skipped++;
        continue;
      }

      const prefixName = match[1];
      const number = match[2];
      const designLetter = match[3].toLowerCase();
      const parentNumber = `${prefixName}${number}`;

      try {
        // Check if prefix exists
        const prefix = await prisma.prefix.findUnique({
          where: { name: prefixName },
        });
        if (!prefix) {
          results.errors.push(`${file.name}: プレフィックス "${prefixName}" が登録されていません`);
          results.skipped++;
          continue;
        }

        // Ensure product exists
        const product = await prisma.product.upsert({
          where: { parentNumber },
          create: { parentNumber, prefixId: prefix.id },
          update: {},
        });

        // Save file to storage
        const fileName = `${parentNumber}-${designLetter}${ext}`;
        const saved = await putFile(fileName, file);

        // Upsert design
        const existing = await prisma.design.findUnique({
          where: {
            productId_designLetter: {
              productId: product.id,
              designLetter,
            },
          },
        });

        if (existing) {
          // Delete old file if different
          if (existing.imagePath !== saved.url) {
            await deleteFile(existing.imagePath);
          }
          await prisma.design.update({
            where: { id: existing.id },
            data: { imagePath: saved.url },
          });
        } else {
          await prisma.design.create({
            data: {
              productId: product.id,
              designLetter,
              imagePath: saved.url,
            },
          });
        }

        results.success++;
      } catch (fileError) {
        const msg = fileError instanceof Error ? fileError.message : "不明なエラー";
        console.error(`${file.name} の処理エラー:`, fileError);
        results.errors.push(`${file.name}: ${msg}`);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("画像アップロードエラー:", error);
    return NextResponse.json(
      { success: 0, skipped: 0, errors: ["サーバーエラーが発生しました"] },
      { status: 500 }
    );
  }
}
