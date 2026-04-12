"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { getDashboardMetrics, getAthletes } from "@/app/actions/athletes";
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

export default function CoachLoginPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();

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

    if (profile?.role !== "coach") {
      await supabase.auth.signOut();
      setError("Esta área é exclusiva para treinadores");
      setIsLoading(false);
      return;
    }

    // Prefetch dashboard data before navigating
    const userId = data.user.id;
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ["dashboard-metrics", userId],
        queryFn: () => getDashboardMetrics(userId),
      }),
      queryClient.prefetchQuery({
        queryKey: ["coach-athletes", userId],
        queryFn: () => getAthletes(userId),
      }),
    ]);

    router.push("/coach");
  }

  return (
    <AuthCard
      title="Entrar como Treinador"
      subtitle="Área exclusiva do Treinador"
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
        Primeiro acesso?{" "}
        <Link href="/coach/register" className="text-brand-red hover:underline">
          Registre-se
        </Link>
      </p>
    </AuthCard>
  );
}
