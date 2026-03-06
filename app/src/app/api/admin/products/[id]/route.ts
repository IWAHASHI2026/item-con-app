import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";

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

  // Delete blob files
  const urls = product.designs.map((d) => d.imagePath);
  if (urls.length > 0) {
    await del(urls);
  }

  // Cascade delete handles designs
  await prisma.product.delete({ where: { id: productId } });

  return NextResponse.json({ success: true });
}
