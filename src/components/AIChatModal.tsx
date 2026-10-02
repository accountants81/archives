import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Wifi,
  WifiOff,
  Trash2,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  CornerDownLeft,
  ChevronDown,
} from 'lucide-react';
import { Client, ChatMessage } from '../types';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  onAddClientFromAI?: (clientData: any) => void;
  onDeleteClientFromAI?: (identifier: string) => void;
  isOnline: boolean;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({
  isOpen,
  onClose,
  clients,
  onAddClientFromAI,
  onDeleteClientFromAI,
  isOnline,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'مرحباً بك في المساعد الذكي لنظام "أرشيف الضرائب".\nيمكنني مساعدتك في:\n- الاستعلام عن إحصائيات العملاء والمدن ونسب الذكور والإناث\n- إضافة عميل جديد مباشرة (مثال: "أضف عميل باسم كمال ورقم 01012345678")\n- حذف عميل أو نقله لسلة المهملات\n- الإجابة عن التساؤلات المتعلقة بالقوانين والإقرارات الضريبية',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Speech Recognition setup (Voice to Text in Arabic)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'ar-EG';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  // Text to Speech (Listen in Arabic)
  const handleSpeak = (text: string, msgId: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-EG';
    utterance.rate = 1.0;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    window.speechSynthesis?.cancel();
    setSpeakingId(null);
    setMessages([
      {
        id: 'welcome_' + Date.now(),
        sender: 'bot',
        text: 'تم مسح المحادثة. المساعد الذكي جاهز للإجابة عن أسئلتك وإدارة السجلات الضريبية.',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickPrompts = [
    { label: '📊 إحصائيات عامة', text: 'كم عدد العملاء المسجلين، ونسبة الذكور والإناث؟' },
    { label: '📍 توزيع المدن', text: 'ما هي أكثر المدن والمراكز تسجيلاً للعملاء والمنشآت؟' },
    { label: '➕ إضافة عميل سريع', text: 'أضف عميلاً باسم محمود سامي ورقم 01011223344 وقومي 29805051234567' },
    { label: '📝 استخراج الملاحظات', text: 'عرض جميع العملاء الذين لديهم ملاحظات مسجلة' },
    { label: '📅 عملاء اليوم', text: 'عرض العملاء الذين تم إضافتهم اليوم' },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || loading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const stats = {
        totalClients: clients.length,
        addedToday: clients.filter((c) => c.createdAt && c.createdAt.startsWith(today)).length,
        males: clients.filter((c) => c.gender === 'ذكر').length,
        females: clients.filter((c) => c.gender === 'أنثى').length,
        totalProperties: clients.reduce((acc, c) => acc + (c.propertiesCount || 0), 0),
      };

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          clients,
          stats,
          history: messages.slice(-6),
        }),
      });

      const data = await response.json();

      let actionNote = '';

      if (data.action) {
        if (data.action.type === 'ADD_CLIENT' && onAddClientFromAI) {
          onAddClientFromAI(data.action.data);
          actionNote = 'تم تنفيذ أمر إضافة العميل بنجاح في قاعدة البيانات المحلية!';
        } else if (data.action.type === 'DELETE_CLIENT' && onDeleteClientFromAI) {
          onDeleteClientFromAI(data.action.identifier);
          actionNote = 'تم تنفيذ أمر نقل العميل لسلة المهملات محلياً!';
        }
      }

      const botMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        text: data.reply || 'تمت معالجة استفسارك بنجاح.',
        actionTaken: actionNote,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.warn('Network request failed, utilizing smart client fallback:', err);

      let fallbackReply = '';
      let actionExecuted = '';

      const count = clients.length;
      const males = clients.filter((c) => c.gender === 'ذكر').length;
      const females = clients.filter((c) => c.gender === 'أنثى').length;
      const lower = prompt.toLowerCase();

      const addRegex = /(?:أضف|اضف|ضيف|ضيفلي|ضيف\s+لي|سجل|سجلي|إضافة|اضافة|تسجيل)\s+عميل[ااً]?\s*(?:باسم|الاسم|اسمه)?\s*([^\d,،]+?)(?:[\s,،]+(?:رقم\s*|هاتف\s*|موبايل\s*)?(\d{11}))?(?:[\s,،]*(?:قومي\s*|رقم\s*قومي\s*)?(\d{14}))?/;
      const addMatch = prompt.match(addRegex);

      if (addMatch && onAddClientFromAI) {
        const clientName = addMatch[1].replace(/^(باسم|اسم|اسمه)\s*/, '').trim();
        const clientPhone = addMatch[2] ? addMatch[2].trim() : '';
        const clientNationalId = addMatch[3] ? addMatch[3].trim() : '2900101' + Math.floor(1000000 + Math.random() * 9000000);

        // Check if city or properties mentioned
        let detectedCity = '';
        const cityMatch = prompt.match(/(?:من|في|مدينة|مركز|قرية)\s+([^\d,،]+)/);
        if (cityMatch) {
          detectedCity = cityMatch[1].trim();
        }

        let detectedProps = 1;
        const propMatch = prompt.match(/(\d+)\s*(?:منشآت|منشأة|بيوت|عقارات)/);
        if (propMatch) {
          detectedProps = parseInt(propMatch[1], 10) || 1;
        }

        onAddClientFromAI({
          fullName: clientName,
          phone: clientPhone,
          nationalId: clientNationalId,
          city: detectedCity,
          propertiesCount: detectedProps,
          gender: 'ذكر',
          notes: 'تمت الإضافة عبر المساعد الذكي',
        });
        fallbackReply = `تمت إضافة العميل "${clientName}" ${clientPhone ? `برقم هاتف ${clientPhone}` : '(بدون رقم هاتف)'} ورقم قومي ${clientNationalId} بنجاح إلى قاعدة البيانات المحلية.`;
        actionExecuted = 'تمت الإضافة بنجاح في سجل العملاء!';
      } else if (/(?:احذف|احذفلي|احذف\s+لي|حذف|ازالة|إزالة)/.test(lower)) {
        const words = prompt.replace(/(?:احذف|احذفلي|احذف\s+لي|حذف|ازالة|إزالة)\s*(?:العميل|عميل)?\s*/, '').trim();
        if (words && onDeleteClientFromAI) {
          onDeleteClientFromAI(words);
          fallbackReply = `تم نقل العميل المطابق لـ "${words}" إلى سلة المهملات.`;
          actionExecuted = 'تم النقل إلى سلة المهملات!';
        } else {
          fallbackReply = 'يرجى تحديد اسم أو رقم العميل المراد حذفه.';
        }
      } else if (lower.includes('عدد العملاء') || lower.includes('كم عميل')) {
        fallbackReply = `إجمالي عدد العملاء في الأرشيف حالياً هو ${count} عميل مسجل. (الذكور: ${males}، الإناث: ${females}).`;
      } else if (lower.includes('ذكور') || lower.includes('الذكور')) {
        fallbackReply = `عدد العملاء الذكور المسجلين هو ${males} عميل.`;
      } else if (lower.includes('إناث') || lower.includes('الاناث') || lower.includes('الإناث')) {
        fallbackReply = `عدد العملاء الإناث المسجلات هو ${females} عميل.`;
      } else {
        fallbackReply = `أهلاً بك! إجمالي عدد العملاء في الأرشيف حالياً هو ${count} عميل. يمكنك سؤالي عن إحصائيات السجلات أو طلبي بإضافة أو حذف عميل مباشرة.`;
      }

      const botMsg: ChatMessage = {
        id: 'bot_fallback_' + Date.now(),
        sender: 'bot',
        text: fallbackReply,
        actionTaken: actionExecuted,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[85vh] max-h-[750px] overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 text-white flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black">المساعد الذكي للضرائب (AI)</h2>
                <div
                  className="flex items-center gap-1 text-[11px] font-semibold"
                  title={isOnline ? 'متصل بالإنترنت' : 'غير متصل بالإنترنت'}
                >
                  <span
                    className={`w-2 h-2 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                      isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400">
                    {isOnline ? 'متصل' : 'محلي'}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                تحليل ملفات الممولين، تنفيذ أوامر الإضافة والحذف، واستخراج الإحصائيات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              title="تفريغ المحادثة"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl p-3.5 space-y-2 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200/60 dark:border-slate-700/60 shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line break-words font-sans">{msg.text}</div>

                {msg.actionTaken && (
                  <div className="mt-2 p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>{msg.actionTaken}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-1 text-[10px] opacity-70">
                  <span>{msg.timestamp}</span>

                  {msg.sender === 'bot' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSpeak(msg.text, msg.id)}
                        title={speakingId === msg.id ? 'إيقاف الصوت' : 'استماع للرد بصوت عربي'}
                        className="hover:opacity-100 transition p-0.5"
                      >
                        {speakingId === msg.id ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleCopyMessage(msg.text, msg.id)}
                        title="نسخ النص"
                        className="hover:opacity-100 transition p-0.5"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-500 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>جاري تحليل البيانات وإعداد الرد...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 overflow-x-auto flex items-center gap-1.5 scrollbar-none text-[11px]">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.text)}
              disabled={loading}
              className="shrink-0 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition cursor-pointer disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            {/* Voice Input Button */}
            {recognitionRef.current && (
              <button
                type="button"
                onClick={toggleVoiceInput}
                title={isListening ? 'إيقاف الاستماع' : 'إملاء صوتي باللغة العربية'}
                className={`p-2.5 rounded-2xl border transition cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="اسأل المساعد الذكي، أو اطلب إضافة أو حذف عميل... (Enter للإرسال)"
                className="w-full resize-none py-2.5 pl-3 pr-3 text-xs sm:text-sm rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 max-h-24"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-md shadow-blue-600/20 transition cursor-pointer shrink-0"
              title="إرسال"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
