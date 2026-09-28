"use client";

import { login } from "@/app/admin/actions";
import { useFormAction } from "./useFormAction";
import { Field } from "./ui";
import s from "./admin.module.css";

export function LoginForm({ next }: { next: string }) {
  const { state, pending, onSubmit } = useFormAction(login);

  return (
    <form method="post" onSubmit={onSubmit} className={s.stack} style={{ gap: 16 }}>
      <input type="hidden" name="next" value={next} />
      <Field label="البريد الإلكتروني" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className={`${s.in} ${s.latin}`}
          defaultValue={state.fields?.email}
        />
      </Field>
      <Field label="كلمة المرور" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={`${s.in} ${s.latin}`}
        />
      </Field>
      {state.error && (
        <p className={`${s.notice} ${s.err}`} role="alert">
          {state.error}
        </p>
      )}
      <button className={`${s.btn} ${s.primary}`} type="submit" disabled={pending} style={{ width: "100%" }}>
        {pending ? "جارٍ الدخول…" : "دخول"}
      </button>
    </form>
  );
}
