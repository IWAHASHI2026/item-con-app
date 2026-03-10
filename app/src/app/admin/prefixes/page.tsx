"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Prefix = {
  id: number;
  name: string;
  color: string;
  sortOrder: number;
};

export default function PrefixesPage() {
  const [prefixes, setPrefixes] = useState<Prefix[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const fetchPrefixes = async () => {
    try {
      const res = await fetch("/api/prefixes");
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setPrefixes(data);
    } catch {
      setError("プレフィックスの取得に失敗しました");
    }
  };

  useEffect(() => {
    fetchPrefixes();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/admin/prefixes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), color }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "追加に失敗しました");
        return;
      }
      setName("");
      fetchPrefixes();
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-blue-600 text-sm mb-4 inline-block">
          ← 管理画面に戻る
        </Link>
        <h1 className="text-2xl font-bold mb-6">プレフィックス管理</h1>

        <div className="bg-white rounded-lg p-6 shadow mb-6">
          <h2 className="font-bold mb-4">現在のプレフィックス</h2>
          <div className="flex flex-wrap gap-2">
            {prefixes.map((p) => (
              <span
                key={p.id}
                style={{ backgroundColor: p.color }}
                className="text-white px-4 py-2 rounded font-bold"
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="font-bold mb-4">プレフィックス追加</h2>
          <div className="flex gap-2 items-end">
            <div>
              <label className="text-sm text-gray-600 block mb-1">名前</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: lk"
                className="border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">色</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="border rounded h-10 w-16"
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={adding || !name.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded font-bold disabled:opacity-50"
            >
              {adding ? "追加中..." : "追加"}
            </button>
          </div>
          {error && (
            <p className="text-red-600 text-sm mt-3">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
