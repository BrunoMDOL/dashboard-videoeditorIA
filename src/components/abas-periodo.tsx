import Link from "next/link";
import { PERIODOS, type PeriodoId } from "@/lib/periodos";

/** Abas de período como links, para o filtro ficar na URL e poder ser compartilhado. */
export function AbasPeriodo({
  atual,
  hrefPara,
}: {
  atual: PeriodoId;
  hrefPara: (periodo: PeriodoId) => string;
}) {
  return (
    <nav aria-label="Período" className="-mx-1 overflow-x-auto">
      <ul className="flex gap-1 px-1">
        {PERIODOS.map((p) => {
          const selecionado = p.id === atual;
          return (
            <li key={p.id}>
              <Link
                href={hrefPara(p.id)}
                scroll={false}
                aria-current={selecionado ? "true" : undefined}
                className={`block rounded-full border px-3 py-1.5 text-[13px] whitespace-nowrap transition-colors ${
                  selecionado
                    ? "border-linha-forte bg-elevado text-texto"
                    : "text-texto-2 hover:text-texto border-transparent"
                }`}
              >
                {p.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
