"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

type Design = {
  id: number;
  designLetter: string;
  imagePath: string;
  comment: string | null;
};

type ProductData = {
  parentNumber: string;
  designs: Design[];
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const parentNumber = params.parentNumber as string;
  const [product, setProduct] = useState<ProductData | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${parentNumber}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [parentNumber]);

  const handleDeleteComment = async (design: Design) => {
    if (!confirm("このコメントを削除しますか？")) return;
    const res = await fetch(`/api/admin/designs/${design.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: null }),
    });
    if (res.ok) {
      const updated = { ...design, comment: null };
      setSelectedDesign(updated);
      setProduct((prev) =>
        prev
          ? {
              ...prev,
              designs: prev.designs.map((d) =>
                d.id === design.id ? updated : d
              ),
            }
          : prev
      );
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500">読み込み中...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-lg mx-auto text-center py-20">
          <p className="text-gray-500 mb-4">商品が見つかりません</p>
          <button onClick={() => router.push("/")} className="text-blue-600">
            トップに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => router.back()}
          className="text-blue-600 mb-4 inline-block"
        >
          ← 戻る
        </button>
        <h1 className="text-xl font-bold mb-4">{product.parentNumber}</h1>

        {/* Design thumbnails grid */}
        <div className="grid grid-cols-3 gap-2">
          {product.designs.map((design) => (
            <button
              key={design.id}
              onClick={() => setSelectedDesign(design)}
              className="relative aspect-square bg-white rounded-lg overflow-hidden border-2 border-gray-200 active:border-blue-500"
            >
              <Image
                src={design.imagePath}
                alt={`${parentNumber}-${design.designLetter}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 33vw, 200px"
              />
              <span className="absolute top-1 left-1 flex items-center gap-0.5">
                <span className="bg-black/60 text-white text-xs w-5 h-5 flex items-center justify-center rounded">
                  {design.designLetter}
                </span>
                {design.comment && (
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Design detail modal */}
      {selectedDesign && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex flex-col"
          onClick={() => setSelectedDesign(null)}
        >
          <div className="flex justify-between items-center p-4">
            <span className="text-white text-lg font-bold">
              {parentNumber}-{selectedDesign.designLetter}
            </span>
            <button
              onClick={() => setSelectedDesign(null)}
              className="text-white text-2xl"
            >
              ×
            </button>
          </div>
          <div
            className="flex-1 flex items-center justify-center overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:gap-6 lg:px-8">
              <div className="w-[70vw] max-w-2xl mx-auto lg:mx-0 touch-pinch-zoom shrink-0">
                <Image
                  src={selectedDesign.imagePath}
                  alt={`${parentNumber}-${selectedDesign.designLetter}`}
                  width={800}
                  height={800}
                  className="w-full h-auto"
                  style={{ touchAction: "pinch-zoom" }}
                />
              </div>
              {selectedDesign.comment && (
                <div className="bg-white p-4 mx-4 mt-4 lg:mx-0 lg:mt-0 rounded-lg lg:max-w-xs">
                  <p>{selectedDesign.comment}</p>
                  <button
                    onClick={() => handleDeleteComment(selectedDesign)}
                    className="mt-2 text-red-500 text-sm underline"
                  >
                    コメント削除
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
