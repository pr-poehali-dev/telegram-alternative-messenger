import React, { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { User, Message, CallSession, AppSettings, Accent, Theme, Wallpaper, DeviceInfo, Channel, LANGUAGES, REGIONS, useT } from "./IndexTypes";
import { apiFetch, formatBytes, formatPhone, detectBrowser, detectOS, AUTH_URL, CALLS_URL, UPLOAD_URL } from "@/lib/api";

// ─── Onboarding ───────────────────────────────────────────────────────────────
export function OnboardingScreen({ onDone }: { onDone: (lang: string, region: string) => void }) {
  const [step, setStep] = useState<"welcome" | "language" | "terms">("welcome");
  const [lang, setLang] = useState("ru");
  const [region, setRegion] = useState("RU");
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        {step === "welcome" && (
          <div className="text-center">
            <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/30">
              <Icon name="Lock" size={44} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">WorChat</h1>
            <p className="text-muted-foreground text-sm mb-8">Защищённый мессенджер нового поколения</p>
            <div className="flex justify-center gap-6 mb-8">
              {[{ icon: "Shield", label: "E2E" }, { icon: "Zap", label: "Быстрый" }, { icon: "Globe", label: "Везде" }].map(f => (
                <div key={f.label} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Icon name={f.icon} size={22} className="text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">{f.label}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setStep("language")}
              className="w-full py-3.5 rounded-2xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              Начать
            </button>
          </div>
        )}
        {step === "language" && (
          <div>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Icon name="Globe" size={28} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold">Язык и регион</h2>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-border p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Язык</label>
                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => setLang(l.code)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all text-left
                        ${lang === l.code ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"}`}>
                      <span>{l.flag}</span><span className="truncate">{l.label}</span>
                      {lang === l.code && <Icon name="Check" size={13} className="ml-auto shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Регион</label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {REGIONS.map(r => (
                    <button key={r.code} onClick={() => setRegion(r.code)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all text-left
                        ${region === r.code ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"}`}>
                      <span>{r.flag}</span><span className="truncate">{r.label}</span>
                      {region === r.code && <Icon name="Check" size={13} className="ml-auto shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => setStep("terms")}
              className="w-full mt-4 py-3.5 rounded-2xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all">
              Продолжить
            </button>
          </div>
        )}
        {step === "terms" && (
          <div>
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Icon name="FileText" size={28} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold">Пользовательское соглашение</h2>
            </div>
            <div className="bg-white rounded-2xl border border-border p-4 text-xs text-muted-foreground max-h-64 overflow-y-auto space-y-2 mb-4">
              <p className="font-semibold text-foreground">WorChat — Условия использования</p>
              <p>Настоящее Соглашение регулирует использование мессенджера WorChat в соответствии с законодательством РФ (ФЗ №149 «Об информации», ФЗ №152 «О персональных данных»).</p>
              <p>Все сообщения защищены сквозным шифрованием AES-512. Мы не имеем доступа к содержанию ваших переписок.</p>
              <p>Персональные данные обрабатываются строго в целях функционирования сервиса и не передаются третьим лицам без вашего согласия.</p>
              <p>Использование сервиса запрещено лицам младше 13 лет. Запрещено распространение незаконного контента.</p>
            </div>
            <label className="flex items-center gap-3 mb-4 cursor-pointer">
              <div onClick={() => setAgreed(!agreed)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0
                  ${agreed ? "bg-primary border-primary" : "border-border"}`}>
                {agreed && <Icon name="Check" size={12} className="text-white" />}
              </div>
              <span className="text-sm text-muted-foreground">Я принимаю условия использования</span>
            </label>
            <button onClick={() => agreed && onDone(lang, region)} disabled={!agreed}
              className="w-full py-3.5 rounded-2xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all disabled:opacity-40">
              Войти в WorChat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
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
            {mode === "register" && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Имя</label>
                <input value={form.display_name} onChange={e => set("display_name", e.target.value)}
                  placeholder="Ваше имя" required
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Телефон</label>
              <input value={displayPhone()} onChange={handlePhone}
                placeholder="+7 (999) 123-45-67" required inputMode="tel"
                className="w-full px-3 py-2.5 text-sm rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Пароль</label>
              <input type="password" value={form.password} onChange={e => set("password", e.target.value)}
                placeholder="••••••••" required minLength={6}
                className="w-full px-3 py-2.5 text-sm rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-destructive/10 text-destructive text-xs">
                <Icon name="AlertCircle" size={14} />{error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {mode === "login" ? "Войти" : "Зарегистрироваться"}
            </button>
          </form>
          <div className="flex items-center justify-center gap-1.5 mt-4">
            <Icon name="Lock" size={11} className="text-green-500" />
            <span className="text-xs text-muted-foreground">Сквозное шифрование · WorChat</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ user, size = 44, dot = true }: { user: User; size?: number; dot?: boolean }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {user.avatar_url ? (
        <img src={user.avatar_url} alt={user.display_name}
          className="rounded-full object-cover w-full h-full" />
      ) : (
        <div className="rounded-full flex items-center justify-center text-white font-semibold w-full h-full"
          style={{ background: user.avatar_color, fontSize: size * 0.35 }}>
          {user.avatar_initials || user.display_name?.slice(0, 2).toUpperCase()}
        </div>
      )}
      {dot && user.status === "online" && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
      )}
    </div>
  );
}

// ─── Subscription badges ───────────────────────────────────────────────────────
export function Badge({ plan, size = "sm" }: { plan: "standard" | "premium"; size?: "sm" | "lg" }) {
  const isPremium = plan === "premium";
  const gradient = isPremium
    ? "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)"
    : "linear-gradient(135deg, #0ea5e9, #06b6d4)";
  const label = isPremium ? "⭐ PREMIUM" : "✦ STANDARD";
  if (size === "lg") {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold"
        style={{ background: gradient }}>{label}</div>
    );
  }
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-white text-[10px] font-bold"
      style={{ background: gradient }}>{label}</span>
  );
}

// ─── Reply Preview ────────────────────────────────────────────────────────────
export function ReplyPreview({ msg }: { msg: Message }) {
  return (
    <div className="border-l-2 border-white/60 pl-2 mb-1.5 opacity-90">
      <p className="text-[11px] truncate max-w-[200px]">{msg.text || "[медиа]"}</p>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
export function MessageBubble({ msg, allMessages }: { msg: Message; allMessages: Message[] }) {
  const reply = msg.reply_to_id ? allMessages.find(m => m.id === msg.reply_to_id) : null;
  const renderContent = () => {
    if (msg.msg_type === "image" && msg.media_url) return (
      <div>{reply && <ReplyPreview msg={reply} />}
        <img src={msg.media_url} alt="фото" className="max-w-xs rounded-xl cursor-pointer"
          onClick={() => window.open(msg.media_url, "_blank")} />
        {msg.text && <p className="text-sm mt-1">{msg.text}</p>}
      </div>
    );
    if (msg.msg_type === "video" && msg.media_url) return (
      <div>{reply && <ReplyPreview msg={reply} />}
        <video src={msg.media_url} controls className="max-w-xs rounded-xl" />
        {msg.text && <p className="text-sm mt-1">{msg.text}</p>}
      </div>
    );
    if (msg.msg_type === "audio" && msg.media_url) return (
      <div className="flex items-center gap-2 min-w-[200px]">
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <Icon name="Music" size={18} className="text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium truncate max-w-[140px]">{msg.media_name || "Аудио"}</p>
          <audio src={msg.media_url} controls className="w-full h-7 mt-0.5" />
        </div>
      </div>
    );
    if (msg.msg_type === "document" && msg.media_url) return (
      <a href={msg.media_url} target="_blank" rel="noreferrer"
        className="flex items-center gap-2 hover:opacity-80">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon name="FileText" size={20} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate max-w-[160px]">{msg.media_name || "Документ"}</p>
          <p className="text-xs opacity-70">{msg.media_size ? formatBytes(msg.media_size) : "Файл"}</p>
        </div>
        <Icon name="Download" size={15} className="ml-auto opacity-60 shrink-0" />
      </a>
    );
    if (msg.msg_type === "geo" && msg.geo_lat !== undefined) return (
      <a href={`https://maps.google.com/?q=${msg.geo_lat},${msg.geo_lon}`} target="_blank" rel="noreferrer"
        className="flex items-center gap-2 hover:opacity-80">
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
          <Icon name="MapPin" size={20} className="text-green-600" />
        </div>
        <div>
          <p className="text-sm font-medium">Геопозиция</p>
          <p className="text-xs opacity-70">{msg.geo_lat?.toFixed(4)}, {msg.geo_lon?.toFixed(4)}</p>
        </div>
      </a>
    );
    if (msg.msg_type === "contact") return (
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <Icon name="User" size={20} className="text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium">{msg.contact_name}</p>
          <p className="text-xs opacity-70">{msg.contact_phone}</p>
        </div>
      </div>
    );
    return (
      <div>{reply && <ReplyPreview msg={reply} />}
        <span className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</span>
      </div>
    );
  };
  return (
    <div>
      {renderContent()}
      <div className={`flex items-center justify-end gap-1 mt-0.5 ${msg.out ? "text-white/70" : "text-muted-foreground"}`}>
        <span className="text-[10px]">{msg.time}</span>
        {msg.out && <Icon name={msg.status === "read" ? "CheckCheck" : "Check"} size={12} />}
      </div>
    </div>
  );
}

// ─── Incoming Call Modal ──────────────────────────────────────────────────────
export function IncomingCallModal({ call, onAnswer, onReject }: {
  call: CallSession;
  onAnswer: (type: "audio" | "video") => void;
  onReject: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-3xl shadow-2xl p-6 w-72 text-center animate-pop">
        <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
          {call.call_type === "video" ? "Входящий видеозвонок" : "Входящий звонок"}
        </p>
        <Avatar user={call.caller} size={72} dot={false} />
        <p className="font-bold text-lg mt-3 mb-1">{call.caller.display_name}</p>
        <p className="text-sm text-muted-foreground mb-6">Вас вызывают...</p>
        <div className="flex justify-center gap-6">
          <button onClick={onReject}
            className="w-14 h-14 rounded-full bg-destructive flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-all">
            <Icon name="PhoneOff" size={24} className="text-white" />
          </button>
          <button onClick={() => onAnswer(call.call_type)}
            className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-lg hover:bg-green-600 transition-all">
            <Icon name={call.call_type === "video" ? "Video" : "Phone"} size={24} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Active Call Screen ───────────────────────────────────────────────────────
export function CallScreen({ partner, callType, roomId, isCallee, onEnd }: {
  partner: User;
  callType: "audio" | "video";
  roomId: string;
  isCallee: boolean;
  onEnd: () => void;
}) {
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState(isCallee ? "Подключение..." : "Вызов...");
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [speakerOff, setSpeakerOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSigId = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const sendSignal = useCallback(async (type: string, data: unknown) => {
    await apiFetch(CALLS_URL, {
      method: "POST",
      body: JSON.stringify({ action: "signal", room_id: roomId, signal_type: type, signal_data: data }),
    });
  }, [roomId]);

  useEffect(() => {
    let mounted = true;
    const start = async () => {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });
      pcRef.current = pc;

      // Get local media
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === "video",
        });
        localStreamRef.current = stream;
        stream.getTracks().forEach(t => pc.addTrack(t, stream));
        if (localVideoRef.current && callType === "video") {
          localVideoRef.current.srcObject = stream;
        }
      } catch {
        setStatus("Нет доступа к микрофону");
      }

      pc.ontrack = e => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = e.streams[0];
          if (mounted) { setStatus("В сети"); }
        }
      };

      pc.onicecandidate = e => {
        if (e.candidate) sendSignal("ice", e.candidate.toJSON());
      };

      pc.onconnectionstatechange = () => {
        if (!mounted) return;
        if (pc.connectionState === "connected") {
          setStatus("В сети");
          timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
        }
        if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
          setStatus("Соединение прервано");
        }
      };

      if (!isCallee) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await sendSignal("offer", { sdp: offer.sdp, type: offer.type });
      }

      // Poll signals
      pollRef.current = setInterval(async () => {
        if (!mounted) return;
        const { ok, data } = await apiFetch(`${CALLS_URL}?action=signals&room=${roomId}&since_id=${lastSigId.current}`);
        if (!ok) return;
        const { signals, status: cs } = data;
        if (cs === "ended") { onEnd(); return; }
        if (cs === "active" && status === "Вызов...") setStatus("Подключение...");
        for (const sig of (signals || [])) {
          lastSigId.current = Math.max(lastSigId.current, sig.id);
          if (sig.type === "offer" && isCallee) {
            await pc.setRemoteDescription(new RTCSessionDescription(sig.data));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await sendSignal("answer", { sdp: answer.sdp, type: answer.type });
          }
          if (sig.type === "answer" && !isCallee) {
            if (pc.signalingState === "have-local-offer") {
              await pc.setRemoteDescription(new RTCSessionDescription(sig.data));
            }
          }
          if (sig.type === "ice") {
            try { await pc.addIceCandidate(new RTCIceCandidate(sig.data)); } catch { /* ignore */ }
          }
        }
      }, 1500);
    };
    start();
    return () => {
      mounted = false;
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      pcRef.current?.close();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const formatDur = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = micMuted; });
    setMicMuted(m => !m);
  };
  const toggleCam = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = camOff; });
    setCamOff(c => !c);
  };
  const toggleSpeaker = () => setSpeakerOff(s => !s);

  const handleEnd = async () => {
    await apiFetch(CALLS_URL, { method: "POST", body: JSON.stringify({ action: "end", room_id: roomId }) });
    onEnd();
  };

  return (
    <div className="fixed inset-0 z-[150] flex flex-col bg-gradient-to-b from-gray-900 to-black">
      {/* Remote video (full screen) */}
      {callType === "video" && (
        <video ref={remoteVideoRef} autoPlay playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-90" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Top info */}
      <div className="relative z-10 flex flex-col items-center pt-16 gap-3">
        <Avatar user={partner} size={88} dot={false} />
        <p className="text-white font-bold text-2xl mt-2">{partner.display_name}</p>
        <p className="text-white/70 text-sm">{status === "В сети" ? formatDur(duration) : status}</p>
      </div>

      {/* Local video pip */}
      {callType === "video" && (
        <div className="absolute top-4 right-4 z-20 w-28 h-36 rounded-2xl overflow-hidden shadow-xl border-2 border-white/20">
          <video ref={localVideoRef} autoPlay playsInline muted
            className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-12 left-0 right-0 z-10 flex justify-center gap-5">
        <button onClick={toggleMic}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg
            ${micMuted ? "bg-white/20 ring-2 ring-red-400" : "bg-white/15 hover:bg-white/25"}`}>
          <Icon name={micMuted ? "MicOff" : "Mic"} size={24} className="text-white" />
        </button>
        {callType === "video" && (
          <button onClick={toggleCam}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg
              ${camOff ? "bg-white/20 ring-2 ring-red-400" : "bg-white/15 hover:bg-white/25"}`}>
            <Icon name={camOff ? "VideoOff" : "Video"} size={24} className="text-white" />
          </button>
        )}
        <button onClick={handleEnd}
          className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center shadow-xl hover:bg-destructive/90 transition-all">
          <Icon name="PhoneOff" size={28} className="text-white" />
        </button>
        <button onClick={toggleSpeaker}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg
            ${speakerOff ? "bg-white/20 ring-2 ring-red-400" : "bg-white/15 hover:bg-white/25"}`}>
          <Icon name={speakerOff ? "VolumeX" : "Volume2"} size={24} className="text-white" />
        </button>
      </div>
    </div>
  );
}

// ─── Settings Screen ──────────────────────────────────────────────────────────
export function SettingsScreen({ user, settings, onSettings, onLogout, onAvatarUpload, avatarUploading, avatarInputRef, onUpdateProfile }: {
  user: User; settings: AppSettings;
  onSettings: (s: AppSettings) => void;
  onLogout: () => void;
  onAvatarUpload: (f: File) => void;
  avatarUploading: boolean;
  avatarInputRef: React.RefObject<HTMLInputElement>;
  onUpdateProfile: (display_name: string, username: string) => Promise<string | null>;
}) {
  const [tab, setTab] = useState<"profile" | "appearance" | "notifications" | "devices" | "language">("profile");
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user.display_name);
  const [editUsername, setEditUsername] = useState(user.username);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const t = useT(settings.language);
  const set = (p: Partial<AppSettings>) => onSettings({ ...settings, ...p });

  const saveProfile = async () => {
    setProfileSaving(true); setProfileError(""); setProfileSuccess(false);
    const err = await onUpdateProfile(editName.trim(), editUsername.trim());
    setProfileSaving(false);
    if (err) { setProfileError(err); }
    else { setProfileSuccess(true); setEditingProfile(false); setTimeout(() => setProfileSuccess(false), 3000); }
  };

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
    { id: "profile", icon: "User", label: t("profile") },
    { id: "appearance", icon: "Palette", label: t("appearance") },
    { id: "notifications", icon: "Bell", label: t("notifications_tab") },
    { id: "devices", icon: "Monitor", label: t("devices") },
    { id: "language", icon: "Globe", label: t("language") },
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
                <div className="text-sm text-muted-foreground">@{user.username}</div>
              </div>
            </div>

            {profileSuccess && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 text-green-600 text-sm">
                <Icon name="CheckCircle" size={14} />{t("profile_saved")}
              </div>
            )}

            {!editingProfile ? (
              <>
                <div className="bg-card rounded-2xl border border-border divide-y divide-border">
                  {[
                    { icon: "User", label: t("name"), value: user.display_name },
                    { icon: "AtSign", label: t("username"), value: `@${user.username}` },
                    { icon: "Shield", label: t("encryption"), value: "AES-512 E2E" },
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
                <button onClick={() => { setEditingProfile(true); setEditName(user.display_name); setEditUsername(user.username); setProfileError(""); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary/10 hover:bg-primary/15 text-primary text-sm font-medium transition-colors">
                  <Icon name="Pencil" size={15} />{t("edit_profile")}
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">{t("display_name")}</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    maxLength={64}
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder={t("display_name")} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">@{t("username")}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                    <input value={editUsername} onChange={e => setEditUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())}
                      maxLength={32}
                      className="w-full pl-7 pr-3 py-2.5 text-sm rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="username" />
                  </div>
                  <p className="text-xs text-muted-foreground">{t("username_hint")}</p>
                </div>
                {profileError && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/10 text-destructive text-xs">
                    <Icon name="AlertCircle" size={13} />{profileError}
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => { setEditingProfile(false); setProfileError(""); }}
                    className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
                    {t("cancel")}
                  </button>
                  <button onClick={saveProfile} disabled={profileSaving || !editName.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {profileSaving
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Icon name="Check" size={15} />}
                    {t("save")}
                  </button>
                </div>
              </div>
            )}

            <button onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-destructive/10 hover:bg-destructive/15 text-destructive text-sm font-medium">
              <Icon name="LogOut" size={16} />{t("logout")}
            </button>
          </div>
        )}

        {tab === "appearance" && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Тема</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: "system" as Theme, icon: "Monitor", label: "Системная" },
                  { value: "light" as Theme, icon: "Sun", label: "Светлая" },
                  { value: "dark" as Theme, icon: "Moon", label: "Тёмная" },
                ] as { value: Theme; icon: string; label: string }[]).map(t => (
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
                      ${settings.fontSize === fs.v ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted/50"}`}>
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

// ─── CreateChannelModal ────────────────────────────────────────────────────────
export function CreateChannelModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (name: string, desc: string, isPublic: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-sm p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">Новый канал</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted"><Icon name="X" size={16} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Название канала *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Например: Мой блог"
              className="w-full px-3 py-2 text-sm rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Описание</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="О чём этот канал?" rows={3}
              className="w-full px-3 py-2 text-sm rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
            <div>
              <div className="text-sm font-medium">Публичный канал</div>
              <div className="text-xs text-muted-foreground">Виден всем пользователям</div>
            </div>
            <button onClick={() => setIsPublic(!isPublic)}
              className={`w-10 h-6 rounded-full transition-all relative ${isPublic ? "bg-primary" : "bg-muted-foreground/30"}`}>
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all" style={{ left: isPublic ? "calc(100% - 22px)" : "2px" }} />
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors">Отмена</button>
          <button onClick={() => name.trim() && onCreate(name.trim(), desc, isPublic)} disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40">
            Создать
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EditChannelModal ─────────────────────────────────────────────────────────
export function EditChannelModal({ channel, onClose, onSave, onDelete, onUploadAvatar }: {
  channel: Channel;
  onClose: () => void;
  onSave: (id: number, fields: { name?: string; description?: string; is_public?: boolean }) => void;
  onDelete: (id: number) => void;
  onUploadAvatar: (file: File) => void;
}) {
  const [name, setName] = useState(channel.name);
  const [desc, setDesc] = useState(channel.description || "");
  const [isPublic, setIsPublic] = useState(channel.is_public);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await onUploadAvatar(file);
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-sm p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">Редактировать канал</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted"><Icon name="X" size={16} /></button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl overflow-hidden"
              style={{ background: channel.avatar_color }}>
              {channel.avatar_url ? <img src={channel.avatar_url} alt="" className="w-full h-full object-cover" /> : channel.name.slice(0,2).toUpperCase()}
            </div>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md">
              {uploading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Icon name="Camera" size={14} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <p className="text-xs text-muted-foreground">Нажмите для смены аватара</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Название</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Описание</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
              className="w-full px-3 py-2 text-sm rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
            <div>
              <div className="text-sm font-medium">Публичный</div>
              <div className="text-xs text-muted-foreground">Виден в поиске</div>
            </div>
            <button onClick={() => setIsPublic(!isPublic)}
              className={`w-10 h-6 rounded-full transition-all relative ${isPublic ? "bg-primary" : "bg-muted-foreground/30"}`}>
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all" style={{ left: isPublic ? "calc(100% - 22px)" : "2px" }} />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors">Отмена</button>
          <button onClick={() => onSave(channel.id, { name, description: desc, is_public: isPublic })}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            Сохранить
          </button>
        </div>

        {channel.role === "owner" && (
          <div className="border-t border-border pt-3">
            {confirmDelete ? (
              <div className="space-y-2">
                <p className="text-sm text-center text-muted-foreground">Удалить канал безвозвратно?</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 rounded-xl border border-border text-sm hover:bg-muted">Нет</button>
                  <button onClick={() => onDelete(channel.id)} className="flex-1 py-2 rounded-xl bg-destructive text-white text-sm font-medium">Удалить</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-colors text-sm">
                <Icon name="Trash2" size={15} />Удалить канал
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PaymentModal ─────────────────────────────────────────────────────────────
export function PaymentModal({
  plan, period, step, method, loading, paymentRef,
  cardNumber, cardExpiry, cardCvv, cardName,
  onSetPlan, onSetPeriod, onSetMethod,
  onSetCardNumber, onSetCardExpiry, onSetCardCvv, onSetCardName,
  onInitiate, onConfirm, onClose,
}: {
  plan: string; period: "month" | "year"; step: "select" | "form" | "success";
  method: "card" | "sbp"; loading: boolean; paymentRef: string;
  cardNumber: string; cardExpiry: string; cardCvv: string; cardName: string;
  onSetPlan: (p: string) => void; onSetPeriod: (p: "month" | "year") => void;
  onSetMethod: (m: "card" | "sbp") => void;
  onSetCardNumber: (v: string) => void; onSetCardExpiry: (v: string) => void;
  onSetCardCvv: (v: string) => void; onSetCardName: (v: string) => void;
  onInitiate: (plan: string, period: "month" | "year") => void;
  onConfirm: () => void; onClose: () => void;
}) {
  const PLAN_INFO: Record<string, { name: string; price_month: number; price_year: number; badge: string; color: string }> = {
    standard: { name: "Standard", price_month: 149, price_year: 1490, badge: "✦ STANDARD", color: "#0ea5e9" },
    premium: { name: "Premium", price_month: 499, price_year: 4990, badge: "⭐ PREMIUM", color: "#6366f1" },
  };
  const info = PLAN_INFO[plan] || PLAN_INFO.premium;
  const amount = period === "year" ? info.price_year : info.price_month;
  const periodLabel = period === "year" ? "год" : "месяц";

  const formatCard = (v: string) => v.replace(/\D/g,"").slice(0,16).replace(/(\d{4})/g,"$1 ").trim();
  const formatExpiry = (v: string) => { const d = v.replace(/\D/g,"").slice(0,4); return d.length > 2 ? d.slice(0,2)+"/"+d.slice(2) : d; };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-sm shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-base font-bold">
            {step === "select" ? "Оформить подписку" : step === "form" ? "Оплата" : "Готово!"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted"><Icon name="X" size={16} /></button>
        </div>

        {step === "select" && (
          <div className="px-6 pb-6 space-y-4">
            {/* Plan selector */}
            <div className="grid grid-cols-2 gap-2">
              {["standard","premium"].map(p => {
                const pi = PLAN_INFO[p];
                return (
                  <button key={p} onClick={() => onSetPlan(p)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${plan === p ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40"}`}>
                    <div className="text-sm font-bold" style={{ color: pi.color }}>{pi.badge}</div>
                    <div className="text-xs text-muted-foreground mt-1">{pi.price_month}₽/мес</div>
                  </button>
                );
              })}
            </div>
            {/* Period selector */}
            <div className="grid grid-cols-2 gap-2">
              {([["month","1 месяц"],["year","1 год"]] as [string,string][]).map(([p, label]) => (
                <button key={p} onClick={() => onSetPeriod(p as "month"|"year")}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${period === p ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40"}`}>
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs text-muted-foreground">{p === "year" ? PLAN_INFO[plan]?.price_year+"₽" : PLAN_INFO[plan]?.price_month+"₽"}
                    {p === "year" && <span className="ml-1 text-green-500 font-medium">-17%</span>}
                  </div>
                </button>
              ))}
            </div>
            <div className="bg-muted/60 rounded-xl p-3 text-sm">
              <div className="font-semibold">{info.badge} · {periodLabel}</div>
              <div className="text-muted-foreground text-xs mt-0.5">Итого: {amount}₽</div>
            </div>
            <button onClick={() => onInitiate(plan, period)} disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              Перейти к оплате — {amount}₽
            </button>
          </div>
        )}

        {step === "form" && (
          <div className="px-6 pb-6 space-y-4">
            <div className="bg-muted/60 rounded-xl p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{info.badge}</div>
                <div className="text-xs text-muted-foreground">{periodLabel} · {amount}₽</div>
              </div>
              <div className="text-xs text-muted-foreground font-mono">{paymentRef}</div>
            </div>
            {/* Method tabs */}
            <div className="flex gap-2">
              {([["card","Карта"],["sbp","СБП"]] as [string,string][]).map(([m,label]) => (
                <button key={m} onClick={() => onSetMethod(m as "card"|"sbp")}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border-2 ${method === m ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/40"}`}>
                  {label}
                </button>
              ))}
            </div>

            {method === "card" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Номер карты</label>
                  <input value={formatCard(cardNumber)} onChange={e => onSetCardNumber(e.target.value.replace(/\s/g,""))}
                    placeholder="0000 0000 0000 0000" maxLength={19}
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary/30 font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Срок</label>
                    <input value={formatExpiry(cardExpiry)} onChange={e => onSetCardExpiry(e.target.value)} placeholder="MM/YY" maxLength={5}
                      className="w-full px-3 py-2.5 text-sm rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary/30 font-mono" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">CVV</label>
                    <input value={cardCvv} onChange={e => onSetCardCvv(e.target.value.replace(/\D/g,"").slice(0,3))} placeholder="•••" maxLength={3} type="password"
                      className="w-full px-3 py-2.5 text-sm rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary/30 font-mono" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Имя на карте</label>
                  <input value={cardName} onChange={e => onSetCardName(e.target.value.toUpperCase())} placeholder="IVAN IVANOV"
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary/30 font-mono" />
                </div>
              </div>
            )}

            {method === "sbp" && (
              <div className="text-center py-4 space-y-3">
                <div className="w-32 h-32 bg-muted rounded-2xl mx-auto flex items-center justify-center">
                  <div className="text-4xl">📱</div>
                </div>
                <div className="text-sm text-muted-foreground">Откройте приложение банка и отсканируйте QR-код для оплаты через СБП</div>
                <div className="font-mono text-xs bg-muted rounded-lg px-3 py-2">{paymentRef}</div>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-center">
              <Icon name="Shield" size={11} />
              <span>Защищено TLS-шифрованием</span>
            </div>

            <button onClick={onConfirm} disabled={loading || (method === "card" && (cardNumber.length < 16 || cardExpiry.length < 5 || cardCvv.length < 3))}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              Оплатить {amount}₽
            </button>
          </div>
        )}

        {step === "success" && (
          <div className="px-6 pb-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <Icon name="CheckCircle" size={36} className="text-green-500" />
            </div>
            <div>
              <div className="font-bold text-lg">Оплата прошла!</div>
              <div className="text-sm text-muted-foreground mt-1">{info.badge} активирован на {periodLabel}</div>
              <div className="font-mono text-xs text-muted-foreground mt-1">{paymentRef}</div>
            </div>
            <button onClick={onClose} className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90">
              Отлично!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
