"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  Upload,
  User,
  CheckCircle,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import type { RawContent } from "@/types/resume";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const t = useTranslations("chat");

  // --- Chat state ---
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- Form state ---
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Resume creation state ---
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Mobile: toggle form panel ---
  const [showForm, setShowForm] = useState(false);

  // --- Set localized greeting on mount ---
  useEffect(() => {
    setMessages([{ role: "assistant", content: t("greeting") }]);
  }, [t]);

  // --- Create chat session on mount ---
  useEffect(() => {
    const createSession = async () => {
      try {
        const res = await fetch("/api/chat/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        setSessionId(data.sessionId);
        if (data.email) setUserEmail(data.email);
      } catch (err) {
        console.error("Failed to create chat session:", err);
      }
    };
    createSession();
  }, []);

  // --- Auto-scroll to latest message ---
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Send chat message ---
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, sessionId, locale }),
      });
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        aiContent += decoder.decode(value);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: aiContent,
          };
          return updated;
        });
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Photo upload handler ---
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // --- Create Resume ---
  const handleCreate = async () => {
    if (!sessionId) return;
    setError(null);
    setIsCreating(true);

    try {
      const chatText = messages
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n\n");

      const rawContent: RawContent = {
        chatText,
        form: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: userEmail,
        },
      };

      const photoUrl: string | null = photoBase64;

      const res = await fetch("/api/resume/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawContent, chatSessionId: sessionId, photoUrl }),
      });

      const data = await res.json();

      if (res.ok && data.status === "ready") {
        router.push(`/${locale}/dashboard?created=true`);
      } else {
        setError(data.error || t("errorGeneric"));
      }
    } catch (err) {
      console.error("Create error:", err);
      setError(t("errorNetwork"));
    } finally {
      setIsCreating(false);
    }
  };

  // --- Form fields ---
  const formFields = [
    {
      label: t("firstName"),
      value: firstName,
      setter: setFirstName,
      placeholder: t("firstNamePlaceholder"),
    },
    {
      label: t("lastName"),
      value: lastName,
      setter: setLastName,
      placeholder: t("lastNamePlaceholder"),
    },
    {
      label: t("phone"),
      value: phone,
      setter: setPhone,
      placeholder: t("phonePlaceholder"),
    },
  ];

  // --- Shared form content (used in both mobile and desktop) ---
  const formContent = (
    <>
      {/* Photo upload */}
      <div className="flex flex-col items-center gap-3">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
        >
          {photoPreview ? (
            <Image
              src={photoPreview}
              alt="Photo"
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <Upload className="w-3 h-3" />
          {t("uploadPhoto")}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
      </div>
      <Separator />

      {/* Form fields */}
      <div className="space-y-3">
        {formFields.map(({ label, value, setter, placeholder }) => (
          <div key={label}>
            <label className="text-xs text-muted-foreground mb-1 block">
              {label}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setter(e.target.value)}
              placeholder={placeholder}
              disabled={isCreating}
              className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50 disabled:opacity-50"
            />
          </div>
        ))}
      </div>
    </>
  );

  // --- Error + Create button (shared) ---
  const actionButton = (
    <div className="space-y-3">
      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <Button
        onClick={handleCreate}
        disabled={isCreating || !sessionId}
        className="w-full gap-2"
      >
        {isCreating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("generating")}
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            {t("createResume")}
          </>
        )}
      </Button>
    </div>
  );

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row">
      {/* ── Chat column ── */}
      <div className="flex-1 flex flex-col min-h-0 border-r-0 md:border-r border-border">
        <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center justify-between gap-3">
          <h1 className="font-semibold text-lg">{t("title")}</h1>
          {/* Mobile: toggle form button */}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden gap-1.5"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            {t("detailsTitle")}
          </Button>
        </div>

        {/* Mobile: collapsible form panel */}
        {showForm && (
          <div className="md:hidden border-b border-border px-4 py-4 space-y-4 bg-card/50 max-h-[60vh] overflow-y-auto">
            {formContent}
            <div className="pt-2">{actionButton}</div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground px-4 py-3 rounded-2xl rounded-bl-sm text-sm">
                <span className="animate-pulse">{t("typing")}</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 sm:px-6 py-4 border-t border-border">
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 96) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={t("inputPlaceholder")}
              disabled={isCreating}
              rows={1}
              className="flex-1 bg-muted text-foreground rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 resize-none overflow-y-auto"
              style={{ maxHeight: "96px" }}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || isCreating}
              size="sm"
              className="rounded-xl px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Right column: Form (desktop only) ── */}
      <div className="hidden md:flex w-80 flex-col">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-lg">{t("detailsTitle")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("detailsSubtitle")}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {formContent}
        </div>
        <div className="px-6 py-4 border-t border-border">{actionButton}</div>
      </div>

      {/* ── Mobile: sticky Create button at bottom (when form is hidden) ── */}
      {!showForm && (
        <div className="md:hidden px-4 py-3 border-t border-border bg-background">
          {actionButton}
        </div>
      )}
    </div>
  );
}
