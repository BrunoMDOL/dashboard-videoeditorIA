// Única porta de acesso aos dados. Hoje lê uma amostra real dos Reels
// (coletada da API da Meta em 25/09/2026); na próxima etapa passa a ler do
// Supabase sem que as telas precisem mudar.
import amostra from "./mock/reels.json";
import { dentroDoPeriodo, type PeriodoId } from "./periodos";
import type { Origem, Reel } from "./types";

const REELS = amostra as Reel[];

// Momento da coleta da amostra. Os filtros de período usam este instante como
// "agora" para a prévia não esvaziar com o passar dos dias.
const COLETADO_EM = Date.parse("2026-09-25T12:00:00-03:00");

export function agoraDosDados(): number {
  return COLETADO_EM;
}

export function fonteDosDados(): string {
  return "Prévia com Reels reais coletados em 25 set. A sincronização automática entra com o token da Meta.";
}

export type Ordem = "desempenho" | "recentes";

export type Filtro = {
  origem?: Origem;
  periodo?: PeriodoId;
  atencao?: boolean;
  busca?: string;
  ordem?: Ordem;
};

/** Enquanto o score não existe (Fase 2), o desempenho é medido pelas curtidas. */
export function criterioDeDesempenho(): "score" | "curtidas" {
  return REELS.some((r) => typeof r.score === "number") ? "score" : "curtidas";
}

function desempenho(r: Reel): number {
  return r.score ?? r.metricas?.curtidas ?? -1;
}

export function precisaDeAtencao(r: Reel): boolean {
  return r.status === "sem_video" || r.status === "erro";
}

export function listarReels(filtro: Filtro = {}): Reel[] {
  const busca = filtro.busca?.trim().toLocaleLowerCase("pt-BR");
  const lista = REELS.filter(
    (r) =>
      (!filtro.origem || r.origem === filtro.origem) &&
      (!filtro.periodo || dentroDoPeriodo(r.publicadoEm, filtro.periodo, COLETADO_EM)) &&
      (!filtro.atencao || precisaDeAtencao(r)) &&
      (!busca || r.legenda.toLocaleLowerCase("pt-BR").includes(busca)),
  );
  return lista.sort((a, b) =>
    filtro.ordem === "desempenho"
      ? desempenho(b) - desempenho(a)
      : Date.parse(b.publicadoEm) - Date.parse(a.publicadoEm),
  );
}

export function buscarReel(id: string): Reel | null {
  return REELS.find((r) => r.id === id) ?? null;
}

/** Destaque: o Reel próprio de melhor desempenho no período. */
export function destaque(periodo: PeriodoId): Reel | null {
  return listarReels({ origem: "proprio", periodo, ordem: "desempenho" })[0] ?? null;
}

export function contagens(periodo: PeriodoId) {
  const doPeriodo = listarReels({ origem: "proprio", periodo });
  return {
    publicados: doPeriodo.length,
    analisados: doPeriodo.filter((r) => r.status === "pronta").length,
    aguardando: doPeriodo.filter((r) => r.status === "pendente" || r.status === "analisando").length,
    atencao: doPeriodo.filter(precisaDeAtencao).length,
  };
}
