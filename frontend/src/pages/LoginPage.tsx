import { useState } from "react";
import { Boxes, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/50 to-primary/10 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-xl shadow-black/5">
        <div className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Boxes className="size-8" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            CleanStock
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Gestão inteligente de estoque
          </p>
        </div>

        <div className="space-y-2 text-center">
          <h2 className="text-xl font-semibold">Bem-vindo de volta!</h2>

          <p className="text-sm text-muted-foreground">
            Entre com seus dados para acessar o sistema.
          </p>

          <form className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>

              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pr-10"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm font-medium text-primary hover:underline"
                onClick={() =>
                  alert("A recuperação de senha será implementada futuramente.")
                }
              >
                Esqueci minha senha
              </button>
            </div>

            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </div>
      </div>
      <p className="absolute bottom-5 text-center text-xs text-muted-foreground">
        CleanStock © 2026 · Gestão inteligente de estoque
      </p>
    </main>
  );
}
