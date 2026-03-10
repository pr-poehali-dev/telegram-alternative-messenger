import React, { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  User, AppSettings,
  Accent, Theme, Wallpaper, DeviceInfo,
  LANGUAGES, REGIONS,
} from "@/types";
import { formatPhone, detectBrowser, detectOS } from "@/lib/api";
import { Avatar } from "@/components/app/ChatComponents";

export function SettingsScreen({ user, settings, onSettings, onLogout, onAvatarUpload, avatarUploading, avatarInputRef }: {
  user: User; settings: AppSettings;
  onSettings: (s: AppSettings) => void;
  onLogout: () => void;
  onAvatarUpload: (f: File) => void;
  avatarUploading: boolean;
  avatarInputRef: React.RefObject<HTMLInputElement>;
}) {
  const [tab, setTab] = useState<"profile" | "appearance" | "notifications" | "devices" | "language">("profile");
  const set = (p: Partial<AppSettings>) => onSettings({ ...settings, ...p });

  const accentColors = [
    { value: "blue" as Accent, color: "#1d6cc8", label: "Синий" },
    { value: "green" as Accent, color: "#22b865", label: "Зелёный" },
    { value: "purple" as Accent, color: "#8b5cf6", label: "Фиолетовый" },
    { value: "red" as Accent, color: "#ef4444", label: "Красный" },
    { value: "orange" as Accent, color: "#f97316", label: "Оранжевый" },
    { value: "pink" as Accent, color: "#ec4899", label: "Розовый" },
  ];
  const wallpapers = [
    { value: "plain" as Wallpaper, label: "Чистый", cls: "bg-muted" },
    { value: "dots" as Wallpaper, label: "Точки", cls: "chat-bg-dots" },
    { value: "grid" as Wallpaper, label: "Сетка", cls: "chat-bg-grid" },
    { value: "bubbles" as Wallpaper, label: "Пузыри", cls: "chat-bg-bubbles" },
  ];
  const tabs = [
    { id: "profile", icon: "User", label: "Профиль" },
    { id: "appearance", icon: "Palette", label: "Оформление" },
    { id: "notifications", icon: "Bell", label: "Уведомления" },
    { id: "devices", icon: "Monitor", label: "Устройства" },
    { id: "language", icon: "Globe", label: "Язык" },
  ] as const;
  const devices: DeviceInfo[] = [
    { name: `${detectOS()} · ${detectBrowser()}`, os: detectOS(), browser: detectBrowser(), current: true },
    { name: "iPhone 15 · Safari", os: "iOS", browser: "Safari", current: false },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex overflow-x-auto gap-1 px-3 py-2 border-b border-border shrink-0 scrollbar-none">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all
              ${tab === t.id ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}>
            <Icon name={t.icon} size={13} />{t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {tab === "profile" && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="relative">
                <Avatar user={user} size={72} dot={false} />
                <button onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
                  {avatarUploading
                    ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Icon name="Camera" size={12} />}
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) onAvatarUpload(f); }} />
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground">{user.display_name}</div>
                <div className="text-sm text-muted-foreground">{formatPhone(user.username)}</div>
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border divide-y divide-border">
              {[
                { icon: "User", label: "Имя", value: user.display_name },
                { icon: "Phone", label: "Телефон", value: formatPhone(user.username) },
                { icon: "Shield", label: "Шифрование", value: "AES-512 E2E" },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Icon name={row.icon} size={15} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground">{row.label}</div>
                    <div className="text-sm font-medium truncate">{row.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-destructive/10 hover:bg-destructive/15 text-destructive text-sm font-medium">
              <Icon name="LogOut" size={16} />Выйти из аккаунта
            </button>
          </div>
        )}

        {tab === "appearance" && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Тема</p>
              <div className="grid grid-cols-3 gap-2">
                {([{ value: "light", icon: "Sun", label: "Светлая" }, { value: "dark", icon: "Moon", label: "Тёмная" }, { value: "system", icon: "Monitor", label: "Системная" }] as { value: Theme; icon: string; label: string }[]).map(t => (
                  <button key={t.value} onClick={() => set({ theme: t.value })}
                    className={`flex flex-col items-center gap-2 py-3 rounded-2xl border-2 transition-all
                      ${settings.theme === t.value ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/50"}`}>
                    <Icon name={t.icon} size={20} className={settings.theme === t.value ? "text-primary" : "text-muted-foreground"} />
                    <span className={`text-xs font-medium ${settings.theme === t.value ? "text-primary" : "text-muted-foreground"}`}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Цвет акцента</p>
              <div className="grid grid-cols-6 gap-2">
                {accentColors.map(ac => (
                  <button key={ac.value} onClick={() => set({ accent: ac.value })} title={ac.label}
                    className={`aspect-square rounded-2xl flex items-center justify-center border-2 transition-all
                      ${settings.accent === ac.value ? "border-foreground scale-105" : "border-transparent"}`}
                    style={{ background: ac.color }}>
                    {settings.accent === ac.value && <Icon name="Check" size={16} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Фон чата</p>
              <div className="grid grid-cols-2 gap-2">
                {wallpapers.map(w => (
                  <button key={w.value} onClick={() => set({ wallpaper: w.value })}
                    className={`relative h-16 rounded-2xl border-2 overflow-hidden transition-all
                      ${settings.wallpaper === w.value ? "border-primary" : "border-border"}`}>
                    <div className={`absolute inset-0 ${w.cls}`} />
                    <div className="absolute inset-0 flex items-end p-2">
                      <span className="text-xs font-medium bg-white/80 rounded-lg px-2 py-0.5">{w.label}</span>
                    </div>
                    {settings.wallpaper === w.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Icon name="Check" size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Размер текста</p>
              <div className="grid grid-cols-3 gap-2">
                {([{ v: "sm", label: "Мелкий" }, { v: "md", label: "Средний" }, { v: "lg", label: "Крупный" }] as { v: "sm" | "md" | "lg"; label: string }[]).map(fs => (
                  <button key={fs.v} onClick={() => set({ fontSize: fs.v })}
                    className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all
                      ${settings.fontSize === fs.v ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
                    {fs.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "notifications" && (
          <div className="space-y-3 animate-fade-in">
            {[
              { k: "notifications", icon: "Bell", label: "Уведомления", sub: "Показывать уведомления о сообщениях" },
              { k: "notifSound", icon: "Volume2", label: "Звук", sub: "Воспроизводить звук при сообщении" },
              { k: "notifPreview", icon: "Eye", label: "Предпросмотр", sub: "Показывать текст в уведомлении" },
            ].map(item => (
              <div key={item.k} className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Icon name={item.icon} size={17} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
                <button onClick={() => set({ [item.k]: !settings[item.k as keyof AppSettings] } as Partial<AppSettings>)}
                  className={`w-11 h-6 rounded-full transition-all relative shrink-0
                    ${settings[item.k as keyof AppSettings] ? "bg-primary" : "bg-muted"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all
                    ${settings[item.k as keyof AppSettings] ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "devices" && (
          <div className="space-y-2 animate-fade-in">
            {devices.map((d, i) => (
              <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Icon name={d.os === "Android" || d.os === "iOS" ? "Smartphone" : "Monitor"} size={17} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.current ? "Текущий сеанс" : "Последний вход: 2 дня назад"}</p>
                </div>
                {d.current && <span className="text-xs text-green-500 font-medium shrink-0">Активен</span>}
              </div>
            ))}
          </div>
        )}

        {tab === "language" && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Язык</p>
              <div className="space-y-1.5">
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => set({ language: l.code })}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left
                      ${settings.language === l.code ? "bg-primary/10 border border-primary/30" : "bg-card border border-border hover:bg-muted/50"}`}>
                    <span className="text-xl">{l.flag}</span>
                    <span className={`flex-1 text-sm font-medium ${settings.language === l.code ? "text-primary" : ""}`}>{l.label}</span>
                    {settings.language === l.code && <Icon name="Check" size={15} className="text-primary" />}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Регион</p>
              <div className="space-y-1.5">
                {REGIONS.map(r => (
                  <button key={r.code} onClick={() => set({ region: r.code })}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left
                      ${settings.region === r.code ? "bg-primary/10 border border-primary/30" : "bg-card border border-border hover:bg-muted/50"}`}>
                    <span className="text-xl">{r.flag}</span>
                    <span className={`flex-1 text-sm font-medium ${settings.region === r.code ? "text-primary" : ""}`}>{r.label}</span>
                    {settings.region === r.code && <Icon name="Check" size={15} className="text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
