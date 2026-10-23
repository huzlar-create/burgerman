"use client";

import { useActionState } from "react";
import { sendLoginLink, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendLoginLink, {});

  if (state.sent) {
    return (
      <p className="rounded-kort border-2 border-streg bg-kort px-4 py-4">
        Tjek din mail. Der ligger et link, som logger dig ind.
      </p>
    );
  }

  return (
    <form action={action} className="grid gap-3">
      <label className="grid gap-1 font-semibold">
        Mailadresse
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-kort border-2 border-streg bg-kort px-3 py-2 font-normal"
        />
      </label>
      {state.error && <p className="text-ketchup font-semibold">{state.error}</p>}
      <button
        disabled={pending}
        className="rounded-full border-2 border-ristet bg-ketchup px-5 py-2 font-display text-bolle disabled:opacity-60"
      >
        {pending ? "SENDER…" : "SEND LOGIN-LINK"}
      </button>
    </form>
  );
}
