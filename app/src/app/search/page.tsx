"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

type SearchResult = {
  parentNumber: string;
};

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!q) return;
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length === 1) {
          router.replace(`/products/${data[0].parentNumber}`);
        } else {
          setResults(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("検索中にエラーが発生しました");
        setLoading(false);
      });
  }, [q, router]);

  if (loading) {
    return <div className="text-center py-20 text-gray-500">検索中...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => router.push("/")}
          className="text-blue-600 mb-4 inline-block"
        >
          ← トップに戻る
        </button>
        <h1 className="text-lg font-bold mb-4">
          検索結果: &quot;{q}&quot;
        </h1>

        {results.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500">
            該当する商品が見つかりません
          </div>
        ) : (
          <div className="bg-white rounded-lg divide-y">
            {results.map((r) => (
              <button
                key={r.parentNumber}
                onClick={() => router.push(`/products/${r.parentNumber}`)}
                className="w-full text-left px-4 py-4 text-lg font-medium hover:bg-gray-50 active:bg-gray-100"
              >
                {r.parentNumber}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500">検索中...</div>}>
      <SearchContent />
    </Suspense>
  );
}
