import { validateInvite } from "@/app/actions/invites";
import { InviteForm } from "./invite-form";
import { AuthCard } from "@/components/auth/AuthCard";
import Image from "next/image";
import Link from "next/link";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const invite = await validateInvite(token);

  if (!invite) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-bg-base px-4">
        <Image
          src="/brand/LOGO04_BRANCO.png"
          alt="Arthur Armelin Treinador"
          width={160}
          height={40}
          className="mb-8 h-auto w-auto max-w-[160px]"
        />
        <div className="rounded-card border border-line-subtle bg-bg-surface p-8 text-center max-w-[400px]">
          <div className="mb-4 text-4xl">😕</div>
          <h1 className="text-lg font-semibold text-content-primary">
            Link de convite inválido ou expirado
          </h1>
          <p className="mt-2 text-sm text-content-secondary">
            Entre em contato com o seu treinador para receber um novo link.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-sm text-brand-red hover:underline"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AuthCard
      title={`Você foi convidado pelo Treinador ${invite.coach_name}`}
      subtitle="Crie sua conta para começar seus treinos."
    >
      <InviteForm token={invite.token} coachId={invite.coach_id} prefilledEmail={invite.email} />
    </AuthCard>
  );
}
