import { AlertTriangle, Clock, Loader } from "lucide-react";
import type { StatusAnalise } from "@/lib/types";

const TEXTO: Record<Exclude<StatusAnalise, "pronta">, string> = {
  pendente: "Aguardando análise",
  analisando: "Analisando",
  erro: "A análise falhou",
  sem_video: "Sem vídeo: envie o .mp4",
};

/** Substitui a faixa de cortes enquanto o Reel não tem análise. */
export function SeloStatus({ status }: { status: StatusAnalise }) {
  if (status === "pronta") return null;
  const atencao = status === "erro" || status === "sem_video";
  const Icone = atencao ? AlertTriangle : status === "analisando" ? Loader : Clock;
  return (
    <p
      className={`flex h-1.5 items-center gap-1.5 text-[12px] ${
        atencao ? "text-vermelho-texto" : "text-texto-3"
      }`}
    >
      <Icone size={13} aria-hidden />
      {TEXTO[status]}
    </p>
  );
}
