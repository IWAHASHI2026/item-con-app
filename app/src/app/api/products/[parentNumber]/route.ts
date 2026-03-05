import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ parentNumber: string }> }
) {
  const { parentNumber } = await params;

  const product = await prisma.product.findUnique({
    where: { parentNumber },
    include: {
      designs: {
        orderBy: { designLetter: "asc" },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    parentNumber: product.parentNumber,
    designs: product.designs.map((d) => ({
      id: d.id,
      designLetter: d.designLetter,
      imagePath: d.imagePath,
      comment: d.comment,
    })),
  });
}
