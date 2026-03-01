import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

const CONTACTS = [
  { id: 1, name: "Анна Соколова", status: "online", avatar: "АС", color: "#4F86C6", lastSeen: "сейчас", unread: 2 },
  { id: 2, name: "Дмитрий Волков", status: "offline", avatar: "ДВ", color: "#5BA87A", lastSeen: "1 ч назад", unread: 0 },
  { id: 3, name: "Мария Кузнецова", status: "online", avatar: "МК", color: "#C47DB5", lastSeen: "сейчас", unread: 5 },
  { id: 4, name: "Алексей Петров", status: "typing", avatar: "АП", color: "#D4885A", lastSeen: "пишет...", unread: 0 },
  { id: 5, name: "Светлана Иванова", status: "offline", avatar: "СИ", color: "#7B8FA6", lastSeen: "вчера", unread: 0 },
  { id: 6, name: "Команда продукта", status: "online", avatar: "КП", color: "#5966C0", lastSeen: "сейчас", unread: 12 },
  { id: 7, name: "Олег Морозов", status: "offline", avatar: "ОМ", color: "#B5574A", lastSeen: "3 дн назад", unread: 0 },
];

const MESSAGES_DATA: Record<number, { id: number; text: string; time: string; out: boolean; status?: string }[]> = {
  1: [
    { id: 1, text: "Привет! Как дела с проектом?", time: "10:24", out: false },
    { id: 2, text: "Всё идёт по плану, закончим к пятнице.", time: "10:25", out: true, status: "read" },
    { id: 3, text: "Отлично! Можешь скинуть черновик?", time: "10:26", out: false },
    { id: 4, text: "Конечно, отправлю сегодня вечером.", time: "10:28", out: true, status: "read" },
    { id: 5, text: "Жду 👌", time: "10:29", out: false },
  ],
  2: [
    { id: 1, text: "Дмитрий, встреча переносится на четверг", time: "09:00", out: true, status: "read" },
    { id: 2, text: "Окей, принял. В какое время?", time: "09:15", out: false },
    { id: 3, text: "В 14:00 как обычно", time: "09:16", out: true, status: "read" },
  ],
  3: [
    { id: 1, text: "Нужна помощь с дизайном!", time: "11:00", out: false },
    { id: 2, text: "Что именно нужно?", time: "11:05", out: true, status: "sent" },
    { id: 3, text: "Лендинг для нового продукта", time: "11:06", out: false },
    { id: 4, text: "Пришли ТЗ, посмотрим", time: "11:08", out: true, status: "sent" },
    { id: 5, text: "Уже отправила на почту", time: "11:09", out: false },
  ],
  4: [
    { id: 1, text: "Алексей, подтверди получение документов", time: "08:30", out: true, status: "read" },
    { id: 2, text: "Да, всё получил, изучаю", time: "08:45", out: false },
  ],
  5: [],
  6: [
    { id: 1, text: "Релиз перенесён на следующую неделю", time: "вчера", out: false },
    { id: 2, text: "Понял, обновляю задачи", time: "вчера", out: true, status: "read" },
    { id: 3, text: "Кто занимается тестированием?", time: "09:00", out: false },
    { id: 4, text: "Я беру на себя", time: "09:05", out: true, status: "sent" },
  ],
  7: [
    { id: 1, text: "Олег, когда будет отчёт?", time: "пн", out: true, status: "read" },
    { id: 2, text: "К концу недели готов", time: "пн", out: false },
  ],
};

const ALL_CONTACTS_LIST = [
  { id: 1, name: "Анна Соколова", avatar: "АС", color: "#4F86C6", status: "online" },
  { id: 2, name: "Дмитрий Волков", avatar: "ДВ", color: "#5BA87A", status: "offline" },
  { id: 3, name: "Мария Кузнецова", avatar: "МК", color: "#C47DB5", status: "online" },
  { id: 4, name: "Алексей Петров", avatar: "АП", color: "#D4885A", status: "online" },
  { id: 5, name: "Светлана Иванова", avatar: "СИ", color: "#7B8FA6", status: "offline" },
  { id: 6, name: "Команда продукта", avatar: "КП", color: "#5966C0", status: "online" },
  { id: 7, name: "Олег Морозов", avatar: "ОМ", color: "#B5574A", status: "offline" },
  { id: 8, name: "Николай Семёнов", avatar: "НС", color: "#6A9E72", status: "offline" },
  { id: 9, name: "Елена Тихонова", avatar: "ЕТ", color: "#9E7B6A", status: "online" },
];

