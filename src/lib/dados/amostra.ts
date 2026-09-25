// Amostra real dos Reels coletada da API da Meta em 25/09/2026, com três
// análises de exemplo. Serve para a prévia enquanto a sincronização não roda.
import amostra from "./mock/reels.json";
import { dentroDoPeriodo } from "../periodos";
import type { Reel } from "../types";
import { precisaDeAtencao, type FonteDeDados } from "./fonte";

const REELS = amostra as Reel[];

// Momento da coleta. Os filtros de período usam este instante como "agora"
// para a prévia não esvaziar com o passar dos dias.
const COLETADO_EM = Date.parse("2026-09-25T12:00:00-03:00");

const desempenho = (r: Reel) => r.score ?? r.metricas?.curtidas ?? -1;

export const fonteAmostra: FonteDeDados = {
  agora: () => COLETADO_EM,

  descricao: () =>
    "Prévia com Reels reais coletados em 25 set. A sincronização automática entra com o token da Meta.",

  criterioDeDesempenho: async () => (REELS.some((r) => typeof r.score === "number") ? "score" : "curtidas"),

  async listarReels(filtro) {
    const busca = filtro.busca?.trim().toLocaleLowerCase("pt-BR");
    const lista = REELS.filter(
      (r) =>
        (!filtro.origem || r.origem === filtro.origem) &&
        (!filtro.periodo || dentroDoPeriodo(r.publicadoEm, filtro.periodo, COLETADO_EM)) &&
        (!filtro.atencao || precisaDeAtencao(r)) &&
        (!busca || r.legenda.toLocaleLowerCase("pt-BR").includes(busca)),
    ).sort((a, b) =>
      filtro.ordem === "desempenho"
        ? desempenho(b) - desempenho(a)
        : Date.parse(b.publicadoEm) - Date.parse(a.publicadoEm),
    );
    return { itens: filtro.limite ? lista.slice(0, filtro.limite) : lista, total: lista.length };
  },

  async buscarReel(id) {
    return REELS.find((r) => r.id === id) ?? null;
  },

  async contagens(periodo) {
    const { itens } = await this.listarReels({ origem: "proprio", periodo });
    return {
      publicados: itens.length,
      analisados: itens.filter((r) => r.status === "pronta").length,
      aguardando: itens.filter((r) => r.status === "pendente" || r.status === "analisando").length,
      atencao: itens.filter(precisaDeAtencao).length,
    };
  },
};
