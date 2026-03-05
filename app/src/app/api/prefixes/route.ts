import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const prefixes = await prisma.prefix.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(prefixes);
}
