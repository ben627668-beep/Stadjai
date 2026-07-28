import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, RefreshCw, MessageSquare, Lightbulb, Check, Copy } from 'lucide-react';
import { BudgetCalculationResult } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface AiStudentAdvisorChatProps {
  calculationResult: BudgetCalculationResult;
}

export const AiStudentAdvisorChat: React.FC<AiStudentAdvisorChatProps> = ({ calculationResult }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `Bonjour cher étudiant de l'Université de Bondoukou ! 👋\n\nJe suis **l'IA STADJAI**, ton assistant virtuel financier et spirituel.\n\nJ'ai analysé ton budget de **${calculationResult.totalBudget.toLocaleString('fr-FR')} FCFA** pour **${calculationResult.periodLabel || (calculationResult.period === 'year' ? '9 mois' : '30 jours')}**.\n\nPose-moi n'importe quelle question sur la façon de dépenser ton argent jour par jour, les astuces resto U à Bondoukou, la gestion du transport, ou demande-moi un conseil spirituel !`,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "📊 Explique-moi en détail comment L'IA STADJAI a calculé mon budget",
    "🍲 Cantine midi (200F), soir maquis (500F) & petit-déj : quel budget mensuel ?",
    "💡 Comment répartir mes dépenses jour par jour ?",
    "🍛 Comment économiser sur le resto U CROU-B ?",
    "⚠️ Que faire si mon budget est presque épuisé ?",
    "🧼 Astuces pour acheter mes produits d'hygiène à Bondoukou ?",
    "📖 Donne-moi un verset biblique et une prière pour mes études",
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const historyPayload = messages.concat(userMsg).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          budgetContext: {
            totalBudget: calculationResult.totalBudget,
            period: calculationResult.period,
            periodLabel: calculationResult.periodLabel,
            daysCount: calculationResult.daysCount,
            isCiteUniversitaire: calculationResult.isCiteUniversitaire,
            categories: calculationResult.categories,
            remainingAmount: calculationResult.remainingAmount,
          },
        }),
      });

      const data = await res.json();
      const aiReplyText = data.reply || "Pardon, je n'ai pas pu traiter ta demande. Réessaie dans un instant !";

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error contacting AI chat:', err);
      const errorMsg: Message = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: "Pardon, une petite interférence réseau s'est produite. Mais n'oublie pas : *'Confie tes affaires à l'Éternel et tes projets réussiront'* (Proverbes 16:3). N'hésite pas à me reposer ta question !",
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: "Conversation réinitialisée ! De quoi souhaites-tu parler pour ton budget d'études à Bondoukou ?",
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-3xl border-2 border-amber-500/40 shadow-2xl overflow-hidden my-8 transition-all">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-600 p-4 sm:p-5 text-slate-950 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-inner font-black ring-2 ring-slate-900">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg font-serif flex items-center gap-2">
              <span>IA STADJAI - Conseiller Étudiant</span>
              <span className="text-3xs font-mono font-bold bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full border border-amber-400/30 uppercase">
                Gemini AI
              </span>
            </h3>
            <p className="text-2xs sm:text-xs text-slate-950/80 font-bold">
              Pose toutes tes questions sur ton budget, tes dépenses et la vie à Bondoukou
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClearChat}
          title="Réinitialiser la discussion"
          className="p-2 bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Quick Questions */}
      <div className="bg-slate-800/80 border-b border-slate-700/60 p-3 overflow-x-auto scrollbar-none flex gap-2">
        <span className="text-3xs font-bold uppercase tracking-wider text-amber-400 shrink-0 self-center flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5" /> Exemples :
        </span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(q)}
            className="text-2xs bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-700 hover:border-amber-400 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all font-medium"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Box */}
      <div className="p-4 sm:p-6 space-y-4 max-h-[420px] overflow-y-auto bg-slate-950/80 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                msg.sender === 'user'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-emerald-600 text-white font-bold'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed relative group ${
                msg.sender === 'user'
                  ? 'bg-amber-500 text-slate-950 font-semibold rounded-tr-none'
                  : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tl-none shadow-md'
              }`}
            >
              <div className="whitespace-pre-wrap space-y-2 font-sans">
                {msg.text.split('\n').map((paragraph, pIdx) => {
                  if (!paragraph.trim()) return null;

                  // Simple markdown style formatting for bold text
                  const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                  return (
                    <p key={pIdx}>
                      {parts.map((part, partIdx) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return (
                            <strong key={partIdx} className={msg.sender === 'user' ? 'font-black text-slate-950' : 'text-amber-400 font-extrabold'}>
                              {part.slice(2, -2)}
                            </strong>
                          );
                        }
                        return part;
                      })}
                    </p>
                  );
                })}
              </div>

              {/* Timestamp & Copy button */}
              <div
                className={`mt-2 flex items-center justify-between gap-2 text-3xs ${
                  msg.sender === 'user' ? 'text-slate-900/70' : 'text-slate-400'
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.sender === 'ai' && (
                  <button
                    type="button"
                    onClick={() => handleCopyText(msg.id, msg.text)}
                    className="opacity-60 group-hover:opacity-100 transition-opacity hover:text-amber-400 flex items-center gap-1"
                    title="Copier la réponse"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800 text-slate-300 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-700/80 flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>L'IA STADJAI prépare tes conseils financiers...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pose ta question (ex: Comment gérer mon repas du soir ?)..."
            disabled={isTyping}
            className="flex-1 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 disabled:opacity-40 text-slate-950 font-extrabold px-5 py-3 rounded-2xl transition-all shadow-md flex items-center gap-2 shrink-0 text-xs sm:text-sm"
          >
            <span>Envoyer</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
