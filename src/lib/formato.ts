const FUSO = "America/Sao_Paulo";

const dataCurta = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
  timeZone: FUSO,
});
const partesDataHora = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: FUSO,
});
const numero = new Intl.NumberFormat("pt-BR");
const compacto = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** "22 set" */
export function formatarData(iso: string): string {
  return dataCurta.format(new Date(iso)).replace(".", "").replace(" de ", " ");
}

/** "22 set 2026, 07:00" */
export function formatarDataHora(iso: string): string {
  const p = Object.fromEntries(partesDataHora.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return `${p.day} ${p.month.replace(".", "")} ${p.year}, ${p.hour}:${p.minute}`;
}

export function formatarNumero(n: number): string {
  return n >= 10_000 ? compacto.format(n) : numero.format(n);
}

/** Minutagem no estilo do Premiere, sem frames: 0:03,5 */
export function minutagem(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos - m * 60;
  const [inteiro, decimal] = s.toFixed(1).split(".");
  return `${m}:${inteiro.padStart(2, "0")},${decimal}`;
}

/** null quando a duração é desconhecida (Reel sem vídeo na API). */
export function duracao(segundos: number): string | null {
  if (segundos <= 0) return null;
  // Espaço não separável entre número e unidade.
  return segundos < 60
    ? `${segundos}\u00A0s`
    : `${Math.floor(segundos / 60)}\u00A0min ${segundos % 60}\u00A0s`;
}

/**
 * O Instagram não tem título; usamos a primeira frase útil da legenda,
 * sem hashtags nem menções.
 */
export function tituloDoReel(legenda: string): string {
  const linha =
    legenda
      .split("\n")
      .map((l) =>
        l
          .replace(/[#@][\p{L}\p{N}_.]+/gu, "")
          .replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, "")
          .trim(),
      )
      .find((l) => l.length > 0) ?? "";
  if (!linha) return "Reel sem legenda";
  return linha.length > 90 ? `${linha.slice(0, 87).trimEnd()}…` : linha;
}
