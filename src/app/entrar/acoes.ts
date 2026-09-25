"use server";

import { redirect } from "next/navigation";
import { clienteServidor } from "@/lib/supabase/servidor";

export type EstadoEntrar = { erro: string; email: string };

/** Só aceita caminhos internos, para o "voltar" não virar redirecionamento aberto. */
function destinoSeguro(valor: FormDataEntryValue | null): string {
  const caminho = typeof valor === "string" ? valor : "";
  return caminho.startsWith("/") && !caminho.startsWith("//") ? caminho : "/";
}

export async function entrar(_: EstadoEntrar, dados: FormData): Promise<EstadoEntrar> {
  const email = String(dados.get("email") ?? "")
    .trim()
    .toLowerCase();
  const senha = String(dados.get("senha") ?? "");

  if (!email || !senha) {
    return { erro: "Preencha o e-mail e a senha.", email };
  }

  const supabase = await clienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    return {
      erro:
        error.code === "invalid_credentials"
          ? "E-mail ou senha incorretos. Confira e tente de novo."
          : "Não foi possível entrar agora. Tente de novo em alguns minutos.",
      email,
    };
  }

  redirect(destinoSeguro(dados.get("voltar")));
}

export async function sair() {
  const supabase = await clienteServidor();
  await supabase.auth.signOut();
  redirect("/entrar");
}
