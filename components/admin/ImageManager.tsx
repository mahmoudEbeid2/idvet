"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteImage, moveImage } from "@/app/admin/actions";
import type { AdminImage } from "@/lib/admin/data";
import { ConfirmDeleteButton } from "./ConfirmDeleteButton";
import { upload } from "./upload";
import { Card } from "./ui";
import s from "./admin.module.css";

const MAX_BYTES = 15 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

export function EarlierIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function LaterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function ImageManager({ productId, images, color }: { productId: string; images: AdminImage[]; color: string }) {
  const router = useRouter();
  const [items, setItems] = useState(images);
  // Take the server's list again whenever it changes (after router.refresh()).
  const serverKey = images.map((i) => i.id).join();
  const [seenKey, setSeenKey] = useState(serverKey);
  if (serverKey !== seenKey) {
    setSeenKey(serverKey);
    setItems(images);
  }

  const [progress, setProgress] = useState<{ index: number; total: number; fraction: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [over, setOver] = useState(false);
  const [, startTransition] = useTransition();

  async function uploadFiles(fileList: FileList | File[]) {
    const files = [...fileList];
    if (!files.length || progress) return;
    const failed: string[] = [];
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      if (!TYPES.includes(file.type)) {
        failed.push(`${file.name}: الملف ليس صورة صالحة. استخدم JPG أو PNG أو WEBP.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        failed.push(`${file.name}: الملف أكبر من 15MB.`);
        continue;
      }
      setProgress({ index, total: files.length, fraction: 0 });
      const body = new FormData();
      body.set("file", file);
      body.set("productId", productId);
      try {
        const image = await upload<AdminImage>("/api/admin/uploads/image?target=product", body, (fraction) =>
          setProgress({ index, total: files.length, fraction }),
        );
        setItems((list) => [...list, image]);
      } catch (error) {
        failed.push(`${file.name}: ${(error as Error).message.replace(`${file.name}: `, "")}`);
      }
    }
    setProgress(null);
    setErrors(failed);
    router.refresh();
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    setItems((list) => {
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    startTransition(async () => {
      await moveImage(items[index].id, direction);
      router.refresh();
    });
  }

  async function remove(id: string) {
    await deleteImage(id);
    setItems((list) => list.filter((i) => i.id !== id));
    router.refresh();
  }

  const percent = progress ? Math.round(((progress.index + progress.fraction) / progress.total) * 100) : 0;

  return (
    <Card
      id="images"
      title="صور المنتج"
      description="الصورة الأولى هي الصورة الرئيسية في البطاقات. الصور بخلفية بيضاء تبدو أفضل. JPG أو PNG أو WEBP حتى 15MB، وتُصغَّر تلقائياً."
    >
      <div className={`${s.stack} ${s.stackTight}`}>
        {items.length > 0 && (
          <ul className={s.imgs}>
            {items.map((image, i) => (
              <li key={image.id}>
                <div className={s.pic} style={{ background: color }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.src} alt="" width={image.width} height={image.height} loading="lazy" />
                  {i === 0 && <span className={s.mainTag}>الصورة الرئيسية</span>}
                </div>
                <div className={s.bar}>
                  <div style={{ display: "flex" }}>
                    <button
                      type="button"
                      className={s.iconBtn}
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                      aria-label="تقديم"
                      title="تقديم"
                    >
                      <EarlierIcon />
                    </button>
                    <button
                      type="button"
                      className={s.iconBtn}
                      disabled={i === items.length - 1}
                      onClick={() => move(i, 1)}
                      aria-label="تأخير"
                      title="تأخير"
                    >
                      <LaterIcon />
                    </button>
                  </div>
                  <ConfirmDeleteButton label="حذف" variant="del" onConfirm={() => remove(image.id)} />
                </div>
              </li>
            ))}
          </ul>
        )}

        <label
          className={`${s.drop} ${over ? s.over : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            void uploadFiles(e.dataTransfer.files);
          }}
        >
          {progress ? (
            <>
              <b>
                جارٍ رفع {progress.index + 1} من {progress.total}…
              </b>
              <span className={s.progress} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                <i style={{ width: `${percent}%` }} />
              </span>
            </>
          ) : (
            <>
              <b>اختر صوراً أو اسحبها إلى هنا</b>
              <span>يمكنك اختيار أكثر من صورة مرة واحدة</span>
            </>
          )}
          <input
            type="file"
            multiple
            hidden
            accept={TYPES.join(",")}
            disabled={Boolean(progress)}
            onChange={(e) => {
              const files = e.currentTarget.files;
              if (files) void uploadFiles([...files]);
              e.currentTarget.value = "";
            }}
          />
        </label>

        {errors.map((error) => (
          <p key={error} className={`${s.notice} ${s.err}`} role="alert">
            {error}
          </p>
        ))}
      </div>
    </Card>
  );
}
