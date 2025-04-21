"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

interface MFAStatus {
  enabled: boolean;
  secret?: string;
  url?: string; // for QR code URL from backend
}

export default function MFAPage() {
  const [status, setStatus] = useState<MFAStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totp, setTotp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [success, setSuccess] = useState("");
  const [setupData, setSetupData] = useState<{ secret: string; url: string } | null>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function fetchStatus() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<MFAStatus>("/mfa/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus(data);
    } catch {
      setError("Failed to load MFA status");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
  }, []);

  async function handleSetup() {
    setError("");
    setSuccess("");
    try {
      const data = await apiFetch<{ secret: string; url: string }>("/mfa/setup", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSetupData(data);
    } catch {
      setError("Failed to start MFA setup");
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setVerifyError("");
    setSuccess("");
    try {
      await apiFetch("/mfa/verify", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ totp }),
      });
      setSuccess("MFA enabled successfully");
      setSetupData(null);
      setTotp("");
      fetchStatus();
    } catch {
      setVerifyError("Invalid code. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleDisable() {
    setError("");
    setSuccess("");
    try {
      await apiFetch("/mfa/disable", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("MFA disabled");
      fetchStatus();
    } catch {
      setError("Failed to disable MFA");
    }
  }

  if (loading) return <div>Loading MFA status...</div>;
  if (error) return <div className="text-red-500 mb-4">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Multi-Factor Authentication (MFA)</h1>
      {status && status.enabled && !setupData ? (
        <div className="mb-6">
          <div className="mb-2 text-green-600 font-medium">MFA is enabled on your account.</div>
          <Button variant="destructive" onClick={handleDisable}>Disable MFA</Button>
        </div>
      ) : null}
      {!status?.enabled && !setupData && (
        <div className="mb-6">
          <div className="mb-2">MFA is <span className="font-semibold">not enabled</span> on your account.</div>
          <Button onClick={handleSetup}>Set up MFA</Button>
        </div>
      )}
      {setupData && (
        <div className="mb-6">
          <div className="mb-2">Scan the QR code below with your authenticator app, or enter the secret manually.</div>
          <img src={setupData.url} alt="MFA QR Code" className="mb-2 border rounded" />
          <div className="mb-2">Secret: <span className="font-mono text-sm">{setupData.secret}</span></div>
          <form onSubmit={handleVerify} className="space-y-2 mt-4">
            <Input
              placeholder="Enter 6-digit code from your app"
              value={totp}
              onChange={e => setTotp(e.target.value)}
              required
              maxLength={6}
            />
            {verifyError && <div className="text-red-500 text-sm">{verifyError}</div>}
            <Button type="submit" disabled={verifying} className="w-full">{verifying ? "Verifying..." : "Verify & Enable MFA"}</Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => setSetupData(null)} disabled={verifying}>Cancel</Button>
          </form>
        </div>
      )}
      {success && <div className="text-green-600 mb-4">{success}</div>}
    </div>
  );
}
