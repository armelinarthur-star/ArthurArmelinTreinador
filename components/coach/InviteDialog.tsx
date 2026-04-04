"use client";

import { useState } from "react";
import { createInvite } from "@/app/actions/invites";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, Copy, Check } from "lucide-react";

interface InviteDialogProps {
  coachId: string;
  trigger?: React.ReactElement;
}

export function InviteDialog({ coachId, trigger }: InviteDialogProps) {
  const [email, setEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setIsLoading(true);
    try {
      const url = await createInvite(coachId, email || undefined);
      setInviteUrl(url);
    } catch {
      // handle error silently
    }
    setIsLoading(false);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          setEmail("");
          setInviteUrl("");
          setCopied(false);
        }
      }}
    >
      <DialogTrigger
        render={
          trigger ?? (
            <Button className="gap-2 rounded-input bg-brand-red text-white hover:bg-brand-red-dark">
              <UserPlus className="size-4" />
              Convidar Aluno
            </Button>
          )
        }
      />
      <DialogContent className="border-line-subtle bg-bg-surface text-content-primary sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-content-primary">
            Convidar Aluno
          </DialogTitle>
        </DialogHeader>

        {!inviteUrl ? (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm text-content-secondary">
                E-mail do aluno (opcional)
              </label>
              <Input
                type="email"
                placeholder="aluno@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-line-default bg-bg-elevated text-content-primary placeholder:text-content-tertiary"
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="h-11 w-full rounded-input bg-brand-red text-white font-semibold hover:bg-brand-red-dark"
            >
              {isLoading ? "Gerando..." : "Gerar Link de Convite"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm text-content-secondary">
                Link de convite
              </label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={inviteUrl}
                  className="border-line-default bg-bg-elevated text-content-primary text-xs"
                />
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="shrink-0 border-line-default text-content-primary hover:bg-bg-elevated"
                >
                  {copied ? (
                    <Check className="size-4 text-state-success" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="flex items-center gap-2 text-xs text-content-secondary">
              <span className="inline-block size-2 rounded-full bg-brand-red" />
              Link válido por 7 dias
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
