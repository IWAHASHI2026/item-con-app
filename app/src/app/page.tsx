"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Prefix = {
  id: number;
  name: string;
  color: string;
  sortOrder: number;
};

export default function Home() {
  const [input, setInput] = useState("");
  const [prefixes, setPrefixes] = useState<Prefix[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/prefixes")
      .then((res) => res.json())
      .then((data) => setPrefixes(data));
  }, []);

  const handlePrefixClick = (name: string) => {
    setInput(name);
  };

  const handleNumberClick = (num: string) => {
    setInput((prev) => prev + num);
  };

  const handleClear = () => {
    setInput("");
  };

  const handleBackspace = () => {
    setInput((prev) => prev.slice(0, -1));
  };

  const handleSearch = () => {
    const q = input.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-xl font-bold mb-8">商品デザイン確認</h1>

      <div className="w-full max-w-sm">
        {/* Prefix buttons + Numpad */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {/* Prefix column */}
          <div className="flex flex-col gap-2">
            {prefixes.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePrefixClick(p.name)}
                style={{ backgroundColor: p.color }}
                className="text-white font-bold py-4 rounded-lg text-sm active:opacity-80"
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Numpad */}
          <div className="col-span-3 grid grid-cols-3 gap-2">
            {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                className="bg-gray-200 font-bold text-2xl py-4 rounded-lg active:bg-gray-300"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleBackspace}
              className="bg-gray-200 font-bold text-lg py-4 rounded-lg active:bg-gray-300"
            >
              ←
            </button>
            <button
              onClick={() => handleNumberClick("0")}
              className="bg-gray-200 font-bold text-2xl py-4 rounded-lg active:bg-gray-300"
            >
              0
            </button>
            <button
              onClick={handleClear}
              className="bg-red-400 text-white font-bold text-lg py-4 rounded-lg active:bg-red-500"
            >
              C
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="例: lk027"
            className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white font-bold px-6 py-3 rounded-lg active:bg-blue-700"
          >
            検索
          </button>
        </div>
      </div>

      {/* Admin link */}
      <a
        href="/admin"
        className="mt-12 text-sm text-gray-400 underline"
      >
        管理画面
      </a>
    </div>
  );
}
