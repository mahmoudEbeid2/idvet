"use client";

import { useState } from "react";
import { deleteCategory } from "@/app/admin/actions";
import { ConfirmDeleteButton } from "./ConfirmDeleteButton";
import { useAdminT } from "./AdminLang";
import s from "./admin.module.css";

export function CategoryDelete({ id, productCount }: { id: string; productCount: number }) {
  const [error, setError] = useState<string>();
  const t = useAdminT();
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <ConfirmDeleteButton
        label={t.category.deleteButton}
        disabled={productCount > 0}
        onConfirm={async () => {
          const result = await deleteCategory(id);
          if (result?.error) setError(result.error);
        }}
      />
      {productCount > 0 && (
        <p className={s.hint}>{t.category.cantDelete(t.count.products(productCount))}</p>
      )}
      {error && (
        <p className={`${s.notice} ${s.err}`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
