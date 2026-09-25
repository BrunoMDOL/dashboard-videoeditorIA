const FUSO = "America/Sao_Paulo";

const dataCurta = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
  timeZone: FUSO,
});
const dataHora = new Intl.DateTimeFormat("pt-BR", {
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

export function formatarData(iso: string): string {
  return dataCurta.format(new Date(iso)).replace(".", "");
}

export function formatarDataHora(iso: string): string {
  return dataHora.format(new Date(iso)).replace(".", "");
}

export function formatarNumero(n: number): string {
  return n >= 10_000 ? compacto.format(n) : numero.format(n);
}

/** Tempo relativo curto: "há 3 h", "há 2 dias". */
export function haQuanto(iso: string, agora: number = Date.now()): string {
  const min = Math.round((agora - Date.parse(iso)) / 60_000);
  if (min < 60) return `há ${Math.max(min, 1)} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? "ontem" : `há ${d} dias`;
}

/** Minutagem no estilo do Premiere, sem frames: 0:03,5 */
export function minutagem(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos - m * 60;
  const [inteiro, decimal] = s.toFixed(1).split(".");
  return `${m}:${inteiro.padStart(2, "0")},${decimal}`;
}

export function duracao(segundos: number): string {
  return segundos < 60 ? `${segundos} s` : `${Math.floor(segundos / 60)} min ${segundos % 60} s`;
}

/**
 * O Instagram não tem título; usamos a primeira frase útil da legenda,
 * sem hashtags nem menções.
 */
export function tituloDoReel(legenda: string): string {
  const linha =
    legenda
      .split("\n")
      .map((l) => l.replace(/[#@][\p{L}\p{N}_.]+/gu, "").trim())
      .find((l) => l.length > 0) ?? "";
  if (!linha) return "Reel sem legenda";
  return linha.length > 90 ? `${linha.slice(0, 87).trimEnd()}…` : linha;
}
