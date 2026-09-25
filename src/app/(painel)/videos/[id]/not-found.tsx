import Link from "next/link";

export default function ReelNaoEncontrado() {
  return (
    <div className="flex max-w-xl flex-col gap-4 py-10">
      <h1 className="text-[24px] font-semibold">Reel não encontrado</h1>
      <p className="text-texto-2 text-[15px] leading-relaxed">
        Este link não corresponde a nenhum Reel da biblioteca. Ele pode ter sido apagado do Instagram.
      </p>
      <Link href="/biblioteca" className="text-vermelho-texto w-fit text-[15px] hover:underline">
        Voltar para a biblioteca
      </Link>
    </div>
  );
}
