import type { Plano } from "@/lib/types";
import { minutagem } from "@/lib/formato";

// Os planos que começam nos 3 primeiros segundos formam o gancho.
export const GANCHO_S = 3;

/**
 * A linha do tempo da edição, como a trilha V1 do Premiere: cada bloco é um
 * plano, com largura proporcional à duração. Mostra o ritmo de cortes de relance.
 */
export function FaixaDeCortes({
  planos,
  variante = "compacta",
}: {
  planos: Plano[];
  variante?: "compacta" | "completa";
}) {
  const total = planos.at(-1)?.fim ?? 0;
  if (!planos.length || total <= 0) return null;

  if (variante === "compacta") {
    return (
      <div
        className="flex h-1.5 gap-[2px]"
        role="img"
        aria-label={`${planos.length} planos em ${Math.round(total)} segundos`}
      >
        {planos.map((p, i) => (
          <span
            key={i}
            className={`rounded-[2px] ${p.inicio < GANCHO_S ? "bg-vermelho" : "bg-faixa"}`}
            style={{ flex: `${p.fim - p.inicio} 1 0` }}
          />
        ))}
      </div>
    );
  }

  const marcas = Array.from({ length: Math.floor(total) + 1 }, (_, s) => s);
  const fimDoGancho = Math.min(
    planos.filter((p) => p.inicio < GANCHO_S).at(-1)?.fim ?? GANCHO_S,
    total,
  );

  return (
    <figure className="m-0">
      <div className="text-texto-2 relative mb-2 h-5 text-[13px]">
        <span
          className="border-vermelho absolute top-2.5 left-0 border-t"
          style={{ width: `${(fimDoGancho / total) * 100}%` }}
          aria-hidden
        />
        <span className="bg-fundo text-vermelho-texto absolute top-0 left-0 pr-2">Gancho</span>
      </div>

      <ol className="flex h-11 gap-[2px]" aria-label="Planos da linha do tempo">
        {planos.map((p, i) => {
          const noGancho = p.inicio < GANCHO_S;
          const largura = ((p.fim - p.inicio) / total) * 100;
          return (
            <li key={i} className="min-w-0" style={{ flex: `${p.fim - p.inicio} 1 0` }}>
              <a
                href={`#plano-${i + 1}`}
                title={`Plano ${i + 1}: ${minutagem(p.inicio)} a ${minutagem(p.fim)}`}
                className={`flex h-full items-end rounded-[4px] px-1.5 pb-1 text-[12px] font-medium tabular-nums transition-colors ${
                  noGancho
                    ? "bg-vermelho-botao text-white hover:bg-vermelho"
                    : "bg-faixa text-texto hover:bg-linha-forte"
                }`}
              >
                <span className="sr-only">
                  Plano {i + 1}, de {minutagem(p.inicio)} a {minutagem(p.fim)}
                </span>
                <span aria-hidden>{largura > 3.5 ? i + 1 : ""}</span>
              </a>
            </li>
          );
        })}
      </ol>

      <div className="relative mt-1.5 h-5" aria-hidden>
        {marcas.map((s) => (
          <span
            key={s}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: `${(s / total) * 100}%`, transform: "translateX(-50%)" }}
          >
            <span className={`w-px ${s % 5 === 0 ? "bg-texto-3 h-2" : "bg-linha-forte h-1"}`} />
            {s % 5 === 0 && s > 0 && s < total - 1 && (
              <span className="text-texto-3 font-mono text-[11px]">
                {minutagem(s).replace(",0", "")}
              </span>
            )}
          </span>
        ))}
      </div>
      <figcaption className="sr-only">
        Linha do tempo com {planos.length} planos em {Math.round(total)} segundos.
      </figcaption>
    </figure>
  );
}
