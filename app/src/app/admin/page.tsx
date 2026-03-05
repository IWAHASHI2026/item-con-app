"use client";

import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">管理画面</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/upload"
            className="bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-bold mb-2">画像アップロード</h2>
            <p className="text-gray-600 text-sm">
              商品デザイン画像を一括アップロードします
            </p>
          </Link>

          <Link
            href="/admin/excel"
            className="bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-bold mb-2">Excelアップロード</h2>
            <p className="text-gray-600 text-sm">
              Excelファイルからコメントを一括登録します
            </p>
          </Link>

          <Link
            href="/admin/products"
            className="bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-bold mb-2">商品管理</h2>
            <p className="text-gray-600 text-sm">
              商品情報の編集・削除を行います
            </p>
          </Link>

          <Link
            href="/admin/prefixes"
            className="bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-bold mb-2">プレフィックス管理</h2>
            <p className="text-gray-600 text-sm">
              検索ボタンのプレフィックスを管理します
            </p>
          </Link>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-blue-600 text-sm">
            ← トップ画面に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
