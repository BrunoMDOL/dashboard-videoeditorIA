"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { FileVideo, Upload } from "lucide-react";

// Limite prático: um Reel de 90 s em 1080p fica bem abaixo disso.
const LIMITE_MB = 200;

const campo =
  "border-linha bg-cartao placeholder:text-texto-3 hover:border-linha-forte rounded-lg border px-3 text-[15px] transition-colors";

export function FormularioReferencia({ envioAtivo }: { envioAtivo: boolean }) {
  const idArquivo = useId();
  const idErro = useId();
  const entrada = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [erro, setErro] = useState("");
  const [arrastando, setArrastando] = useState(false);

  function escolher(f: File | undefined) {
    setErro("");
    if (!f) return;
    if (f.type !== "video/mp4" && !f.name.toLowerCase().endsWith(".mp4")) {
      setErro("Envie um arquivo .mp4. Outros formatos ainda não são aceitos.");
      return;
    }
    if (f.size > LIMITE_MB * 1024 * 1024) {
      setErro(`O arquivo tem ${Math.round(f.size / 1024 / 1024)} MB. Escolha um de até ${LIMITE_MB} MB.`);
      return;
    }
    setArquivo(f);
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!arquivo) {
      setErro("Escolha o .mp4 do Reel antes de enviar.");
      entrada.current?.focus();
    }
  }

  return (
    <form className="flex max-w-2xl flex-col gap-6" onSubmit={enviar} noValidate>
      <div className="flex flex-col gap-2">
        <span className="text-[15px] font-medium" id={`${idArquivo}-rotulo`}>
          Vídeo do Reel
        </span>
        {/* O input vem antes do rótulo para o rótulo mostrar o foco do teclado (peer). */}
        <input
          ref={entrada}
          id={idArquivo}
          name="video"
          type="file"
          accept="video/mp4,.mp4"
          aria-labelledby={`${idArquivo}-rotulo`}
          aria-describedby={erro ? idErro : undefined}
          aria-invalid={erro ? true : undefined}
          className="peer sr-only"
          onChange={(e) => escolher(e.target.files?.[0])}
        />
        <label
          htmlFor={idArquivo}
          onDragOver={(e) => {
            e.preventDefault();
            setArrastando(true);
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastando(false);
            escolher(e.dataTransfer.files[0]);
          }}
          className={`peer-focus-visible:outline-vermelho-texto flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 ${
            arrastando ? "border-vermelho bg-elevado" : "border-linha-forte bg-cartao hover:bg-elevado"
          }`}
        >
          {arquivo ? (
            <>
              <FileVideo size={26} className="text-texto-2" aria-hidden />
              <span className="text-[15px] font-medium break-all">{arquivo.name}</span>
              <span className="text-texto-2 text-[13px]">
                {(arquivo.size / 1024 / 1024).toFixed(1)}&nbsp;MB. Clique para trocar.
              </span>
            </>
          ) : (
            <>
              <Upload size={26} className="text-texto-2" aria-hidden />
              <span className="text-[15px] font-medium">Arraste o .mp4 aqui ou clique para escolher</span>
              <span className="text-texto-2 text-[13px]">Até {LIMITE_MB}&nbsp;MB</span>
            </>
          )}
        </label>
        <p id={idErro} role="alert" className="text-vermelho-texto min-h-5 text-[14px]">
          {erro}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="link" className="text-[15px] font-medium">
          Link do post <span className="text-texto-3 font-normal">(opcional)</span>
        </label>
        <input
          id="link"
          name="link"
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="https://www.instagram.com/reel/…"
          className={`${campo} h-11`}
        />
        <p className="text-texto-3 text-[13px]">Com o link, a capa do card abre o post original.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="nota" className="text-[15px] font-medium">
          O que chamou sua atenção <span className="text-texto-3 font-normal">(opcional)</span>
        </label>
        <textarea
          id="nota"
          name="nota"
          rows={3}
          autoComplete="off"
          placeholder="Ex.: a legenda que aparece palavra por palavra no ritmo da música…"
          className={`${campo} py-2.5 leading-relaxed`}
        />
        <p className="text-texto-3 text-[13px]">A IA dá atenção especial a esse ponto na análise.</p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={!envioAtivo}
          className="bg-vermelho-botao hover:bg-vermelho disabled:bg-elevado disabled:text-texto-3 h-11 w-fit rounded-lg px-5 text-[15px] font-semibold text-white transition-colors disabled:cursor-not-allowed"
        >
          Enviar e analisar
        </button>
        {!envioAtivo && (
          <p className="text-texto-2 text-[14px]">
            O envio passa a funcionar quando o banco de dados for ligado, na próxima etapa.
          </p>
        )}
      </div>
    </form>
  );
}
