import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

const MANAGEMENT_NUMBER_REGEX = /^([a-zA-Z]+)(\d{3})-([a-y])$/i;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "ファイルが選択されていません" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

  const results = { success: 0, skipped: 0, errors: [] as string[] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const managementNumber = String(row[0] || "").trim();
    const comment = String(row[1] || "").trim();

    if (!managementNumber) continue;

    const match = managementNumber.match(MANAGEMENT_NUMBER_REGEX);
    if (!match) {
      results.errors.push(`行${i + 1}: "${managementNumber}" の形式が不正です`);
      results.skipped++;
      continue;
    }

    const prefixName = match[1];
    const number = match[2];
    const designLetter = match[3].toLowerCase();
    const parentNumber = `${prefixName}${number}`;

    const product = await prisma.product.findUnique({
      where: { parentNumber },
    });

    if (!product) {
      results.errors.push(`行${i + 1}: 商品 "${parentNumber}" が見つかりません`);
      results.skipped++;
      continue;
    }

    const design = await prisma.design.findUnique({
      where: {
        productId_designLetter: {
          productId: product.id,
          designLetter,
        },
      },
    });

    if (!design) {
      results.errors.push(`行${i + 1}: デザイン "${managementNumber}" が見つかりません`);
      results.skipped++;
      continue;
    }

    await prisma.design.update({
      where: { id: design.id },
      data: { comment: comment || null },
    });

    results.success++;
  }

  return NextResponse.json(results);
}
