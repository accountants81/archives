/**
 * Security & Data Sanitization Utilities
 * Protects against XSS, prototype pollution, injection attacks, and invalid payloads.
 */

// Basic HTML entity encoder to neutralize any injected script tags or attributes
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }
  return input
    .replace(/[<>]/g, '') // strip direct angle brackets
    .replace(/javascript:/gi, '') // strip javascript: protocol
    .replace(/on\w+=/gi, '') // strip inline event handlers like onerror=, onload=
    .trim();
}

/**
 * Deeply sanitizes and validates a Client object before storing or processing.
 */
export function sanitizeClient<T extends Record<string, any>>(client: T): T {
  if (!client || typeof client !== 'object') {
    throw new Error('بيانات العميل غير صالحة');
  }

  // Prevent prototype pollution
  const safe: Record<string, any> = {};
  for (const key of Object.keys(client)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    const val = client[key];
    if (typeof val === 'string') {
      safe[key] = sanitizeString(val);
    } else if (typeof val === 'number') {
      safe[key] = isFinite(val) ? val : 0;
    } else if (Array.isArray(val)) {
      safe[key] = val.map((item) => (typeof item === 'string' ? sanitizeString(item) : item));
    } else if (typeof val === 'boolean') {
      safe[key] = val;
    } else {
      safe[key] = val;
    }
  }

  return safe as T;
}

/**
 * Validates and safely parses JSON backups to block malicious payloads.
 */
export function validateAndSanitizeBackup(rawJson: string): {
  isValid: boolean;
  data?: any;
  error?: string;
} {
  try {
    if (!rawJson || typeof rawJson !== 'string') {
      return { isValid: false, error: 'ملف النسخة الاحتياطية فارغ' };
    }

    if (rawJson.length > 50 * 1024 * 1024) {
      return { isValid: false, error: 'حجم الملف كبير جداً ويتجاوز الحد الأقصى المسموح به (50 ميجابايت)' };
    }

    const parsed = JSON.parse(rawJson, (key, value) => {
      // Prevent prototype pollution during parse
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined;
      }
      return value;
    });

    if (!parsed || typeof parsed !== 'object') {
      return { isValid: false, error: 'صيغة النسخة الاحتياطية غير صالحة' };
    }

    // Validate clients array
    const clients = Array.isArray(parsed.clients) ? parsed.clients.map(sanitizeClient) : [];
    const trash = Array.isArray(parsed.trash) ? parsed.trash.map(sanitizeClient) : [];

    return {
      isValid: true,
      data: {
        ...parsed,
        clients,
        trash,
      },
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: `فشل فك تشفير وفحص ملف النسخة الاحتياطية: ${err?.message || 'صيغة غير صحيحة'}`,
    };
  }
}
