import { FormularioReferencia } from "./formulario";

export const metadata = { title: "Enviar referência | Besser Home" };

export default function EnviarReferencia() {
  return (
    <div className="flex flex-col gap-7">
      <header>
        <h1 className="text-[28px] leading-tight font-semibold">Enviar referência</h1>
        <p className="text-texto-2 mt-1 max-w-[60ch] text-[15px] leading-relaxed">
          Um Reel de outra conta com uma edição que vale estudar. A IA assiste o vídeo e escreve a análise no
          mesmo formato dos nossos Reels.
        </p>
      </header>
      <FormularioReferencia envioAtivo={false} />
    </div>
  );
}
