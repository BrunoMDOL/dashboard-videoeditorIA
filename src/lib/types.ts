// Modelo de domínio do dashboard. Os nomes seguem o vocabulário combinado com o
// marketing: um Reel tem uma Análise de edição, que tem Planos e Etiquetas.

export type Origem = "proprio" | "referencia";

/** Estado da análise de edição feita pela IA. */
export type StatusAnalise =
  | "pendente" // ainda não analisado
  | "analisando"
  | "pronta"
  | "erro" // a IA falhou; pode reanalisar
  | "sem_video"; // a API não entregou o .mp4; precisa de upload manual

export type Etiquetas = {
  gancho:
    | "pergunta"
    | "choque_visual"
    | "antes_depois"
    | "fala_direta"
    | "texto_na_tela"
    | "demonstracao"
    | "outro";
  ritmo: "lento" | "medio" | "rapido";
  legenda: "palavra_a_palavra" | "frase" | "sem_legenda";
  transicao: "corte_seco" | "whip" | "zoom" | "mista";
  trilha: "energetica" | "calma" | "tendencia" | "sem_trilha" | "nao_avaliado";
  /** null = não avaliado */
  locucao: boolean | null;
  zoom: boolean;
};

/** Um plano da linha do tempo, entre dois cortes. Tempos em segundos. */
export type Plano = { inicio: number; fim: number; descricao: string };

export type Analise = {
  resumo: string;
  linhaDoTempo: Plano[];
  gancho: string;
  cortesRitmo: string;
  legendas: string;
  textosNaTela: string;
  movimento: string;
  transicoesEfeitos: string;
  cor: string;
  audio: string;
  formatoTecnico: string;
  etiquetas: Etiquetas;
  modelo: string;
  geradaEm: string;
};

export type Metricas = {
  curtidas: number;
  comentarios: number;
  // Chegam na Fase 2, com o token próprio da Meta.
  visualizacoes?: number;
  alcance?: number;
  salvamentos?: number;
  compartilhamentos?: number;
};

export type Reel = {
  id: string;
  origem: Origem;
  permalink: string | null;
  legenda: string;
  publicadoEm: string;
  duracaoS: number;
  capaUrl: string | null;
  status: StatusAnalise;
  metricas: Metricas | null;
  /** Score de desempenho calculado por código (Fase 2). */
  score?: number | null;
  analise: Analise | null;
};
