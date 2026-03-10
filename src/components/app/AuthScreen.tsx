import React, { useState } from "react";
import Icon from "@/components/ui/icon";
import { User } from "@/types";
import { apiFetch, formatPhone, AUTH_URL } from "@/lib/api";

export function AuthScreen({ onAuth }: { onAuth: (u: User) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [form, setForm] = useState({ display_name: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setPhone(val.startsWith("8") ? "7" + val.slice(1) : val);
  };
  const displayPhone = () => formatPhone(phone);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const { ok, data } = await apiFetch(AUTH_URL, {
      method: "POST",
      body: JSON.stringify({ action: mode, username: phone, ...form }),
    });
    setLoading(false);
    if (ok) { localStorage.setItem("wc_token", data.token); onAuth(data.user); }
    else setError(data.error || "Ошибка авторизации");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/25">
            <Icon name="Lock" size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">WorChat</h1>
          <p className="text-sm text-muted-foreground mt-1">{mode === "login" ? "Войдите в аккаунт" : "Создайте аккаунт"}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-border p-5">
          <div className="flex mb-5 bg-muted rounded-xl p-0.5">
            {(["login", "register"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all
                  ${mode === m ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"}`}>
                {m === "login" ? "Вход" : "Регистрация"}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Номер телефона</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+</span>
                <input value={displayPhone()} onChange={handlePhone} type="tel" placeholder="7 (999) 000-00-00"
                  className="w-full pl-6 pr-3 py-2.5 text-sm rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            {mode === "register" && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Имя</label>
                <input value={form.display_name} onChange={e => set("display_name", e.target.value)} placeholder="Иван Иванов"
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Пароль</label>
              <input value={form.password} onChange={e => set("password", e.target.value)} type="password" placeholder="••••••••"
                className="w-full px-3 py-2.5 text-sm rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            {error && <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading || !phone || !form.password}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {mode === "login" ? "Войти" : "Зарегистрироваться"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
