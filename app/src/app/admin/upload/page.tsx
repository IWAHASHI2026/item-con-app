"use client";

import { useState, useRef } from "react";
import Link from "next/link";

type UploadResult = {
  success: number;
  skipped: number;
  errors: string[];
};

const BATCH_SIZE = 3;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
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

    const batches = chunkArray(files, BATCH_SIZE);
    const aggregated: UploadResult = { success: 0, skipped: 0, errors: [] };

    for (let i = 0; i < batches.length; i++) {
      setProgress({ current: i + 1, total: batches.length });

      const formData = new FormData();
      for (const file of batches[i]) {
        formData.append("files", file);
      }

      try {
        const res = await fetch("/api/admin/upload/images", {
          method: "POST",
          body: formData,
        });
        const data: UploadResult = await res.json();
        aggregated.success += data.success;
        aggregated.skipped += data.skipped;
        aggregated.errors.push(...data.errors);
      } catch {
        aggregated.errors.push(`バッチ ${i + 1} のアップロード中にエラーが発生しました`);
      }
    }

    setResult(aggregated);
    setProgress(null);
    setFiles([]);
    if (inputRef.current) inputRef.current.value = "";
    setUploading(false);
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

        {progress && (
          <div className="bg-white rounded-lg p-6 shadow mt-4">
            <p className="text-sm font-bold mb-2">
              バッチ {progress.current} / {progress.total} をアップロード中...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

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
