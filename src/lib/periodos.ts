// Filtros de período, sempre no horário de Brasília. O Brasil não tem horário
// de verão desde 2019, então o fuso é fixo em UTC-3.
const FUSO_MS = -3 * 60 * 60 * 1000;
const DIA_MS = 24 * 60 * 60 * 1000;

export const PERIODOS = [
  { id: "esta_semana", rotulo: "Esta semana", frase: "nesta semana" },
  { id: "semana_anterior", rotulo: "Semana anterior", frase: "na semana anterior" },
  { id: "7d", rotulo: "Últimos 7 dias", frase: "nos últimos 7 dias" },
  { id: "30d", rotulo: "Últimos 30 dias", frase: "nos últimos 30 dias" },
  { id: "este_mes", rotulo: "Este mês", frase: "neste mês" },
  { id: "mes_passado", rotulo: "Mês passado", frase: "no mês passado" },
  { id: "sempre", rotulo: "Desde sempre", frase: "desde sempre" },
] as const;

export type PeriodoId = (typeof PERIODOS)[number]["id"];

export function periodoValido(valor: string | undefined): PeriodoId | null {
  return PERIODOS.some((p) => p.id === valor) ? (valor as PeriodoId) : null;
}

export function rotuloPeriodo(id: PeriodoId): string {
  return PERIODOS.find((p) => p.id === id)!.rotulo;
}

/** Para usar no meio de uma frase: "Mais curtido nos últimos 7 dias". */
export function frasePeriodo(id: PeriodoId): string {
  return PERIODOS.find((p) => p.id === id)!.frase;
}

/** Meia-noite (horário de Brasília) do dia de `instante`, como instante UTC. */
function inicioDoDia(instante: number): number {
  const local = instante + FUSO_MS;
  return local - (((local % DIA_MS) + DIA_MS) % DIA_MS) - FUSO_MS;
}

/** Intervalo [inicio, fim) em ms UTC. `fim` null = até agora. */
export function intervaloDoPeriodo(
  id: PeriodoId,
  agora: number = Date.now(),
): { inicio: number | null; fim: number | null } {
  const hoje = inicioDoDia(agora);
  // getUTCDay sobre o horário local deslocado: 0 = domingo. Semana começa na segunda.
  const diaDaSemana = (new Date(agora + FUSO_MS).getUTCDay() + 6) % 7;
  const segunda = hoje - diaDaSemana * DIA_MS;

  const local = new Date(agora + FUSO_MS);
  const ano = local.getUTCFullYear();
  const mes = local.getUTCMonth();
  const inicioDoMes = (a: number, m: number) => Date.UTC(a, m, 1) - FUSO_MS;

  switch (id) {
    case "esta_semana":
      return { inicio: segunda, fim: null };
    case "semana_anterior":
      return { inicio: segunda - 7 * DIA_MS, fim: segunda };
    case "7d":
      return { inicio: agora - 7 * DIA_MS, fim: null };
    case "30d":
      return { inicio: agora - 30 * DIA_MS, fim: null };
    case "este_mes":
      return { inicio: inicioDoMes(ano, mes), fim: null };
    case "mes_passado":
      return { inicio: inicioDoMes(ano, mes - 1), fim: inicioDoMes(ano, mes) };
    case "sempre":
      return { inicio: null, fim: null };
  }
}

export function dentroDoPeriodo(iso: string, id: PeriodoId, agora?: number): boolean {
  const t = Date.parse(iso);
  const { inicio, fim } = intervaloDoPeriodo(id, agora);
  return (inicio === null || t >= inicio) && (fim === null || t < fim);
}
