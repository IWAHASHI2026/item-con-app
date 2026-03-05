import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, color } = body;

  if (!name || !color) {
    return NextResponse.json({ error: "name と color は必須です" }, { status: 400 });
  }

  const maxOrder = await prisma.prefix.aggregate({ _max: { sortOrder: true } });
  const nextOrder = (maxOrder._max.sortOrder ?? 0) + 1;

  const prefix = await prisma.prefix.create({
    data: { name, color, sortOrder: nextOrder },
  });

  return NextResponse.json(prefix);
}
