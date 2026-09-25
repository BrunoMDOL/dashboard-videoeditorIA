import Image from "next/image";
import { FormularioEntrar } from "./formulario";

export const metadata = { title: "Entrar | Besser Home" };

export default async function Entrar({ searchParams }: PageProps<"/entrar">) {
  const { voltar } = await searchParams;
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <Image
          src="/brand/besser-home.png"
          alt="Besser Home"
          width={1920}
          height={135}
          priority
          className="h-auto w-44"
        />
        <div>
          <h1 className="text-[26px] leading-tight font-semibold">Entrar</h1>
          <p className="text-texto-2 mt-1 text-[15px] leading-relaxed">
            Acesso restrito ao time de marketing. Se você não tem senha, peça ao responsável pelo dashboard.
          </p>
        </div>
        <FormularioEntrar voltar={typeof voltar === "string" ? voltar : "/"} />
      </div>
    </main>
  );
}
