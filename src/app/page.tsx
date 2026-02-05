"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient, Todo } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      fetchTodos();
    };
    getUser();
  }, [router]);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching todos:", error);
    } else {
      setTodos(data || []);
    }
    setLoading(false);
  };

  const addTodo = async () => {
    if (inputValue.trim() === "" || !user) return;

    const { data, error } = await supabase
      .from("todos")
      .insert([{ text: inputValue.trim(), completed: false, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error("Error adding todo:", error);
    } else if (data) {
      setTodos([...todos, data]);
      setInputValue("");
    }
  };

  const toggleTodo = async (id: number, completed: boolean) => {
    const { error } = await supabase
      .from("todos")
      .update({ completed: !completed })
      .eq("id", id);

    if (error) {
      console.error("Error updating todo:", error);
    } else {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !completed } : todo
        )
      );
    }
  };

  const deleteTodo = async (id: number) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) {
      console.error("Error deleting todo:", error);
    } else {
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            Todo App
          </h1>
          {user && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              ログアウト
            </button>
          )}
        </div>

        {user && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {user.email}
          </div>
        )}

        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="新しいタスクを入力..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
            />
            <button
              onClick={addTodo}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              追加
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              読み込み中...
            </div>
          ) : todos.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              タスクがありません
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-600">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id, todo.completed)}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <span
                    className={`flex-1 ${
                      todo.completed
                        ? "line-through text-gray-400"
                        : "text-gray-800 dark:text-white"
                    }`}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="px-3 py-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {todos.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            {todos.filter((t) => !t.completed).length} 件の未完了タスク
          </div>
        )}
      </div>
    </div>
  );
}