type Section = "chats" | "contacts" | "archive" | "search" | "settings" | "profile";

export default function Index() {
  const [section, setSection] = useState<Section>("chats");
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [messages, setMessages] = useState(MESSAGES_DATA);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChatData = CONTACTS.find((c) => c.id === activeChat);
  const activeMsgs = activeChat ? messages[activeChat] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMsgs]);

  const sendMessage = () => {
    if (!input.trim() || !activeChat) return;
    const newMsg = {
      id: Date.now(),
      text: input.trim(),
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      out: true,
      status: "sent",
    };
    setMessages((prev) => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), newMsg] }));
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openChat = (id: number) => {
    setActiveChat(id);
    setMobileView("chat");
  };

  const filteredChats = CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = ALL_CONTACTS_LIST.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems: { id: Section; icon: string; label: string }[] = [
    { id: "chats", icon: "MessageSquare", label: "Чаты" },
    { id: "contacts", icon: "Users", label: "Контакты" },
    { id: "archive", icon: "Archive", label: "Архив" },
    { id: "search", icon: "Search", label: "Поиск" },
    { id: "settings", icon: "Settings", label: "Настройки" },
  ];

  return (
    <div className="flex h-screen bg-[hsl(var(--background))] overflow-hidden font-sans">
      {/* Sidebar nav */}
      <nav className="w-16 flex flex-col items-center py-4 gap-1 border-r border-border bg-white shrink-0">
        <div className="mb-4 w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <Icon name="Lock" size={18} className="text-white" />
        </div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setSection(item.id); if (item.id !== "chats") setActiveChat(null); }}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-150 relative
              ${section === item.id ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            title={item.label}
          >
            <Icon name={item.icon} size={20} />
          </button>
        ))}
        <div className="mt-auto">
          <button
            onClick={() => setSection("profile")}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all
              ${section === "profile" ? "ring-2 ring-primary ring-offset-2" : "hover:ring-2 hover:ring-border hover:ring-offset-1"}`}
            style={{ background: "#4F86C6", color: "white" }}
          >
            ВЫ
          </button>
        </div>
      </nav>

      {/* Panel */}
      <div className={`w-80 shrink-0 border-r border-border bg-white flex flex-col ${mobileView === "chat" ? "hidden md:flex" : "flex"} md:flex`}>
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {section === "chats" && "Сообщения"}
              {section === "contacts" && "Контакты"}
              {section === "archive" && "Архив"}
              {section === "search" && "Поиск"}
              {section === "settings" && "Настройки"}
              {section === "profile" && "Профиль"}
            </h2>
            {section === "chats" && (
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
                <Icon name="PenSquare" size={17} className="text-muted-foreground" />
              </button>
            )}
          </div>
          {(section === "chats" || section === "contacts" || section === "search") && (
            <div className="relative">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={section === "search" ? "Глобальный поиск..." : "Поиск..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-muted border-0 outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground transition-all"
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* CHATS */}
          {section === "chats" && (
            <div>
              {filteredChats.map((c, i) => {
                const lastMsg = messages[c.id]?.slice(-1)[0];
                return (
                  <button
                    key={c.id}
                    onClick={() => openChat(c.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/60 transition-colors animate-fade-in text-left
                      ${activeChat === c.id ? "bg-primary/[0.08] border-r-2 border-primary" : ""}`}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className="relative shrink-0">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                        style={{ background: c.color }}
                      >
                        {c.avatar}
                      </div>
                      {c.status === "online" && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                      )}
                      {c.status === "typing" && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-blue-400 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground truncate">{c.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">{lastMsg?.time || ""}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-muted-foreground truncate">
                          {c.status === "typing" ? (
                            <span className="text-primary">пишет...</span>
                          ) : lastMsg ? (
                            lastMsg.out ? `Вы: ${lastMsg.text}` : lastMsg.text
                          ) : "Нет сообщений"}
                        </span>
                        {c.unread > 0 && (
                          <span className="ml-2 shrink-0 min-w-5 h-5 px-1.5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {c.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* CONTACTS */}
          {section === "contacts" && (
            <div className="px-4 py-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-2">
                Онлайн · {filteredContacts.filter(c => c.status === "online").length}
              </div>
              {filteredContacts.filter(c => c.status === "online").map((c) => (
                <button key={c.id} onClick={() => { setSection("chats"); openChat(c.id); }}
                  className="w-full flex items-center gap-3 py-2.5 hover:bg-muted/60 rounded-xl px-2 transition-colors text-left">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                      style={{ background: c.color }}>{c.avatar}</div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
                  </div>
                  <span className="text-sm font-medium">{c.name}</span>
                  <Icon name="MessageCircle" size={15} className="ml-auto text-muted-foreground" />
                </button>
              ))}
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4">
                Не в сети · {filteredContacts.filter(c => c.status === "offline").length}
              </div>
              {filteredContacts.filter(c => c.status === "offline").map((c) => (
                <button key={c.id} onClick={() => { setSection("chats"); openChat(c.id); }}
                  className="w-full flex items-center gap-3 py-2.5 hover:bg-muted/60 rounded-xl px-2 transition-colors text-left opacity-50">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                    style={{ background: c.color }}>{c.avatar}</div>
                  <span className="text-sm font-medium">{c.name}</span>
                  <Icon name="MessageCircle" size={15} className="ml-auto text-muted-foreground" />
                </button>
              ))}
            </div>
          )}

          {/* ARCHIVE */}
          {section === "archive" && (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
              <Icon name="Archive" size={36} className="opacity-30" />
              <p className="text-sm">Архив пуст</p>
            </div>
          )}

          {/* SEARCH */}
          {section === "search" && (
            <div className="px-4">
              {searchQuery ? (
                <>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2 mb-2">Чаты</div>
                  {filteredChats.length === 0 && (
                    <p className="text-sm text-muted-foreground py-2">Ничего не найдено</p>
                  )}
                  {filteredChats.map((c) => (
                    <button key={c.id} onClick={() => { setSection("chats"); openChat(c.id); }}
                      className="w-full flex items-center gap-3 py-2.5 hover:bg-muted/60 rounded-xl px-2 transition-colors text-left">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                        style={{ background: c.color }}>{c.avatar}</div>
                      <span className="text-sm font-medium">{c.name}</span>
                    </button>
                  ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
                  <Icon name="Search" size={36} className="opacity-30" />
                  <p className="text-sm">Введите запрос для поиска</p>
                </div>
              )}
            </div>
          )}

          {/* SETTINGS */}
          {section === "settings" && (
            <div className="px-4 py-2">
              {[
                { icon: "Bell", label: "Уведомления", sub: "Включены" },
                { icon: "Lock", label: "Конфиденциальность", sub: "E2E шифрование активно" },
                { icon: "Palette", label: "Оформление", sub: "Светлая тема" },
                { icon: "Smartphone", label: "Устройства", sub: "1 активное" },
                { icon: "HelpCircle", label: "Помощь", sub: "" },
                { icon: "LogOut", label: "Выйти", sub: "" },
              ].map((item) => (
                <button key={item.label}
                  className="w-full flex items-center gap-3 py-3 px-2 hover:bg-muted/60 rounded-xl transition-colors text-left">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                    <Icon name={item.icon} size={17} className="text-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{item.label}</div>
                    {item.sub && <div className="text-xs text-muted-foreground">{item.sub}</div>}
                  </div>
                  <Icon name="ChevronRight" size={16} className="ml-auto text-muted-foreground" />
                </button>
              ))}
            </div>
          )}

          {/* PROFILE */}
          {section === "profile" && (
            <div className="px-4 py-4">
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                  ВЫ
                </div>
                <div className="text-center">
                  <div className="font-semibold text-base">Ваш аккаунт</div>
                  <div className="text-sm text-muted-foreground">@username</div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                  В сети
                </div>
              </div>
              <div className="mt-2 space-y-1">
                {[
                  { icon: "User", label: "Изменить имя" },
                  { icon: "Phone", label: "Телефон" },
                  { icon: "Link", label: "Имя пользователя" },
                  { icon: "Info", label: "О себе" },
                ].map((item) => (
                  <button key={item.label}
                    className="w-full flex items-center gap-3 py-3 px-2 hover:bg-muted/60 rounded-xl transition-colors text-left">
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                      <Icon name={item.icon} size={17} className="text-foreground" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                    <Icon name="ChevronRight" size={16} className="ml-auto text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col ${mobileView === "list" && !activeChat ? "hidden md:flex" : "flex"}`}>
        {activeChat && activeChatData ? (
          <>
            {/* Chat header */}
            <div className="h-14 px-4 flex items-center gap-3 border-b border-border bg-white shrink-0">
              <button
                onClick={() => setMobileView("list")}
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted"
              >
                <Icon name="ArrowLeft" size={18} className="text-muted-foreground" />
              </button>
              <div className="relative">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                  style={{ background: activeChatData.color }}>
                  {activeChatData.avatar}
                </div>
                {activeChatData.status === "online" && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
                )}
              </div>
              <div>
                <div className="text-sm font-semibold">{activeChatData.name}</div>
                <div className={`text-xs ${activeChatData.status === "typing" ? "text-primary" : "text-muted-foreground"}`}>
                  {activeChatData.status === "online" && "В сети"}
                  {activeChatData.status === "offline" && activeChatData.lastSeen}
                  {activeChatData.status === "typing" && "пишет..."}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
                  <Icon name="Phone" size={17} className="text-muted-foreground" />
                </button>
                <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
                  <Icon name="Video" size={17} className="text-muted-foreground" />
                </button>
                <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
                  <Icon name="MoreVertical" size={17} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* E2E badge */}
            <div className="flex justify-center py-2 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-100">
                <Icon name="Lock" size={11} className="text-green-500" />
                <span className="text-xs text-green-600 font-medium font-mono">Сквозное шифрование</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1"
              style={{ background: "hsl(220, 15%, 97%)" }}>
              {activeMsgs.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                  <Icon name="MessageSquare" size={40} className="opacity-20" />
                  <p className="text-sm">Напишите первое сообщение</p>
                </div>
              )}
              {activeMsgs.map((msg, i) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.out ? "justify-end" : "justify-start"} animate-slide-up`}
                  style={{ animationDelay: `${i * 20}ms` }}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-3.5 py-2 rounded-2xl text-sm leading-relaxed
                      ${msg.out
                        ? "msg-out rounded-br-sm"
                        : "msg-in rounded-bl-sm shadow-sm border border-border"
                      }`}
                  >
                    <span>{msg.text}</span>
                    <div className={`flex items-center justify-end gap-1 mt-0.5 ${msg.out ? "text-white/70" : "text-muted-foreground"}`}>
                      <span className="text-[10px]">{msg.time}</span>
                      {msg.out && (
                        msg.status === "read"
                          ? <Icon name="CheckCheck" size={12} />
                          : <Icon name="Check" size={12} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 bg-white border-t border-border shrink-0">
              <div className="flex items-end gap-2">
                <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors shrink-0">
                  <Icon name="Paperclip" size={18} className="text-muted-foreground" />
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Сообщение..."
                  rows={1}
                  className="flex-1 resize-none px-3 py-2 text-sm rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground transition-all max-h-32 overflow-auto"
                  style={{ lineHeight: "1.5" }}
                />
                <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors shrink-0">
                  <Icon name="Smile" size={18} className="text-muted-foreground" />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all shrink-0
                    ${input.trim() ? "bg-primary hover:bg-primary/90 text-white" : "bg-muted text-muted-foreground"}`}
                >
                  <Icon name="Send" size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8"
            style={{ background: "hsl(220, 15%, 97%)" }}>
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Icon name="Lock" size={36} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Cipher Messenger</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Все сообщения защищены сквозным шифрованием. Выберите чат слева, чтобы начать.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-50 border border-green-100">
              <Icon name="ShieldCheck" size={14} className="text-green-500" />
              <span className="text-xs text-green-600 font-medium">E2E шифрование активно</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
