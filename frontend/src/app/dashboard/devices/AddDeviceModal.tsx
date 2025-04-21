"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

interface AddDeviceModalProps {
  onAdded: () => void;
}

export function AddDeviceModal({ onAdded }: AddDeviceModalProps) {
  const [open, setOpen] = useState(false);
  const [serviceTag, setServiceTag] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await apiFetch("/devices", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ service_tag: serviceTag, device_type: deviceType }),
      });
      setOpen(false);
      setServiceTag("");
      setDeviceType("");
      onAdded();
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "error" in err) {
        setError((err as { error?: string }).error || "Failed to add device");
      } else {
        setError("Failed to add device");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="mb-4">Add Device</Button>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleAdd} className="bg-white dark:bg-zinc-900 p-6 rounded shadow w-80 space-y-4">
            <h2 className="text-lg font-semibold">Add Device</h2>
            <Input placeholder="Service Tag" value={serviceTag} onChange={e => setServiceTag(e.target.value)} required />
            <Input placeholder="Device Type" value={deviceType} onChange={e => setDeviceType(e.target.value)} required />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add"}</Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
