import { MenuLateral } from "@/components/menu-lateral";
import { fonteDosDados } from "@/lib/dados";

export default function PainelLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="lg:flex">
      <MenuLateral fonteDosDados={fonteDosDados()} />
      <main className="min-w-0 flex-1 px-4 pt-6 pb-16 sm:px-6 lg:px-10 lg:pt-9">
        <div className="mx-auto max-w-[1280px]">{children}</div>
      </main>
    </div>
  );
}
