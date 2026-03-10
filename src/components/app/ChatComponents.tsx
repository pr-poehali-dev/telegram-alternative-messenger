import React, { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { User, Message, CallSession } from "@/types";
import { apiFetch, formatBytes, CALLS_URL } from "@/lib/api";

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
  }, [roomId, isCallee, callType, sendSignal, onEnd, status]);

  const formatDur = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const toggleMic = () => {
    setMicMuted(m => {
      localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = m; });
      return !m;
    });
  };
  const toggleCam = () => {
    setCamOff(c => {
      localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = c; });
      return !c;
    });
  };
  const toggleSpeaker = () => setSpeakerOff(s => !s);
  const handleEnd = async () => {
    await apiFetch(CALLS_URL, { method: "POST", body: JSON.stringify({ action: "end", room_id: roomId }) });
    onEnd();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col">
      {callType === "video" && (
        <video ref={remoteVideoRef} autoPlay playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      <div className="relative z-10 flex flex-col items-center pt-16 gap-3">
        <Avatar user={partner} size={88} dot={false} />
        <p className="text-white font-bold text-2xl mt-2">{partner.display_name}</p>
        <p className="text-white/70 text-sm">{status === "В сети" ? formatDur(duration) : status}</p>
      </div>
      {callType === "video" && (
        <div className="absolute top-4 right-4 z-20 w-28 h-36 rounded-2xl overflow-hidden shadow-xl border-2 border-white/20">
          <video ref={localVideoRef} autoPlay playsInline muted
            className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
        </div>
      )}
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
