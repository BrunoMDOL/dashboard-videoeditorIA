// Única porta de acesso aos dados para as telas. A fonte é escolhida pela
// variável FONTE_DADOS: "supabase" lê do banco; qualquer outro valor usa a
// amostra de 25/09, útil enquanto a sincronização com o Instagram não roda.
import "server-only";
import { fonteAmostra } from "./amostra";
import { fonteSupabase } from "./supabase";
import type { FonteDeDados } from "./fonte";

export type { Contagens, Filtro, Ordem } from "./fonte";
export { precisaDeAtencao } from "./fonte";

export function dados(): FonteDeDados {
  return process.env.FONTE_DADOS === "supabase" ? fonteSupabase : fonteAmostra;
}
