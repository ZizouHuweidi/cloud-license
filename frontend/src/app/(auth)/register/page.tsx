"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push("/login");
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "error" in err) {
        setError((err as { error?: string }).error || "Registration failed");
      } else {
        setError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-32 space-y-4">
      <h1 className="text-2xl font-bold">Register</h1>
      <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      <Input placeholder="Confirm Password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button type="submit" className="w-full" disabled={loading}>{loading ? "Registering..." : "Register"}</Button>
      <div className="text-center mt-2 text-sm">
        Already have an account? <a href="/login" className="text-primary underline">Login</a>
      </div>
    </form>
  );
}
