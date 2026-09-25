import type { PeriodoId } from "../periodos";
import type { Origem, Reel } from "../types";

export type Ordem = "desempenho" | "recentes";

export type Filtro = {
  origem?: Origem;
  periodo?: PeriodoId;
  atencao?: boolean;
  busca?: string;
  ordem?: Ordem;
  limite?: number;
};

export type Contagens = {
  publicados: number;
  analisados: number;
  aguardando: number;
  atencao: number;
};

/**
 * O que as telas precisam saber sobre os dados. Há duas implementações:
 * a amostra coletada em 25/09 e o banco no Supabase.
 */
export interface FonteDeDados {
  /** Instante usado como "agora" nos filtros de período. */
  agora(): number;
  descricao(): string;
  criterioDeDesempenho(): Promise<"score" | "curtidas">;
  listarReels(filtro: Filtro): Promise<{ itens: Reel[]; total: number }>;
  buscarReel(id: string): Promise<Reel | null>;
  contagens(periodo: PeriodoId): Promise<Contagens>;
}

export function precisaDeAtencao(r: Reel): boolean {
  return r.status === "sem_video" || r.status === "erro";
}
