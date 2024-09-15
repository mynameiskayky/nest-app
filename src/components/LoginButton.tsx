import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        <span>Olá, {session?.user?.name}</span>
        <Button onClick={() => signOut()}>Sair</Button>
      </>
    );
  }
  return <Button onClick={() => signIn()}>Entrar</Button>;
}
