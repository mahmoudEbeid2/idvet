"use client";

import { startTransition, useActionState } from "react";
import type { FormState } from "@/lib/admin/forms";

/**
 * Runs a form Server Action from onSubmit instead of <form action>. With
 * <form action>, React 19 resets every uncontrolled field after the action
 * returns — so a validation error would wipe what the admin typed.
 * Forms using this also set method="post", so a click before hydration never
 * puts field values (like the password) into the URL.
 */
export function useFormAction(action: (state: FormState, form: FormData) => Promise<FormState>) {
  const [state, dispatch, pending] = useActionState(action, {});
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(() => dispatch(form));
  }
  return { state, pending, onSubmit };
}
