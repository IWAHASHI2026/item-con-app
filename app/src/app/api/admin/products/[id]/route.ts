import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { designs: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete image files
  const uploadsDir = path.join(process.cwd(), "uploads");
  for (const design of product.designs) {
    const filePath = path.join(uploadsDir, design.imagePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  // Cascade delete handles designs
  await prisma.product.delete({ where: { id: productId } });

  return NextResponse.json({ success: true });
}
