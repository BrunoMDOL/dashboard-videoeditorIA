import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { BotaoCopiar } from "@/components/botao-copiar";
import { CapaDoReel } from "@/components/capa-do-reel";
import { FaixaDeCortes, GANCHO_S } from "@/components/faixa-de-cortes";
import { SeloStatus } from "@/components/selo-status";
import { SECOES, rotulosDasEtiquetas, textoParaCopiar } from "@/lib/analise";
import { buscarReel } from "@/lib/dados";
import { duracao, formatarDataHora, formatarNumero, minutagem, tituloDoReel } from "@/lib/formato";

export async function generateMetadata({ params }: PageProps<"/videos/[id]">) {
  const reel = buscarReel((await params).id);
  return { title: reel ? `${tituloDoReel(reel.legenda)} | Besser Home` : "Reel não encontrado" };
}

export default async function PaginaDoVideo({ params }: PageProps<"/videos/[id]">) {
  const reel = buscarReel((await params).id);
  if (!reel) notFound();

  const analise = reel.analise;
  const titulo = tituloDoReel(reel.legenda);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/biblioteca"
        className="text-texto-2 hover:text-texto inline-flex w-fit items-center gap-1.5 text-[14px]"
      >
        <ArrowLeft size={15} aria-hidden />
        Biblioteca
      </Link>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:gap-12">
        <aside className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-4 lg:sticky lg:top-9 lg:grid-cols-1 lg:self-start">
          <CapaDoReel
            reel={reel}
            prioridade
            tamanho="(min-width: 1024px) 280px, 136px"
            className="w-full lg:max-w-[280px]"
          />
          <div className="flex flex-col justify-end gap-3 lg:contents">
            {reel.permalink && (
              <a
                href={reel.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-texto-2 hover:text-texto inline-flex items-center gap-1 text-[14px] lg:justify-center"
              >
                Abrir no Instagram
                <ArrowUpRight size={14} aria-hidden />
              </a>
            )}
            <details className="border-linha text-texto-2 rounded-xl border px-4 py-3 text-[14px]">
              <summary className="text-texto cursor-pointer font-medium">Legenda do post</summary>
              <p className="mt-3 leading-relaxed whitespace-pre-line">{reel.legenda || "Sem legenda."}</p>
            </details>
          </div>
        </aside>

        <article className="flex min-w-0 flex-col gap-8">
          <header className="flex flex-col gap-4">
            <p className="text-texto-2 text-[14px]">
              {reel.origem === "referencia" ? "Referência" : "Reel da Besser Home"}
            </p>
            <h1 className="max-w-[40ch] text-[30px] leading-tight font-semibold">{titulo}</h1>
            <dl className="text-texto-2 flex flex-wrap gap-x-8 gap-y-3 text-[14px]">
              <div>
                <dt className="text-texto-3 text-[13px]">Publicado</dt>
                <dd className="text-texto">{formatarDataHora(reel.publicadoEm)}</dd>
              </div>
              {duracao(reel.duracaoS) && (
                <div>
                  <dt className="text-texto-3 text-[13px]">Duração</dt>
                  <dd className="text-texto">{duracao(reel.duracaoS)}</dd>
                </div>
              )}
              {reel.metricas && (
                <>
                  <div>
                    <dt className="text-texto-3 text-[13px]">Curtidas</dt>
                    <dd className="text-texto">{formatarNumero(reel.metricas.curtidas)}</dd>
                  </div>
                  <div>
                    <dt className="text-texto-3 text-[13px]">Comentários</dt>
                    <dd className="text-texto">{formatarNumero(reel.metricas.comentarios)}</dd>
                  </div>
                </>
              )}
              {analise && (
                <div>
                  <dt className="text-texto-3 text-[13px]">Planos</dt>
                  <dd className="text-texto">{analise.linhaDoTempo.length}</dd>
                </div>
              )}
            </dl>
          </header>

          {analise ? (
            <>
              <section aria-labelledby="titulo-linha" className="flex flex-col gap-3">
                <h2 id="titulo-linha" className="text-[18px] font-semibold">
                  Linha do tempo
                </h2>
                <FaixaDeCortes planos={analise.linhaDoTempo} variante="completa" />
              </section>

              <section aria-labelledby="titulo-resumo" className="flex flex-col gap-4">
                <h2 id="titulo-resumo" className="sr-only">
                  Resumo
                </h2>
                <p className="max-w-[65ch] text-[19px] leading-relaxed">{analise.resumo}</p>
                <ul className="flex flex-wrap gap-2" aria-label="Etiquetas da edição">
                  {rotulosDasEtiquetas(analise.etiquetas).map((e) => (
                    <li
                      key={e}
                      className="border-linha-forte text-texto-2 rounded-full border px-3 py-1 text-[13px]"
                    >
                      {e}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-start gap-3 pt-1">
                  <BotaoCopiar texto={textoParaCopiar({ ...reel, analise })} />
                </div>
              </section>

              <section aria-labelledby="titulo-planos" className="flex flex-col gap-3">
                <h2 id="titulo-planos" className="text-[18px] font-semibold">
                  Plano a plano
                </h2>
                <ol className="border-linha divide-linha divide-y rounded-xl border">
                  {analise.linhaDoTempo.map((p, i) => (
                    <li
                      key={i}
                      id={`plano-${i + 1}`}
                      className="target:bg-elevado grid scroll-mt-6 grid-cols-[2.25rem_1fr] gap-x-3 gap-y-1 px-4 py-3 sm:grid-cols-[2.25rem_9.5rem_1fr]"
                    >
                      <span
                        className={`text-[14px] font-semibold tabular-nums ${p.inicio < GANCHO_S ? "text-vermelho-texto" : "text-texto-3"}`}
                      >
                        {i + 1}
                      </span>
                      <span className="text-texto-2 font-mono text-[13px] leading-6">
                        {minutagem(p.inicio)} a {minutagem(p.fim)}
                      </span>
                      <p className="col-start-2 text-[15px] leading-relaxed sm:col-start-3 sm:row-start-1">
                        {p.descricao}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>

              <section aria-labelledby="titulo-detalhes" className="flex flex-col gap-3">
                <h2 id="titulo-detalhes" className="text-[18px] font-semibold">
                  Como foi editado
                </h2>
                <dl className="border-linha divide-linha divide-y rounded-xl border">
                  {SECOES.map((s) => (
                    <div key={s.chave} className="grid gap-1 px-4 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                      <dt className="text-texto-2 text-[15px] font-medium">{s.titulo}</dt>
                      <dd className="max-w-[70ch] text-[15px] leading-relaxed">{analise[s.chave]}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <details className="border-linha group rounded-xl border">
                <summary className="cursor-pointer px-4 py-3 text-[15px] font-medium">
                  Ver o texto exato que será copiado
                </summary>
                <pre className="border-linha text-texto-2 max-h-[28rem] overflow-auto border-t px-4 py-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap">
                  {textoParaCopiar({ ...reel, analise })}
                </pre>
              </details>

              <p className="text-texto-3 text-[13px]">
                Análise gerada por {analise.modelo} em {formatarDataHora(analise.geradaEm)}.
              </p>
            </>
          ) : (
            <div className="bg-cartao border-linha flex flex-col gap-3 rounded-2xl border p-6">
              <SeloStatus status={reel.status} />
              <p className="text-texto-2 max-w-[60ch] pt-2 text-[15px] leading-relaxed">
                {reel.status === "sem_video"
                  ? "A API do Instagram não entregou o arquivo deste Reel. Baixe o vídeo e envie o .mp4 para que ele seja analisado."
                  : "A análise da edição aparece aqui assim que a IA processar este Reel."}
              </p>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
