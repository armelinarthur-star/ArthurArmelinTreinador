"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";
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

export default function AthleteLoginPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setIsLoading(true);
    setError("");

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (signInError) {
      setError("E-mail ou senha incorretos");
      setIsLoading(false);
      return;
    }

    // Verify role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role !== "athlete") {
      await supabase.auth.signOut();
      setError("Esta área é exclusiva para alunos(as)");
      setIsLoading(false);
      return;
    }

    router.push("/athlete");
  }

  return (
    <AuthCard
      title="Bom ver você aqui."
      subtitle="Continue sua jornada com o Arthur Armelin."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    placeholder="Sua senha"
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
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </Form>

      <p className="mt-4 text-center text-sm text-content-secondary">
        Não tem acesso?{" "}
        <span className="text-content-primary">Fale com o Treinador</span>
      </p>
    </AuthCard>
  );
}
