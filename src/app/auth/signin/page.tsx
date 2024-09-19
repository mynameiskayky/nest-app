"use client";

import Image from "next/image";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";

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
            <h2 className="text-4xl font-extrabold mb-2">
              Bem-vindo ao DTMoney
            </h2>
            <p className="text-xl text-gray-400">Acesse sua conta agora</p>
          </div>

          <form onSubmit={handleMagicLinkLogin} className="space-y-6">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Endereço de e-mail"
              className="bg-[#2C2C2E] border-[#323238] text-[#F5F5F7] placeholder-[#7C7C8A] h-12"
              required
            />
            <Button
              type="submit"
              className="w-full bg-[#00875F] hover:bg-[#015F43] text-white h-12 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Enviando..." : "Enviar link de acesso"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#1C1C1E] text-gray-400">
                Ou continue com
              </span>
            </div>
          </div>

          <Button
            onClick={handleGoogleLogin}
            className="w-full bg-white text-black h-12 text-lg font-semibold flex items-center justify-center"
            disabled={isLoading}
          >
            <Image
              src="/google-logo.png"
              alt="Google"
              width={20}
              height={20}
              className="mr-2"
            />
            Google
          </Button>

          <p className="text-xs text-[#7C7C8A] text-center mt-8">
            Ao fazer login, você concorda com os{" "}
            <a href="#" className="text-[#00875F] hover:underline">
              Termos de Serviço
            </a>
            ,{" "}
            <a href="#" className="text-[#00875F] hover:underline">
              Política de Privacidade
            </a>{" "}
            e{" "}
            <a href="#" className="text-[#00875F] hover:underline">
              Práticas de Uso de Dados
            </a>{" "}
            do DTMoney.
          </p>
        </div>
      </div>
    </div>
  );
}
