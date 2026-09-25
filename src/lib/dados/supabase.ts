import "server-only";
import { intervaloDoPeriodo } from "../periodos";
import type { Analise, Etiquetas, Reel } from "../types";
import { clienteServidor } from "../supabase/servidor";
import { urlDaCapa } from "../supabase/config";
import type { FonteDeDados } from "./fonte";

type LinhaAnalise = {
  conteudo: Omit<Analise, "etiquetas" | "modelo" | "geradaEm">;
  tipo_gancho: Etiquetas["gancho"];
  ritmo: Etiquetas["ritmo"];
  estilo_legenda: Etiquetas["legenda"];
  tipo_transicao: Etiquetas["transicao"];
  tipo_trilha: Etiquetas["trilha"];
  tem_locucao: boolean | null;
  tem_zoom: boolean;
  modelo: string;
  gerada_em: string;
};

type LinhaReel = {
  id: number;
  origem: Reel["origem"];
  permalink: string | null;
  legenda: string;
  publicado_em: string | null;
  criado_em: string;
  duracao_s: number | null;
  capa_path: string | null;
  status: Reel["status"];
  curtidas: number | null;
  comentarios: number | null;
  // Relação 1:1 (reel_id é a chave primária de analises).
  analises: LinhaAnalise | LinhaAnalise[] | null;
};

const COLUNAS =
  "id, origem, permalink, legenda, publicado_em, criado_em, duracao_s, capa_path, status, curtidas, comentarios, " +
  "analises (conteudo, tipo_gancho, ritmo, estilo_legenda, tipo_transicao, tipo_trilha, tem_locucao, tem_zoom, modelo, gerada_em)";

function paraReel(l: LinhaReel): Reel {
  const a = Array.isArray(l.analises) ? l.analises[0] : l.analises;
  return {
    id: String(l.id),
    origem: l.origem,
    permalink: l.permalink,
    legenda: l.legenda,
    // Referências podem não ter data de publicação; usamos a data de envio.
    publicadoEm: l.publicado_em ?? l.criado_em,
    duracaoS: Math.round(l.duracao_s ?? 0),
    capaUrl: l.capa_path ? urlDaCapa(l.capa_path) : null,
    status: l.status,
    metricas:
      l.curtidas === null && l.comentarios === null
        ? null
        : { curtidas: l.curtidas ?? 0, comentarios: l.comentarios ?? 0 },
    analise: a
      ? {
          ...a.conteudo,
          etiquetas: {
            gancho: a.tipo_gancho,
            ritmo: a.ritmo,
            legenda: a.estilo_legenda,
            transicao: a.tipo_transicao,
            trilha: a.tipo_trilha,
            locucao: a.tem_locucao,
            zoom: a.tem_zoom,
          },
          modelo: a.modelo,
          geradaEm: a.gerada_em,
        }
      : null,
  };
}

async function tabela() {
  return (await clienteServidor()).schema("videos").from("reels");
}

export const fonteSupabase: FonteDeDados = {
  agora: () => Date.now(),

  descricao: () => "Sincronizado com o Instagram a cada 30 minutos.",

  // O score chega com as métricas da Fase 2.
  criterioDeDesempenho: async () => "curtidas",

  async listarReels(filtro) {
    let q = (await tabela()).select(COLUNAS, { count: "exact" });
    if (filtro.origem) q = q.eq("origem", filtro.origem);
    if (filtro.atencao) q = q.in("status", ["sem_video", "erro"]);
    if (filtro.periodo) {
      const { inicio, fim } = intervaloDoPeriodo(filtro.periodo, Date.now());
      if (inicio !== null) q = q.gte("publicado_em", new Date(inicio).toISOString());
      if (fim !== null) q = q.lt("publicado_em", new Date(fim).toISOString());
    }
    const busca = filtro.busca?.trim();
    if (busca) q = q.ilike("legenda", `%${busca.replace(/[%_\\]/g, (c) => `\\${c}`)}%`);
    q =
      filtro.ordem === "desempenho"
        ? q
            .order("curtidas", { ascending: false, nullsFirst: false })
            .order("publicado_em", { ascending: false })
        : q.order("publicado_em", { ascending: false, nullsFirst: false });
    if (filtro.limite) q = q.range(0, filtro.limite - 1);

    const { data, count, error } = await q.overrideTypes<LinhaReel[], { merge: false }>();
    if (error) throw new Error(`Falha ao listar Reels: ${error.message}`);
    return { itens: data.map(paraReel), total: count ?? data.length };
  },

  async buscarReel(id) {
    if (!/^\d+$/.test(id)) return null;
    const { data, error } = await (
      await tabela()
    )
      .select(COLUNAS)
      .eq("id", Number(id))
      .maybeSingle()
      .overrideTypes<LinhaReel | null, { merge: false }>();
    if (error) throw new Error(`Falha ao buscar o Reel ${id}: ${error.message}`);
    return data ? paraReel(data) : null;
  },

  async contagens(periodo) {
    const { inicio, fim } = intervaloDoPeriodo(periodo, Date.now());
    let q = (await tabela()).select("status").eq("origem", "proprio");
    if (inicio !== null) q = q.gte("publicado_em", new Date(inicio).toISOString());
    if (fim !== null) q = q.lt("publicado_em", new Date(fim).toISOString());
    const { data, error } = await q.overrideTypes<{ status: Reel["status"] }[], { merge: false }>();
    if (error) throw new Error(`Falha ao contar Reels: ${error.message}`);
    return {
      publicados: data.length,
      analisados: data.filter((r) => r.status === "pronta").length,
      aguardando: data.filter((r) => r.status === "pendente" || r.status === "analisando").length,
      atencao: data.filter((r) => r.status === "sem_video" || r.status === "erro").length,
    };
  },
};
