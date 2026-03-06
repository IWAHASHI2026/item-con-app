import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const designId = parseInt(id);
  const body = await request.json();

  const design = await prisma.design.findUnique({
    where: { id: designId },
  });

  if (!design) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.design.update({
    where: { id: designId },
    data: {
      comment: body.comment !== undefined ? body.comment : design.comment,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const designId = parseInt(id);

  const design = await prisma.design.findUnique({
    where: { id: designId },
  });

  if (!design) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete blob file
  await del(design.imagePath);

  await prisma.design.delete({ where: { id: designId } });

  // Check if product has no more designs
  const remaining = await prisma.design.count({
    where: { productId: design.productId },
  });
  if (remaining === 0) {
    await prisma.product.delete({ where: { id: design.productId } });
  }

  return NextResponse.json({ success: true });
}
