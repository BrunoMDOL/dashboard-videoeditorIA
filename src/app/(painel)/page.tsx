import Link from "next/link";
import { AbasPeriodo } from "@/components/abas-periodo";
import { BotaoCopiar } from "@/components/botao-copiar";
import { CapaDoReel } from "@/components/capa-do-reel";
import { CartaoReel } from "@/components/cartao-reel";
import { FaixaDeCortes } from "@/components/faixa-de-cortes";
import { SeloStatus } from "@/components/selo-status";
import { textoParaCopiar } from "@/lib/analise";
import { contagens, criterioDeDesempenho, destaque, listarReels } from "@/lib/dados";
import { duracao, formatarDataHora, formatarNumero, tituloDoReel } from "@/lib/formato";
import { frasePeriodo, periodoValido, type PeriodoId } from "@/lib/periodos";

export default async function VisaoGeral({ searchParams }: PageProps<"/">) {
  const { periodo: bruto } = await searchParams;
  const periodo: PeriodoId = periodoValido(typeof bruto === "string" ? bruto : undefined) ?? "7d";

  const principal = destaque(periodo);
  const ranking = listarReels({ origem: "proprio", periodo, ordem: "desempenho" }).slice(0, 8);
  const recentes = listarReels({ origem: "proprio" }).slice(0, 6);
  const numeros = contagens(periodo);
  const criterio = criterioDeDesempenho();
  const noPeriodo = frasePeriodo(periodo);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-5">
        <div>
          <h1 className="text-[28px] leading-tight font-semibold">Visão geral</h1>
          <p className="text-texto-2 mt-1 max-w-[60ch] text-[15px]">
            Os Reels que mais performaram e como cada um foi editado.
          </p>
        </div>
        <AbasPeriodo atual={periodo} hrefPara={(p) => `/?periodo=${p}`} />
      </header>

      <dl className="border-linha grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-[var(--linha)] sm:grid-cols-4">
        {[
          { rotulo: "Reels publicados", valor: numeros.publicados },
          { rotulo: "Com análise", valor: numeros.analisados },
          { rotulo: "Aguardando análise", valor: numeros.aguardando },
          { rotulo: "Precisam de atenção", valor: numeros.atencao, href: "/biblioteca?atencao=1" },
        ].map((n) => (
          <div key={n.rotulo} className="bg-cartao flex flex-col-reverse gap-1 px-5 py-4">
            <dt className="text-texto-2 text-[13px]">
              {n.href && n.valor > 0 ? (
                <Link href={n.href} className="hover:text-texto underline-offset-2 hover:underline">
                  {n.rotulo}
                </Link>
              ) : (
                n.rotulo
              )}
            </dt>
            <dd className="text-[28px] leading-none font-semibold">{formatarNumero(n.valor)}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-12">
        <section aria-labelledby="titulo-destaque" className="lg:col-span-7">
          <h2 id="titulo-destaque" className="text-texto-2 mb-3 text-[15px] font-medium">
            {criterio === "score" ? "Melhor desempenho" : "Mais curtido"} {noPeriodo}
          </h2>
          {principal ? (
            <article className="bg-cartao border-linha grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-4 gap-y-5 rounded-2xl border p-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-x-6 sm:p-5">
              <CapaDoReel
                reel={principal}
                prioridade
                tamanho="(min-width: 640px) 220px, 120px"
                className="w-full sm:row-span-2"
              />
              <div className="self-center sm:self-start">
                <h3 className="text-[18px] leading-snug font-semibold sm:text-[22px]">
                  <Link
                    href={`/videos/${principal.id}`}
                    className="hover:text-vermelho-texto transition-colors"
                  >
                    {tituloDoReel(principal.legenda)}
                  </Link>
                </h3>
                <p className="text-texto-2 mt-1.5 flex flex-wrap gap-x-3 text-[14px]">
                  <span>{formatarDataHora(principal.publicadoEm)}</span>
                  {duracao(principal.duracaoS) && <span>{duracao(principal.duracaoS)}</span>}
                </p>
              </div>

              <div className="col-span-2 flex min-w-0 flex-col gap-4 sm:col-span-1 sm:col-start-2">
                {principal.metricas && (
                  <dl className="flex gap-8">
                    <div>
                      <dt className="text-texto-2 text-[13px]">Curtidas</dt>
                      <dd className="text-[24px] font-semibold">
                        {formatarNumero(principal.metricas.curtidas)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-texto-2 text-[13px]">Comentários</dt>
                      <dd className="text-[24px] font-semibold">
                        {formatarNumero(principal.metricas.comentarios)}
                      </dd>
                    </div>
                  </dl>
                )}

                {principal.analise ? (
                  <>
                    <div className="flex flex-col gap-2">
                      <FaixaDeCortes planos={principal.analise.linhaDoTempo} />
                      <p className="text-texto-3 text-[13px]">
                        {principal.analise.linhaDoTempo.length} planos. Em vermelho, o gancho.
                      </p>
                    </div>
                    <p className="max-w-[62ch] text-[15px] leading-relaxed">{principal.analise.resumo}</p>
                    <div className="mt-auto flex flex-wrap items-start gap-3">
                      <BotaoCopiar texto={textoParaCopiar({ ...principal, analise: principal.analise })} />
                      <Link
                        href={`/videos/${principal.id}`}
                        className="border-linha-forte hover:bg-elevado inline-flex h-10 items-center rounded-lg border px-4 text-[15px] font-medium transition-colors"
                      >
                        Ver análise completa
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="mt-auto flex flex-col gap-4">
                    <SeloStatus status={principal.status} />
                    <Link
                      href={`/videos/${principal.id}`}
                      className="border-linha-forte hover:bg-elevado inline-flex h-10 w-fit items-center rounded-lg border px-4 text-[15px] font-medium transition-colors"
                    >
                      Ver detalhes
                    </Link>
                  </div>
                )}
              </div>
            </article>
          ) : (
            <p className="bg-cartao border-linha text-texto-2 rounded-2xl border p-6 text-[15px]">
              Nenhum Reel publicado {noPeriodo}. Escolha outro período acima.
            </p>
          )}
        </section>

        <section aria-labelledby="titulo-ranking" className="lg:col-span-5">
          <h2 id="titulo-ranking" className="text-texto-2 mb-3 text-[15px] font-medium">
            Bombando {noPeriodo}
          </h2>
          <div className="bg-cartao border-linha rounded-2xl border">
            {ranking.length ? (
              <ol className="divide-linha divide-y">
                {ranking.map((r, i) => (
                  <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-texto-3 w-5 text-right text-[14px] font-semibold tabular-nums">
                      {i + 1}
                    </span>
                    <CapaDoReel reel={r} mini tamanho="48px" className="w-10 shrink-0 rounded-md" />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/videos/${r.id}`}
                        className="hover:text-vermelho-texto line-clamp-1 text-[14px] font-medium transition-colors"
                      >
                        {tituloDoReel(r.legenda)}
                      </Link>
                      <p className="text-texto-2 mt-0.5 flex gap-3 text-[13px]">
                        <span>{formatarNumero(r.metricas?.curtidas ?? 0)}&nbsp;curtidas</span>
                        {duracao(r.duracaoS) && <span>{duracao(r.duracaoS)}</span>}
                      </p>
                    </div>
                    {r.analise && (
                      <BotaoCopiar variante="icone" texto={textoParaCopiar({ ...r, analise: r.analise })} />
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-texto-2 p-5 text-[14px]">Sem Reels neste período.</p>
            )}
          </div>
          {criterio === "curtidas" && (
            <p className="text-texto-3 mt-2 text-[13px] leading-snug">
              Ordenado por curtidas até o score de desempenho entrar, com as métricas da Fase 2.
            </p>
          )}
        </section>
      </div>

      <section aria-labelledby="titulo-recentes">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="titulo-recentes" className="text-[20px] font-semibold">
            Publicados recentemente
          </h2>
          <Link href="/biblioteca" className="text-vermelho-texto text-[14px] hover:underline">
            Abrir biblioteca
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {recentes.map((r) => (
            <CartaoReel key={r.id} reel={r} />
          ))}
        </div>
      </section>
    </div>
  );
}
