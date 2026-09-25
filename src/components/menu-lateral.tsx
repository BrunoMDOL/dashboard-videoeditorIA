"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, LayoutGrid, LogOut, Upload } from "lucide-react";
import { sair } from "@/app/entrar/acoes";

const ITENS = [
  { href: "/", rotulo: "Visão geral", Icone: LayoutGrid },
  { href: "/biblioteca", rotulo: "Biblioteca", Icone: Clapperboard },
  { href: "/referencias/nova", rotulo: "Enviar referência", Icone: Upload },
];

function ativo(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/biblioteca") return pathname.startsWith("/biblioteca") || pathname.startsWith("/videos");
  return pathname.startsWith(href);
}

export function MenuLateral({ fonteDosDados }: { fonteDosDados: string }) {
  const pathname = usePathname();

  return (
    <aside className="border-linha bg-fundo lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-60 lg:shrink-0 lg:flex-col lg:border-r">
      <div className="flex items-center justify-between gap-4 px-4 pt-5 pb-3 lg:block lg:px-6 lg:pt-7 lg:pb-8">
        <Link href="/" aria-label="Besser Home, visão geral">
          <Image
            src="/brand/besser-home.png"
            alt="Besser Home"
            width={1920}
            height={135}
            priority
            className="h-auto w-36"
          />
        </Link>
      </div>

      <nav aria-label="Principal" className="border-linha border-b px-2 lg:border-b-0 lg:px-3">
        <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:pb-0">
          {ITENS.map(({ href, rotulo, Icone }) => {
            const atual = ativo(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={atual ? "page" : undefined}
                  className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-[15px] whitespace-nowrap transition-colors ${
                    atual ? "bg-cartao text-texto" : "text-texto-2 hover:bg-cartao/60 hover:text-texto"
                  }`}
                >
                  {atual && (
                    <span
                      aria-hidden
                      className="bg-vermelho absolute right-3 bottom-0 left-3 h-0.5 rounded-full lg:top-2 lg:right-auto lg:bottom-2 lg:left-0 lg:h-auto lg:w-0.5"
                    />
                  )}
                  <Icone size={18} strokeWidth={1.75} aria-hidden className="hidden sm:block" />
                  {rotulo}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto hidden flex-col gap-4 px-6 pb-6 lg:flex">
        <p className="text-texto-3 text-[13px] leading-snug">{fonteDosDados}</p>
        <form action={sair}>
          <button
            type="submit"
            className="text-texto-2 hover:text-texto inline-flex items-center gap-2 text-[14px] transition-colors"
          >
            <LogOut size={16} aria-hidden />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
