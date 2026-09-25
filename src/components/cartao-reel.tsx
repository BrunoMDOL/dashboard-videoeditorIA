import Link from "next/link";
import type { Reel } from "@/lib/types";
import { duracao, formatarData, formatarNumero, tituloDoReel } from "@/lib/formato";
import { textoParaCopiar } from "@/lib/analise";
import { BotaoCopiar } from "./botao-copiar";
import { CapaDoReel } from "./capa-do-reel";
import { FaixaDeCortes } from "./faixa-de-cortes";
import { SeloStatus } from "./selo-status";

export function CartaoReel({ reel, posicao }: { reel: Reel; posicao?: number }) {
  const titulo = tituloDoReel(reel.legenda);
  const analise = reel.analise;

  return (
    <article className="flex flex-col gap-3">
      <div className="relative">
        <CapaDoReel reel={reel} />
        {posicao !== undefined && (
          <span className="bg-fundo text-texto absolute top-2 left-2 grid size-7 place-items-center rounded-md text-[13px] font-semibold tabular-nums">
            {posicao}
          </span>
        )}
      </div>

      {analise ? <FaixaDeCortes planos={analise.linhaDoTempo} /> : <SeloStatus status={reel.status} />}

      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] leading-snug font-medium">
            <Link
              href={`/videos/${reel.id}`}
              className="hover:text-vermelho-texto line-clamp-2 transition-colors"
            >
              {titulo}
            </Link>
          </h3>
          <p className="text-texto-2 mt-1 flex flex-wrap gap-x-3 text-[13px]">
            <span>{formatarData(reel.publicadoEm)}</span>
            {duracao(reel.duracaoS) && <span>{duracao(reel.duracaoS)}</span>}
            {reel.metricas && <span>{formatarNumero(reel.metricas.curtidas)}&nbsp;curtidas</span>}
          </p>
        </div>
        {analise && <BotaoCopiar variante="icone" texto={textoParaCopiar({ ...reel, analise })} />}
      </div>
    </article>
  );
}
