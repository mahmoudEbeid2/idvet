"use client";

import type { AdminMessages } from "@/lib/admin/i18n";

/**
 * POSTs a FormData to an upload route with XHR (fetch has no upload
 * progress). Resolves with the JSON body, rejects with the route's error text
 * (already in the dashboard language) or one of `t.errors`.
 */
export function upload<T>(
  url: string,
  body: FormData,
  t: AdminMessages,
  onProgress?: (fraction: number) => void,
): Promise<T> {
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
      else if (xhr.status === 401) reject(new Error(t.errors.sessionExpired));
      else if (xhr.status === 413 && !data?.error) reject(new Error(t.errors.tooBigGeneric));
      else reject(new Error(data?.error ?? t.errors.uploadFailed));
    };
    xhr.onerror = () => reject(new Error(t.errors.network));
    xhr.send(body);
  });
}
