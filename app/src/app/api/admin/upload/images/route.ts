import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import path from "path";

const VALID_EXTENSIONS = [".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const FILE_NAME_REGEX = /^([a-zA-Z]+)(\d{3})-([a-y])\.(jpg|jpeg|png)$/i;

export async function POST(request: NextRequest) {
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

    // Upload to Vercel Blob
    const fileName = `${parentNumber}-${designLetter}${ext}`;
    const blob = await put(fileName, file, { access: "public" });

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
      // Delete old blob if different
      if (existing.imagePath !== blob.url) {
        await del(existing.imagePath);
      }
      await prisma.design.update({
        where: { id: existing.id },
        data: { imagePath: blob.url },
      });
    } else {
      await prisma.design.create({
        data: {
          productId: product.id,
          designLetter,
          imagePath: blob.url,
        },
      });
    }

    results.success++;
  }

  return NextResponse.json(results);
}
