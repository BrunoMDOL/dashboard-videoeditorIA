import Image from "next/image";
import { ArrowUpRight, VideoOff } from "lucide-react";
import type { Reel } from "@/lib/types";
import { tituloDoReel } from "@/lib/formato";

/** Capa 9:16. Clicar abre o Reel no Instagram, em outra aba. */
export function CapaDoReel({
  reel,
  tamanho = "(min-width: 1024px) 220px, 45vw",
  prioridade = false,
  className = "",
}: {
  reel: Reel;
  tamanho?: string;
  prioridade?: boolean;
  className?: string;
}) {
  const titulo = tituloDoReel(reel.legenda);
  const imagem = reel.capaUrl ? (
    <Image
      src={reel.capaUrl}
      alt=""
      fill
      sizes={tamanho}
      priority={prioridade}
      className="object-cover"
    />
  ) : (
    <span className="text-texto-3 flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-[13px]">
      <VideoOff size={20} aria-hidden />
      Sem vídeo na API
    </span>
  );

  const base = `bg-elevado relative block aspect-[9/16] overflow-hidden rounded-[10px] ${className}`;

  if (!reel.permalink) return <div className={base}>{imagem}</div>;

  return (
    <a
      href={reel.permalink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Abrir no Instagram: ${titulo}`}
      className={`group ${base}`}
    >
      {imagem}
      <span className="bg-fundo/90 text-texto absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        Instagram
        <ArrowUpRight size={13} aria-hidden />
      </span>
    </a>
  );
}
