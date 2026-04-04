"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterValues } from "@/lib/validations/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CoachRegisterPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: RegisterValues) {
    setIsLoading(true);
    setError("");

    const { error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.full_name,
          role: "coach",
        },
      },
    });

    if (signUpError) {
      setError(
        signUpError.message.includes("already registered")
          ? "E-mail já cadastrado"
          : signUpError.message
      );
      setIsLoading(false);
      return;
    }

    router.push("/coach");
  }

  return (
    <AuthCard
      title="Criar conta de Treinador"
      subtitle="Área exclusiva do Treinador"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Seu nome"
                    className="border-line-default bg-bg-elevated text-content-primary placeholder:text-content-tertiary"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    className="border-line-default bg-bg-elevated text-content-primary placeholder:text-content-tertiary"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    className="border-line-default bg-bg-elevated text-content-primary placeholder:text-content-tertiary"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar senha</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Repita a senha"
                    className="border-line-default bg-bg-elevated text-content-primary placeholder:text-content-tertiary"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <p className="text-sm text-state-error">{error}</p>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full rounded-input bg-brand-red text-white font-semibold hover:bg-brand-red-dark transition-colors duration-200"
          >
            {isLoading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>
      </Form>

      <p className="mt-4 text-center text-sm text-content-secondary">
        Já tenho conta.{" "}
        <Link href="/coach/login" className="text-brand-red hover:underline">
          Entrar.
        </Link>
      </p>
    </AuthCard>
  );
}
