import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { chavePublica, urlDoSupabase } from "./config";

const ROTAS_ABERTAS = ["/entrar"];

/**
 * Renova a sessão a cada requisição e manda quem não está logado para /entrar.
 * É uma checagem otimista: quem decide o que cada usuário vê é o RLS do banco.
 */
export async function atualizarSessao(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(urlDoSupabase(), chavePublica(), {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (lista) => {
        for (const { name, value } of lista) request.cookies.set(name, value);
        resposta = NextResponse.next({ request });
        for (const { name, value, options } of lista) resposta.cookies.set(name, value, options);
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const logado = Boolean(data?.claims);
  const aberta = ROTAS_ABERTAS.some((r) => request.nextUrl.pathname.startsWith(r));

  if (!logado && !aberta) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/entrar";
    destino.search = "";
    if (request.nextUrl.pathname !== "/") {
      destino.searchParams.set("voltar", request.nextUrl.pathname + request.nextUrl.search);
    }
    return NextResponse.redirect(destino);
  }

  if (logado && aberta) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return resposta;
}
