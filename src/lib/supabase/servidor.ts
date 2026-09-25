import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { chavePublica, urlDoSupabase } from "./config";

/** Cliente do Supabase para Server Components e Server Actions. Um por requisição. */
export async function clienteServidor() {
  const loja = await cookies();
  return createServerClient(urlDoSupabase(), chavePublica(), {
    cookies: {
      getAll: () => loja.getAll(),
      setAll: (lista) => {
        try {
          for (const { name, value, options } of lista) loja.set(name, value, options);
        } catch {
          // Server Components não podem gravar cookies; o proxy renova a sessão.
        }
      },
    },
  });
}
