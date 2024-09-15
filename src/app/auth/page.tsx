"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { Logo } from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.ok) {
        router.push("/");
      } else {
        toast({
          title: "Erro no login",
          description: "Verifique suas credenciais e tente novamente.",
          variant: "destructive",
        });
      }
    } else {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          setUserId(data.userId);
          setIsVerifying(true);
          toast({
            title: "Código de verificação enviado",
            description:
              "Um código de verificação foi enviado para o seu e-mail.",
            variant: "default",
          });
        } else {
          const errorData = await response.json();
          toast({
            title: "Erro no registro",
            description:
              errorData.message || "Ocorreu um erro ao tentar registrar.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erro ao registrar:", error);
        toast({
          title: "Erro no registro",
          description: "Ocorreu um erro ao tentar registrar. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });

      if (response.ok) {
        toast({
          title: "E-mail verificado",
          description: "E-mail verificado com sucesso. Redirecionando...",
          variant: "default",
        });
        await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        router.push("/");
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro na verificação",
          description: errorData.message || "Erro na verificação do OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao verificar OTP:", error);
      toast({
        title: "Erro na verificação",
        description: "Ocorreu um erro ao verificar o código. Tente novamente.",
        variant: "destructive",
      });
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
              {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
            </h2>
            <p className="text-xl text-gray-400">
              {isLogin
                ? "Acesse sua conta agora"
                : "Comece a controlar suas finanças"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && !isVerifying && (
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome completo"
                className="bg-[#2C2C2E] border-[#323238] text-[#F5F5F7] placeholder-[#7C7C8A] h-12"
                required={!isLogin}
              />
            )}
            {!isVerifying && (
              <>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Endereço de e-mail"
                  className="bg-[#2C2C2E] border-[#323238] text-[#F5F5F7] placeholder-[#7C7C8A] h-12"
                  required
                />
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha"
                    className="bg-[#2C2C2E] border-[#323238] text-[#F5F5F7] placeholder-[#7C7C8A] pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-[#7C7C8A]" />
                    ) : (
                      <Eye className="h-5 w-5 text-[#7C7C8A]" />
                    )}
                  </button>
                </div>
              </>
            )}
            {isVerifying && (
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Código de verificação"
                className="bg-[#2C2C2E] border-[#323238] text-[#F5F5F7] placeholder-[#7C7C8A] h-12"
                required
              />
            )}
            <Button
              type="submit"
              className="w-full bg-[#00875F] hover:bg-[#015F43] text-white h-12 text-lg font-semibold"
              onClick={isVerifying ? handleVerifyOtp : undefined}
            >
              {isLogin ? "Entrar" : isVerifying ? "Verificar" : "Criar conta"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <div className="text-center">
            <p className="text-gray-400">
              {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#00875F] hover:underline ml-2 font-semibold"
              >
                {isLogin ? "Cadastre-se" : "Faça login"}
              </button>
            </p>
          </div>

          {!isLogin && !isVerifying && (
            <p className="text-xs text-[#7C7C8A] text-center mt-8">
              Ao se cadastrar, você concorda com os{" "}
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
          )}
        </div>
      </div>
    </div>
  );
}
