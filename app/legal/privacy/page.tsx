import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center bg-bg-base px-6 py-12">
      <div className="w-full max-w-lg">
        <h1 className="mb-6 font-display text-3xl text-content-primary">
          Termos e Privacidade
        </h1>

        <div className="space-y-4 text-sm leading-relaxed text-content-secondary">
          <p>
            O aplicativo Arthur Armelin Treinador coleta e armazena dados
            pessoais e de saude fornecidos pelo usuario durante o cadastro e
            uso da plataforma, com o unico objetivo de personalizar o
            acompanhamento esportivo.
          </p>
          <p>
            Seus dados nunca serao compartilhados com terceiros sem seu
            consentimento explicito. Todas as informacoes sao armazenadas
            com criptografia em servidores seguros.
          </p>
          <p>
            Para duvidas ou solicitacoes sobre seus dados, entre em contato
            pelo e-mail{" "}
            <a
              href="mailto:contato@arthurarmelim.com.br"
              className="text-brand-red underline"
            >
              contato@arthurarmelim.com.br
            </a>
            .
          </p>
        </div>

        <Link
          href="/athlete/profile"
          className="mt-8 inline-block text-sm text-content-secondary underline transition-colors hover:text-content-primary"
        >
          Voltar ao perfil
        </Link>
      </div>
    </div>
  );
}
