"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const data = await apiFetch<{ token: string }>("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "error" in err) {
        setError((err as { error?: string }).error || "Login failed");
      } else {
        setError("Login failed");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-32 space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>
      <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button type="submit" className="w-full">Login</Button>
    </form>
  );
}
