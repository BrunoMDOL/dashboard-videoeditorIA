import type { NextRequest } from "next/server";
import { atualizarSessao } from "@/lib/supabase/sessao";

export function proxy(request: NextRequest) {
  return atualizarSessao(request);
}

export const config = {
  // Tudo menos arquivos estáticos e imagens otimizadas.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|mock/|.*\\.(?:png|jpg|jpeg|webp|svg)$).*)"],
};
