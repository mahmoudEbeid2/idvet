"use client";

import { useState } from "react";
import { deleteCategory } from "@/app/admin/actions";
import { ConfirmDeleteButton } from "./ConfirmDeleteButton";
import { PRODUCTS, arCount } from "./ui";
import s from "./admin.module.css";

export function CategoryDelete({ id, productCount }: { id: string; productCount: number }) {
  const [error, setError] = useState<string>();
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <ConfirmDeleteButton
        label="حذف هذا القسم"
        disabled={productCount > 0}
        onConfirm={async () => {
          const result = await deleteCategory(id);
          if (result?.error) setError(result.error);
        }}
      />
      {productCount > 0 && (
        <p className={s.hint}>
          لا يمكن حذف القسم لأن فيه {arCount(productCount, PRODUCTS)}. انقل المنتجات لقسم آخر أو احذفها أولاً.
        </p>
      )}
      {error && (
        <p className={`${s.notice} ${s.err}`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
