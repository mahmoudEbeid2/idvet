"use client";

/**
 * POSTs a FormData to an upload route with XHR (fetch has no upload
 * progress). Resolves with the JSON body, rejects with the route's error text.
 */
export function upload<T>(url: string, body: FormData, onProgress?: (fraction: number) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.responseType = "json";
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () => {
      const data = xhr.response as (T & { error?: string }) | null;
      if (xhr.status >= 200 && xhr.status < 300 && data) resolve(data);
      else if (xhr.status === 401) reject(new Error("انتهت الجلسة. سجّل الدخول مرة أخرى."));
      else if (xhr.status === 413 && !data?.error) reject(new Error("الملف أكبر من الحد المسموح."));
      else reject(new Error(data?.error ?? "تعذّر رفع الملف. حاول مرة أخرى."));
    };
    xhr.onerror = () => reject(new Error("تعذّر الاتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى."));
    xhr.send(body);
  });
}
