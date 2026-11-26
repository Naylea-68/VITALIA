import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Send, ShieldCheck, X } from 'lucide-react';
import { UserProfile, VitaExpression } from '../types/vitalia';
import { getVitaStage } from '../data/vitaliaData';
import { VitaMascot } from './characters/VitaCharacters';

interface VitaChatDrawerProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  onMessageSent?: (question: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const SUGGESTED_QUESTIONS = [
  'Explícame un nutriente',
  'Ayúdame a entender una receta',
  'Tengo una duda sobre los alimentos',
  'Quiero aprender sobre bioplásticos',
  'Explícame algo de las misiones',
];

export const VitaChatDrawer: React.FC<VitaChatDrawerProps> = ({
  open,
  onClose,
  profile,
  onMessageSent,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-vita',
      role: 'assistant',
      text: `¡Hola${profile.nickname ? `, ${profile.nickname}` : ''}! Soy VITA. ¿Qué te gustaría descubrir hoy sobre alimentación, recetas, movimiento, bienestar o bioplásticos?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expression, setExpression] = useState<VitaExpression>('alegria');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const currentStage = getVitaStage(profile.xp);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    onMessageSent?.(trimmed);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setErrorMsg(null);
    setLoading(true);
    setExpression('curiosidad');

    try {
      const response = await fetch('/api/vita-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
          context: {
            nickname: profile.nickname,
            stage: currentStage.name,
            allergies: profile.allergies,
          },
        }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok || !data.reply) {
        setErrorMsg(
          data.error || 'No se pudo obtener respuesta en este momento. Intenta de nuevo más tarde.'
        );
        setExpression('tranquilidad');
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `vita-${Date.now()}`,
          role: 'assistant',
          text: data.reply!,
        },
      ]);
      setExpression('alegria');
    } catch {
      setErrorMsg(
        'No fue posible conectar con el servidor de VITA RESPONDE. Recuerda que las misiones, recetas y BIOTEC siguen disponibles.'
      );
      setExpression('tranquilidad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="VITA RESPONDE asistente educativo"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full sm:max-w-xl h-[90dvh] sm:h-[640px] rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-white/95 rounded-2xl p-1 shrink-0">
              <VitaMascot
                stage={currentStage.id}
                expression={expression}
                accessory={profile.equippedAccessory}
                size={46}
              />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-base sm:text-lg truncate">VITA RESPONDE</h2>
              <p className="text-xs text-emerald-100 truncate">
                Asistente educativo · Lenguaje claro y confiable
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar VITA RESPONDE"
            className="min-w-[44px] min-h-[44px] rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ethical guardrails notice */}
        <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            Guía educativa sin dietas restrictivas ni diagnósticos médicos. Para temas de salud consulta a un adulto de confianza y profesional.
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F6FAF7]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-sm'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-slate-600">
                VITA está preparando una explicación clara...
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 flex items-start gap-2.5 text-xs sm:text-sm text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Starter questions */}
        <div className="px-4 py-2.5 bg-white border-t border-slate-100 overflow-x-auto">
          <div className="flex items-center gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                disabled={loading}
                onClick={() => sendMessage(q)}
                className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 pb-safe"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={600}
            placeholder="Escribe tu pregunta para VITA..."
            className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Enviar pregunta"
            className="min-w-[44px] min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold text-sm inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
