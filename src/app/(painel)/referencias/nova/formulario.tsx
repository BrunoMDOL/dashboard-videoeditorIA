"use client";

import { useId, useState } from "react";
import { FileVideo, Upload } from "lucide-react";

// Limite prático: um Reel de 90 s em 1080p fica bem abaixo disso.
const LIMITE_MB = 200;

export function FormularioReferencia({ envioAtivo }: { envioAtivo: boolean }) {
  const idArquivo = useId();
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
      setErro(`O arquivo tem ${Math.round(f.size / 1024 / 1024)} MB. O limite é ${LIMITE_MB} MB.`);
      return;
    }
    setArquivo(f);
  }

  return (
    <form className="flex max-w-2xl flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col gap-2">
        <label htmlFor={idArquivo} className="text-[15px] font-medium">
          Vídeo do Reel
        </label>
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
          className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center transition-colors ${
            arrastando ? "border-vermelho bg-elevado" : "border-linha-forte bg-cartao hover:bg-elevado"
          }`}
        >
          {arquivo ? (
            <>
              <FileVideo size={26} className="text-texto-2" aria-hidden />
              <span className="text-[15px] font-medium">{arquivo.name}</span>
              <span className="text-texto-2 text-[13px]">
                {(arquivo.size / 1024 / 1024).toFixed(1)} MB. Clique para trocar.
              </span>
            </>
          ) : (
            <>
              <Upload size={26} className="text-texto-2" aria-hidden />
              <span className="text-[15px] font-medium">Arraste o .mp4 aqui ou clique para escolher</span>
              <span className="text-texto-2 text-[13px]">Até {LIMITE_MB} MB</span>
            </>
          )}
        </label>
        <input
          id={idArquivo}
          type="file"
          accept="video/mp4,.mp4"
          className="sr-only"
          onChange={(e) => escolher(e.target.files?.[0])}
        />
        {erro && (
          <p role="alert" className="text-vermelho-texto text-[14px]">
            {erro}
          </p>
        )}
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
          placeholder="https://www.instagram.com/reel/…"
          className="border-linha bg-cartao placeholder:text-texto-3 focus:border-linha-forte h-11 rounded-lg border px-3 text-[15px] outline-none"
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
          placeholder="Ex.: a legenda que aparece palavra por palavra no ritmo da música"
          className="border-linha bg-cartao placeholder:text-texto-3 focus:border-linha-forte rounded-lg border px-3 py-2.5 text-[15px] leading-relaxed outline-none"
        />
        <p className="text-texto-3 text-[13px]">A IA dá atenção especial a esse ponto na análise.</p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={!envioAtivo || !arquivo}
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
