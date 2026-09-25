"use client";

import { useActionState } from "react";
import { entrar, type EstadoEntrar } from "./acoes";

const campo =
  "border-linha bg-cartao placeholder:text-texto-3 hover:border-linha-forte h-11 rounded-lg border px-3 text-[15px] transition-colors";

export function FormularioEntrar({ voltar }: { voltar: string }) {
  const [estado, acao, enviando] = useActionState<EstadoEntrar, FormData>(entrar, { erro: "", email: "" });

  return (
    <form action={acao} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="voltar" value={voltar} />
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-[15px] font-medium">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          defaultValue={estado.email}
          required
          aria-invalid={estado.erro ? true : undefined}
          aria-describedby={estado.erro ? "erro-entrar" : undefined}
          className={campo}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="senha" className="text-[15px] font-medium">
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={estado.erro ? true : undefined}
          aria-describedby={estado.erro ? "erro-entrar" : undefined}
          className={campo}
        />
      </div>
      <p id="erro-entrar" role="alert" className="text-vermelho-texto min-h-5 text-[14px]">
        {estado.erro}
      </p>
      <button
        type="submit"
        disabled={enviando}
        className="bg-vermelho-botao hover:bg-vermelho disabled:bg-elevado disabled:text-texto-2 h-11 rounded-lg text-[15px] font-semibold text-white transition-colors"
      >
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
