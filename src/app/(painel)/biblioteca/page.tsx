import Link from "next/link";
import { Search } from "lucide-react";
import { AbasPeriodo } from "@/components/abas-periodo";
import { CartaoReel } from "@/components/cartao-reel";
import { criterioDeDesempenho, listarReels, type Filtro, type Ordem } from "@/lib/dados";
import { frasePeriodo, periodoValido, type PeriodoId } from "@/lib/periodos";

const POR_PAGINA = 48;

type Visao = "proprios" | "referencias" | "atencao";

const VISOES: { id: Visao; rotulo: string }[] = [
  { id: "proprios", rotulo: "Nossos Reels" },
  { id: "referencias", rotulo: "Referências" },
  { id: "atencao", rotulo: "Precisam de atenção" },
];

function texto(v: string | string[] | undefined) {
  return typeof v === "string" ? v : undefined;
}

export default async function Biblioteca({ searchParams }: PageProps<"/biblioteca">) {
  const sp = await searchParams;
  const visao: Visao =
    texto(sp.atencao) === "1" ? "atencao" : texto(sp.origem) === "referencia" ? "referencias" : "proprios";
  const periodo: PeriodoId = periodoValido(texto(sp.periodo)) ?? "sempre";
  const ordem: Ordem = texto(sp.ordem) === "desempenho" ? "desempenho" : "recentes";
  const busca = texto(sp.q)?.slice(0, 80) ?? "";
  const limite = Math.min(Number(texto(sp.limite)) || POR_PAGINA, 480);

  const filtro: Filtro = {
    origem: visao === "referencias" ? "referencia" : visao === "proprios" ? "proprio" : undefined,
    atencao: visao === "atencao",
    periodo: visao === "proprios" ? periodo : undefined,
    busca,
    ordem,
  };
  const reels = listarReels(filtro);
  const visiveis = reels.slice(0, limite);

  function href(mudar: Record<string, string | undefined>) {
    const base: Record<string, string | undefined> = {
      origem: visao === "referencias" ? "referencia" : undefined,
      atencao: visao === "atencao" ? "1" : undefined,
      periodo: visao === "proprios" && periodo !== "sempre" ? periodo : undefined,
      ordem: ordem === "desempenho" ? "desempenho" : undefined,
      q: busca || undefined,
      ...mudar,
    };
    const qs = new URLSearchParams(
      Object.entries(base).filter((e): e is [string, string] => Boolean(e[1])),
    ).toString();
    return qs ? `/biblioteca?${qs}` : "/biblioteca";
  }

  const hrefVisao = (v: Visao) =>
    v === "proprios" ? "/biblioteca" : v === "referencias" ? "/biblioteca?origem=referencia" : "/biblioteca?atencao=1";

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] leading-tight font-semibold">Biblioteca</h1>
            <p className="text-texto-2 mt-1 text-[15px]">
              Cada Reel com a análise da edição, pronta para copiar.
            </p>
          </div>
          <form action="/biblioteca" className="relative w-full sm:w-72" role="search">
            {visao === "referencias" && <input type="hidden" name="origem" value="referencia" />}
            {visao === "atencao" && <input type="hidden" name="atencao" value="1" />}
            <Search size={16} className="text-texto-3 absolute top-1/2 left-3 -translate-y-1/2" aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={busca}
              placeholder="Buscar na legenda"
              aria-label="Buscar na legenda"
              className="border-linha bg-cartao placeholder:text-texto-3 focus:border-linha-forte h-10 w-full rounded-lg border pr-3 pl-9 text-[15px] outline-none"
            />
          </form>
        </div>

        <nav aria-label="Tipo de vídeo" className="border-linha flex gap-6 border-b">
          {VISOES.map((v) => (
            <Link
              key={v.id}
              href={hrefVisao(v.id)}
              aria-current={v.id === visao ? "page" : undefined}
              className={`-mb-px border-b-2 pb-3 text-[15px] transition-colors ${
                v.id === visao
                  ? "border-vermelho text-texto font-medium"
                  : "text-texto-2 hover:text-texto border-transparent"
              }`}
            >
              {v.rotulo}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {visao === "proprios" ? (
            <AbasPeriodo atual={periodo} hrefPara={(p) => href({ periodo: p === "sempre" ? undefined : p, limite: undefined })} />
          ) : (
            <span />
          )}
          <div className="flex items-center gap-1 text-[13px]" role="group" aria-label="Ordenar">
            <span className="text-texto-3 mr-1">Ordenar por</span>
            {(["recentes", "desempenho"] as const).map((o) => (
              <Link
                key={o}
                href={href({ ordem: o === "desempenho" ? "desempenho" : undefined })}
                scroll={false}
                aria-current={o === ordem ? "true" : undefined}
                className={`rounded-full border px-3 py-1.5 ${
                  o === ordem ? "border-linha-forte bg-elevado text-texto" : "text-texto-2 hover:text-texto border-transparent"
                }`}
              >
                {o === "recentes" ? "Mais recentes" : criterioDeDesempenho() === "score" ? "Desempenho" : "Curtidas"}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {visiveis.length ? (
        <>
          <p className="text-texto-2 -mt-2 text-[14px]">
            {reels.length} {reels.length === 1 ? "Reel" : "Reels"}
            {visao === "proprios" && periodo !== "sempre" ? ` ${frasePeriodo(periodo)}` : ""}
            {busca ? ` com “${busca}”` : ""}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {visiveis.map((r, i) => (
              <CartaoReel key={r.id} reel={r} posicao={ordem === "desempenho" ? i + 1 : undefined} />
            ))}
          </div>
          {reels.length > visiveis.length && (
            <Link
              href={href({ limite: String(limite + POR_PAGINA) })}
              scroll={false}
              className="border-linha-forte hover:bg-elevado mx-auto inline-flex h-10 items-center rounded-lg border px-5 text-[15px] font-medium"
            >
              Mostrar mais {Math.min(POR_PAGINA, reels.length - visiveis.length)}
            </Link>
          )}
        </>
      ) : (
        <Vazio visao={visao} busca={busca} />
      )}
    </div>
  );
}

function Vazio({ visao, busca }: { visao: Visao; busca: string }) {
  if (busca) {
    return <p className="text-texto-2 text-[15px]">Nenhum Reel com “{busca}” na legenda. Tente outra palavra.</p>;
  }
  if (visao === "referencias") {
    return (
      <div className="bg-cartao border-linha flex max-w-xl flex-col items-start gap-4 rounded-2xl border p-6">
        <p className="text-[15px] leading-relaxed">
          Nenhuma referência ainda. Envie o .mp4 de um Reel de outra conta que você quer estudar, e a análise da
          edição aparece aqui.
        </p>
        <Link
          href="/referencias/nova"
          className="bg-vermelho-botao hover:bg-vermelho inline-flex h-10 items-center rounded-lg px-4 text-[15px] font-semibold text-white"
        >
          Enviar referência
        </Link>
      </div>
    );
  }
  if (visao === "atencao") {
    return <p className="text-texto-2 text-[15px]">Nada pendente. Todos os Reels têm vídeo e análise em dia.</p>;
  }
  return <p className="text-texto-2 text-[15px]">Nenhum Reel neste período. Escolha outro período acima.</p>;
}
