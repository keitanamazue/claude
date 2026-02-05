"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push("/");
      } else {
        setCheckingAuth(false);
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("確認メールを送信しました（ローカル環境では不要です）");
        // ローカル環境では自動的にログイン
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!signInError) {
          router.push("/");
          router.refresh();
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    }

    setLoading(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-700 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
          {isSignUp ? "アカウント作成" : "ログイン"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
              placeholder="6文字以上"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? "処理中..." : isSignUp ? "アカウント作成" : "ログイン"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setMessage(null);
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {isSignUp
              ? "既にアカウントをお持ちの方はこちら"
              : "アカウントをお持ちでない方はこちら"}
          </button>
        </div>
      </div>
    </div>
  );
}
