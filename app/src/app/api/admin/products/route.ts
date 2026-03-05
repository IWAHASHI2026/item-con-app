import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      designs: {
        orderBy: { designLetter: "asc" },
      },
      prefix: true,
    },
    orderBy: { parentNumber: "asc" },
  });

  return NextResponse.json(products);
}
