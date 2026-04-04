import Image from "next/image";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <Image
        src="/brand/LOGO04_BRANCO.png"
        alt="Arthur Armelin"
        width={120}
        height={30}
        className="mb-4 h-auto w-auto max-w-[120px] opacity-40"
      />
      <h1 className="text-lg font-semibold text-content-primary">{title}</h1>
      <p className="text-sm text-content-secondary">Em construção</p>
      <div className="h-[2px] w-8 bg-brand-red opacity-50" />
    </div>
  );
}
