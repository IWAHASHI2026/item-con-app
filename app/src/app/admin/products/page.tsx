"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

type Design = {
  id: number;
  designLetter: string;
  imagePath: string;
  comment: string | null;
};

type Product = {
  id: number;
  parentNumber: string;
  designs: Design[];
};

export default function ProductsManagePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingDesignId, setEditingDesignId] = useState<number | null>(null);
  const [editComment, setEditComment] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
    setLoading(true);
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id: number, parentNumber: string) => {
    if (!confirm(`${parentNumber} のすべてのデザインを削除しますか？`)) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const handleDeleteDesign = async (id: number, name: string) => {
    if (!confirm(`${name} を削除しますか？`)) return;
    await fetch(`/api/admin/designs/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const handleSaveComment = async (designId: number) => {
    await fetch(`/api/admin/designs/${designId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: editComment || null }),
    });
    setEditingDesignId(null);
    fetchProducts();
  };

  const filtered = filter
    ? products.filter((p) => p.parentNumber.includes(filter))
    : products;

  if (loading) {
    return <div className="min-h-screen bg-gray-100 p-8 text-center text-gray-500">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-blue-600 text-sm mb-4 inline-block">
          ← 管理画面に戻る
        </Link>
        <h1 className="text-2xl font-bold mb-6">商品管理</h1>

        <input
          type="text"
          placeholder="親番号で絞り込み..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full border rounded px-4 py-2 mb-4"
        />

        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="bg-white rounded-lg p-6 text-center text-gray-500">
              商品がありません
            </div>
          )}

          {filtered.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow">
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  onClick={() =>
                    setExpandedId(expandedId === product.id ? null : product.id)
                  }
                  className="font-bold text-lg flex-1 text-left"
                >
                  {product.parentNumber}
                  <span className="text-sm text-gray-400 ml-2">
                    ({product.designs.length}デザイン)
                  </span>
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id, product.parentNumber)}
                  className="text-red-500 text-sm px-3 py-1 hover:bg-red-50 rounded"
                >
                  一括削除
                </button>
              </div>

              {expandedId === product.id && (
                <div className="border-t px-4 py-3 space-y-3">
                  {product.designs.map((design) => (
                    <div
                      key={design.id}
                      className="flex items-start gap-3 border-b pb-3 last:border-b-0 last:pb-0"
                    >
                      <div className="w-16 h-16 relative flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={design.imagePath}
                          alt={design.designLetter}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">
                          {product.parentNumber}-{design.designLetter}
                        </p>
                        {editingDesignId === design.id ? (
                          <div className="flex gap-2 mt-1">
                            <input
                              type="text"
                              value={editComment}
                              onChange={(e) => setEditComment(e.target.value)}
                              className="border rounded px-2 py-1 text-sm flex-1"
                              placeholder="コメント"
                            />
                            <button
                              onClick={() => handleSaveComment(design.id)}
                              className="text-blue-600 text-sm"
                            >
                              保存
                            </button>
                            <button
                              onClick={() => setEditingDesignId(null)}
                              className="text-gray-400 text-sm"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <p
                            className="text-sm text-gray-600 cursor-pointer hover:text-blue-600 mt-1"
                            onClick={() => {
                              setEditingDesignId(design.id);
                              setEditComment(design.comment || "");
                            }}
                          >
                            {design.comment || "(コメントなし - クリックで編集)"}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteDesign(
                            design.id,
                            `${product.parentNumber}-${design.designLetter}`
                          )
                        }
                        className="text-red-500 text-sm flex-shrink-0"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
