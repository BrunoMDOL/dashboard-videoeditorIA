import type { Analise, Etiquetas, Reel } from "./types";
import { duracao, minutagem, tituloDoReel } from "./formato";

/** Seções da análise, na ordem em que aparecem na tela e no texto copiado. */
export const SECOES = [
  { chave: "gancho", titulo: "Gancho" },
  { chave: "cortesRitmo", titulo: "Cortes e ritmo" },
  { chave: "legendas", titulo: "Legendas" },
  { chave: "textosNaTela", titulo: "Textos na tela e gráficos" },
  { chave: "movimento", titulo: "Movimento" },
  { chave: "transicoesEfeitos", titulo: "Transições e efeitos" },
  { chave: "cor", titulo: "Cor" },
  { chave: "audio", titulo: "Áudio" },
  { chave: "formatoTecnico", titulo: "Formato técnico" },
] as const satisfies ReadonlyArray<{ chave: keyof Analise; titulo: string }>;

const ROTULOS: { [K in keyof Etiquetas]: Record<string, string> } = {
  gancho: {
    pergunta: "Gancho: pergunta",
    choque_visual: "Gancho: choque visual",
    antes_depois: "Gancho: antes e depois",
    fala_direta: "Gancho: fala direta",
    texto_na_tela: "Gancho: texto na tela",
    demonstracao: "Gancho: demonstração",
    outro: "Gancho: outro",
  },
  ritmo: { lento: "Ritmo lento", medio: "Ritmo médio", rapido: "Ritmo rápido" },
  legenda: {
    palavra_a_palavra: "Legenda palavra a palavra",
    frase: "Legenda por frase",
    sem_legenda: "Sem legenda",
  },
  transicao: {
    corte_seco: "Corte seco",
    whip: "Whip pan",
    zoom: "Transição com zoom",
    mista: "Transições mistas",
  },
  trilha: {
    energetica: "Trilha energética",
    calma: "Trilha calma",
    tendencia: "Áudio em alta",
    sem_trilha: "Sem trilha",
    nao_avaliado: "Trilha não avaliada",
  },
  locucao: { true: "Com locução", false: "Sem locução" },
  zoom: { true: "Com punch-in", false: "Sem zoom" },
};

export function rotulosDasEtiquetas(e: Etiquetas): string[] {
  return (Object.keys(ROTULOS) as (keyof Etiquetas)[])
    .filter((k) => e[k] !== null)
    .map((k) => ROTULOS[k][String(e[k])]);
}

/**
 * Texto que vai para a área de transferência. É o que o Hudson cola no
 * ChatGPT (modo Work) para replicar a edição num material novo no Premiere.
 */
export function textoParaCopiar(reel: Reel & { analise: Analise }): string {
  const a = reel.analise;
  const linhas: string[] = [
    `Análise de edição: ${tituloDoReel(reel.legenda)}`,
    reel.permalink ? `Reel de referência: ${reel.permalink}` : "",
    duracao(reel.duracaoS) ? `Duração: ${duracao(reel.duracaoS)}` : "",
    "",
    "Use esta análise para editar os clipes do projeto aberto no Adobe Premiere Pro, replicando o mesmo estilo de edição. Os nomes de efeitos e painéis estão em inglês, como no Premiere.",
    "",
    "RESUMO",
    a.resumo,
    "",
    "LINHA DO TEMPO",
    ...a.linhaDoTempo.map((p, i) => `${i + 1}. ${minutagem(p.inicio)} a ${minutagem(p.fim)}: ${p.descricao}`),
  ];
  for (const s of SECOES) {
    linhas.push("", s.titulo.toUpperCase(), a[s.chave]);
  }
  return linhas
    .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
    .join("\n")
    .trim();
}
