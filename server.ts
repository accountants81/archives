import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Security Headers Middleware
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
  next();
});

app.use(express.json({ limit: '10mb' }));

// In-memory IP Rate Limiter for AI endpoint to prevent DDoS and API quota drainage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  record.count++;
  return true;
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', online: true, timestamp: new Date().toISOString() });
});

// AI Chatbot endpoint
app.post('/api/ai-chat', async (req, res) => {
  try {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        reply: 'تم تجاوز الحد المسموح به من الطلبات مؤقتاً لأسباب أمنية. يرجى الانتظار دقيقة والمحاولة مجدداً.',
        action: null,
      });
    }

    const { prompt, clients = [], stats = {}, history = [] } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'الرجاء إدخال رسالة' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'مفتاح الذكاء الاصطناعي (GEMINI_API_KEY) غير مهيأ حالياً في الخادم.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const clientSummaries = Array.isArray(clients)
      ? clients.slice(0, 80).map((c: any, index: number) =>
          `[${index + 1}] الاسم: ${c.fullName || ''} | هاتف: ${c.phone || ''} | قومي: ${c.nationalId || ''} | مدينة/قرية: ${c.city || 'غير محدد'} | منشآت: ${c.propertiesCount || 0} | نوع: ${c.gender || 'غير محدد'} | تاريخ: ${c.createdAt?.split('T')[0] || ''} | ملاحظات: ${c.notes || 'لا توجد'}`
        ).join('\n')
      : '';

    const systemInstruction = `
أنت المساعد الذكي لنظام "أرشيف الضرائب" (Tax Archive).
تساعد الموظفين في الاستعلام عن العملاء، تحليل المنشآت والضرائب، واستخراج الإحصائيات الدقيقة، وتنفيذ عمليات الإضافة والتعديل والحذف مباشرة.

سياق قاعدة البيانات الحالية لدى المستخدم:
- إجمالي عدد العملاء: ${Array.isArray(clients) ? clients.length : 0}
- إحصائيات التطبيق: ${JSON.stringify(stats || {})}
- عينة من سجلات العملاء:
${clientSummaries || 'لا توجد سجلات بعد.'}

القواعد الأساسية:
1. تحدث باللغة العربية بأسلوب راقٍ، مهني، دقيق ومختصر ومباشر.
2. احسب الإحصائيات بدقة تامة من السجلات (مثلاً عدد الذكور، الإناث، عملاء مدينة معينة، العملاء المضافين اليوم، أكثر المدن).
3. عند طلب إضافة عميل بأي صيغة (مثل: أضف، ضيف، ضيفلي، ضيف لي، سجل، سجل عميل...):
   - استخرج الاسم، ورقم الهاتف (إذا ذكره، أو اجعله "" لأن الهاتف اختياري)، والرقم القومي (14 رقماً أو رقم مولد)، والمدينة، والمنشآت
   - أضف في نهاية الرد كتلة كود json بصيغة action للواجهة لتنفيذها محلياً:
\`\`\`action
{
  "type": "ADD_CLIENT",
  "data": {
    "fullName": "اسم العميل",
    "phone": "010xxxxxxxx أو فارغ",
    "nationalId": "29801011234567",
    "city": "المدينة أو غير محدد",
    "propertiesCount": 1,
    "gender": "ذكر أو أنثى",
    "notes": "تمت الإضافة عبر المساعد الذكي"
  }
}
\`\`\`
4. عند طلب حذف عميل أو نقله لسلة المهملات بأي صيغة (مثل: احذف، احذفلي، حذف العميل...):
\`\`\`action
{
  "type": "DELETE_CLIENT",
  "identifier": "رقم الهاتف أو الرقم القومي أو الاسم"
}
\`\`\`
5. إذا سأل المستخدم سؤالاً عاماً أو عن النظام أو الضرائب، أجب بوضوح وتوضيح.
`;

    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        if (msg.text && (msg.sender === 'user' || msg.sender === 'bot')) {
          contents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    // List of candidate models with automatic fallback
    const CANDIDATE_MODELS = [
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
      'gemini-3.1-pro-preview',
      'gemini-flash-latest',
    ];

    let responseText = '';
    let lastError: any = null;

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        });
        if (response && response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed, trying next candidate. Error:`, err?.message || err);
      }
    }

    // Resilient local rule-based fallback if all models or network encountered issues
    if (!responseText) {
      const lower = prompt.toLowerCase();
      const count = Array.isArray(clients) ? clients.length : 0;
      const males = Array.isArray(clients) ? clients.filter((c: any) => c.gender === 'ذكر').length : 0;
      const females = Array.isArray(clients) ? clients.filter((c: any) => c.gender === 'أنثى').length : 0;

      // Check if user is asking to add a client (handles ضيف, ضيفلي, أضف, سجل, etc.)
      const addMatch = prompt.match(/(?:أضف|اضف|ضيف|ضيفلي|ضيف\s+لي|سجل|سجلي|إضافة|اضافة|تسجيل)\s+عميل[ااً]?\s*(?:باسم|الاسم|اسمه)?\s*([^\d,،]+?)(?:[\s,،]+(?:رقم\s*|هاتف\s*|موبايل\s*)?(\d{11}))?(?:[\s,،]*(?:قومي\s*|رقم\s*قومي\s*)?(\d{14}))?/);
      if (addMatch) {
        const extractedName = addMatch[1].replace(/^(باسم|اسم|اسمه)\s*/, '').trim();
        const extractedPhone = addMatch[2] ? addMatch[2].trim() : '';
        const extractedId = addMatch[3] ? addMatch[3].trim() : '2900101' + Math.floor(1000000 + Math.random() * 9000000);
        responseText = `تم تسجيل وتنفيذ أمر إضافة العميل "${extractedName}" بنجاح في قاعدة بيانات الأرشيف.\n\`\`\`action\n{\n  "type": "ADD_CLIENT",\n  "data": {\n    "fullName": "${extractedName}",\n    "phone": "${extractedPhone}",\n    "nationalId": "${extractedId}",\n    "propertiesCount": 1,\n    "gender": "ذكر",\n    "notes": "تمت الإضافة عبر المساعد الذكي"\n  }\n}\n\`\`\``;
      } else if (/(?:احذف|احذفلي|احذف\s+لي|حذف|ازالة|إزالة)/.test(lower)) {
        const target = prompt.replace(/(?:احذف|احذفلي|احذف\s+لي|حذف|ازالة|إزالة)\s*(?:العميل|عميل)?\s*/, '').trim();
        responseText = `تم إرسال أمر نقل العميل المطابق لـ "${target}" إلى سلة المهملات.\n\`\`\`action\n{\n  "type": "DELETE_CLIENT",\n  "identifier": "${target}"\n}\n\`\`\``;
      } else if (lower.includes('عدد العملاء') || lower.includes('كم عميل')) {
        responseText = `إجمالي عدد العملاء المسجلين في الأرشيف حالياً هو ${count} عميل. (الذكور: ${males}، الإناث: ${females}).`;
      } else if (lower.includes('ذكور') || lower.includes('الذكور')) {
        responseText = `عدد العملاء الذكور المسجلين في الأرشيف هو ${males} عميل من إجمالي ${count} عميل.`;
      } else if (lower.includes('إناث') || lower.includes('الاناث') || lower.includes('الإناث')) {
        responseText = `عدد العملاء الإناث المسجلات في الأرشيف هو ${females} عميل من إجمالي ${count} عميل.`;
      } else {
        responseText = `أهلاً بك! قاعدة بيانات أرشيف الضرائب تحتوي حالياً على ${count} عميل مسجل. يمكنك سؤالي عن إحصائيات المدن، تصفية السجلات، أو طلبي بكتابة: "أضف عميلاً باسم... ورقم..." أو "احذف العميل...".`;
      }
    }

    let action: any = null;
    let cleanedText = responseText;
    const match = responseText.match(/```action\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        action = JSON.parse(match[1].trim());
        cleanedText = responseText.replace(/```action[\s\S]*?```/, '').trim();
      } catch (err) {
        console.error('Action parse error:', err);
      }
    }

    res.json({
      reply: cleanedText,
      action,
    });
  } catch (error: any) {
    console.error('Error in /api/ai-chat:', error);
    res.json({
      reply: 'أهلاً بك! المساعد الذكي جاهز. كيف يمكنني مساعدتك في استعراض بيانات العملاء أو إدارتها؟',
      action: null,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
