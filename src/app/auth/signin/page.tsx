"use client";

import Image from "next/image";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import Google from "@/components/icons/google";

export default function AuthPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.ok) {
        toast({
          title: "Link de acesso enviado",
          description: "Verifique seu e-mail para fazer login.",
          variant: "default",
        });
      } else {
        throw new Error("Falha ao enviar o link de acesso");
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao tentar enviar o link de acesso.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao tentar fazer login com o Google.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] text-[#F5F5F7]">
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="relative w-full max-w-md">
          <Image
            src="/background.jpeg"
            alt="Banner Register"
            className="rounded-2xl shadow-2xl"
            width={600}
            height={600}
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-black opacity-40 rounded-2xl"></div>
          <Logo className="absolute top-6 left-6 z-10" />
        </div>
      </div>

      <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center items-center">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold mb-2">Entrar no Finnest</h2>
            <p className="text-xl text-gray-400">Gerencie suas finanças</p>
          </div>

          <form onSubmit={handleMagicLinkLogin} className="space-y-6">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              className="bg-[#2C2C2E] border-[#323238] text-[#F5F5F7] placeholder-[#7C7C8A] h-12"
              required
            />
            <Button
              type="submit"
              className="w-full bg-[#00875F] hover:bg-[#015F43] text-white h-12 text-sm font-semibold flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin border-2 border-t-transparent border-white rounded-full" />
              ) : (
                <>
                  Entrar com e-mail
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="flex justify-between items-center">
            <div className="w-full h-[1px] bg-gray-600"></div>
            <span className="px-2 text-gray-400 text-sm">ou</span>
            <div className="w-full h-[1px] bg-gray-600"></div>
          </div>

          <Button
            onClick={handleGoogleLogin}
            className="w-full bg-white text-black h-12 text-sm font-semibold flex items-center justify-center"
            disabled={isLoading}
          >
            <Google className="mr-2" />
            Entrar com Google
          </Button>

          <p className="text-xs text-[#7C7C8A] text-center mt-8">
            Ao entrar, você concorda com nossos{" "}
            <a href="#" className="text-[#00875F] hover:underline">
              Termos
            </a>
            ,{" "}
            <a href="#" className="text-[#00875F] hover:underline">
              Privacidade
            </a>{" "}
            e{" "}
            <a href="#" className="text-[#00875F] hover:underline">
              Uso de Dados
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
