"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type Estado = "parado" | "copiado" | "falhou";

export function BotaoCopiar({
  texto,
  rotulo = "Copiar análise",
  variante = "principal",
}: {
  texto: string;
  rotulo?: string;
  variante?: "principal" | "icone";
}) {
  const [estado, setEstado] = useState<Estado>("parado");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setEstado("copiado");
    } catch {
      setEstado("falhou");
    }
    setTimeout(() => setEstado("parado"), 2200);
  }

  const aviso =
    estado === "copiado"
      ? "Análise copiada"
      : estado === "falhou"
        ? "Não foi possível copiar. Selecione o texto e use Ctrl+C."
        : "";

  if (variante === "icone") {
    return (
      <>
        <button
          type="button"
          onClick={copiar}
          aria-label={rotulo}
          title={rotulo}
          className="border-linha text-texto-2 hover:border-linha-forte hover:text-texto grid size-9 shrink-0 place-items-center rounded-lg border transition-colors"
        >
          {estado === "copiado" ? (
            <Check size={16} className="text-vermelho-texto" aria-hidden />
          ) : (
            <Copy size={16} aria-hidden />
          )}
        </button>
        <span role="status" className="sr-only">
          {aviso}
        </span>
      </>
    );
  }

  return (
    <span className="inline-flex flex-col gap-1.5">
      <button
        type="button"
        onClick={copiar}
        className="bg-vermelho-botao hover:bg-vermelho inline-flex h-10 items-center gap-2 rounded-lg px-4 text-[15px] font-semibold text-white transition-colors"
      >
        {estado === "copiado" ? <Check size={17} aria-hidden /> : <Copy size={17} aria-hidden />}
        {estado === "copiado" ? "Análise copiada" : rotulo}
      </button>
      <span role="status" className="text-texto-2 min-h-4 text-[13px]">
        {estado === "falhou" ? aviso : ""}
      </span>
    </span>
  );
}
