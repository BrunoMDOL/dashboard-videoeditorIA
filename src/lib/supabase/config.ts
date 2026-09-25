export function urlDoSupabase(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Defina NEXT_PUBLIC_SUPABASE_URL nas variáveis de ambiente.");
  return url;
}

export function chavePublica(): string {
  const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!chave) throw new Error("Defina NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY nas variáveis de ambiente.");
  return chave;
}

/** URL pública de uma capa no bucket reels-capas. */
export function urlDaCapa(caminho: string): string {
  return `${urlDoSupabase()}/storage/v1/object/public/reels-capas/${caminho}`;
}
