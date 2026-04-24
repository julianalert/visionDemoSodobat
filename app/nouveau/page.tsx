"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveDevis, generateId, type Devis } from "@/lib/store";

type Message = {
  role: "assistant" | "user";
  text: string;
};

export default function NouveauDevis() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Bonjour ! Décrivez votre demande client en quelques phrases : nom du client, type de projet, localisation, surface et délai souhaité. Je génèrerai le devis complet automatiquement.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingExample, setLoadingExample] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const LOADING_STEPS = [
    "Analyse de la demande...",
    "Consultation de la base historique...",
    "Calibrage des prix...",
    "Structuration du devis...",
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleExample() {
    setLoadingExample(true);
    try {
      const res = await fetch("/api/generate-request", { method: "POST" });
      const data = await res.json();
      setInput(data.message || "");
      textareaRef.current?.focus();
    } catch {
      setInput("Bonjour, nous sommes la société Azur Promotion. Nous souhaitons un devis pour la construction d'un immeuble résidentiel R+4 à Draguignan (83300), surface plancher 2 400m². Livraison souhaitée sous 14 mois. Contact : contact@azur-promotion.fr");
    } finally {
      setLoadingExample(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);
    setLoadingStep(0);

    intervalRef.current = setInterval(() => {
      setLoadingStep((s) => (s < LOADING_STEPS.length - 1 ? s + 1 : s));
    }, 1800);

    try {
      const res = await fetch("/api/generate-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (intervalRef.current) clearInterval(intervalRef.current);

      if (data.error) throw new Error(data.error);

      const devis = data as Devis;
      const id = generateId();
      saveDevis({
        id,
        status: "brouillon",
        createdAt: new Date().toISOString(),
        devis,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Devis ${devis.devisRef} généré avec succès pour ${devis.client.nom}. Montant : ${devis.totalTTC.toLocaleString("fr-FR")} € TTC. Redirection vers le devis...`,
        },
      ]);

      setTimeout(() => router.push(`/devis/${id}`), 1200);
    } catch (e) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Une erreur est survenue lors de la génération : ${(e as Error).message}. Veuillez réessayer.`,
        },
      ]);
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      <header>
        <div className="logo">
          <img src="/images/sodobat.jpeg" alt="Sodobat" className="logo-img" onClick={() => router.push("/")} />
        </div>
        <div className="header-badge">
          <div className="dot-live"></div>
          Nouveau devis
        </div>
      </header>

      <div className="app" style={{ maxWidth: 760 }}>
        <div className="dashboard-topbar">
          <div>
            <h1 className="dashboard-title">Nouvelle demande</h1>
            <p className="dashboard-sub">Décrivez le projet et l&apos;IA génère le devis complet</p>
          </div>
          <button className="btn btn-ghost" onClick={handleExample} disabled={loading || loadingExample}>
            {loadingExample ? "⏳ Génération..." : "✨ Exemple"}
          </button>
        </div>

        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.role === "user" ? "chat-bubble--user" : "chat-bubble--assistant"}`}>
                {m.role === "assistant" && (
                  <div className="chat-avatar">IA</div>
                )}
                <div className="chat-text">{m.text}</div>
              </div>
            ))}

            {loading && (
              <div className="chat-bubble chat-bubble--assistant">
                <div className="chat-avatar">IA</div>
                <div className="chat-loading">
                  <div className="chat-spinner"></div>
                  <span>{LOADING_STEPS[loadingStep]}</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="chat-input-area">
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Décrivez la demande client : nom, type de projet, localisation, surface, délai..."
              disabled={loading}
              rows={3}
            />
            <button
              className="btn btn-accent chat-send-btn"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              {loading ? "⏳" : "Générer →"}
            </button>
          </div>
          <div className="chat-hint">
            Appuyez sur <kbd>Entrée</kbd> pour envoyer · <kbd>Maj+Entrée</kbd> pour aller à la ligne
          </div>
        </div>
      </div>
    </>
  );
}
