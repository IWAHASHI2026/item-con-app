import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const prefixes = await prisma.prefix.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(prefixes);
  } catch (error) {
    console.error("プレフィックス取得エラー:", error);
    return NextResponse.json({ error: "プレフィックスの取得に失敗しました" }, { status: 500 });
  }
}
