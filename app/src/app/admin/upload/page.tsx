"use client";

import { useState, useRef } from "react";
import Link from "next/link";

type UploadResult = {
  success: number;
  skipped: number;
  errors: string[];
};

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setResult(null);

    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    try {
      const res = await fetch("/api/admin/upload/images", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      setResult({ success: 0, skipped: 0, errors: ["アップロード中にエラーが発生しました"] });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-blue-600 text-sm mb-4 inline-block">
          ← 管理画面に戻る
        </Link>
        <h1 className="text-2xl font-bold mb-6">画像アップロード</h1>

        <div className="bg-white rounded-lg p-6 shadow">
          <p className="text-sm text-gray-600 mb-4">
            ファイル名の形式: <code className="bg-gray-100 px-1">{"{プレフィックス}{3桁数字}-{a-y}.{jpg|png}"}</code>
            <br />
            例: <code className="bg-gray-100 px-1">lk027-b.jpg</code>
          </p>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
          />

          {files.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-bold mb-2">{files.length}件のファイルを選択中:</p>
              <ul className="text-sm text-gray-600 max-h-40 overflow-y-auto">
                {files.map((f, i) => (
                  <li key={i}>{f.name} ({(f.size / 1024).toFixed(1)}KB)</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded font-bold disabled:opacity-50"
          >
            {uploading ? "アップロード中..." : "アップロード"}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg p-6 shadow mt-4">
            <h2 className="font-bold mb-2">結果</h2>
            <p className="text-green-600">成功: {result.success}件</p>
            <p className="text-yellow-600">スキップ: {result.skipped}件</p>
            {result.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-red-600 font-bold text-sm">エラー:</p>
                <ul className="text-sm text-red-600">
                  {result.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
