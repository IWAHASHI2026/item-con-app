import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json([]);
  }

  const products = await prisma.product.findMany({
    where: {
      parentNumber: {
        startsWith: q,
      },
    },
    select: {
      parentNumber: true,
    },
    orderBy: {
      parentNumber: "asc",
    },
  });

  return NextResponse.json(products);
}
