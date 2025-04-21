"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

interface EditDeviceModalProps {
  device: {
    id: number;
    service_tag: string;
    device_type: string;
  };
  onUpdated: () => void;
  onClose: () => void;
}

export function EditDeviceModal({ device, onUpdated, onClose }: EditDeviceModalProps) {
  const [serviceTag, setServiceTag] = useState(device.service_tag);
  const [deviceType, setDeviceType] = useState(device.device_type);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await apiFetch(`/devices/${device.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ service_tag: serviceTag, device_type: deviceType }),
      });
      onUpdated();
      onClose();
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "error" in err) {
        setError((err as { error?: string }).error || "Failed to update device");
      } else {
        setError("Failed to update device");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={handleEdit} className="bg-white dark:bg-zinc-900 p-6 rounded shadow w-80 space-y-4">
        <h2 className="text-lg font-semibold">Edit Device</h2>
        <Input placeholder="Service Tag" value={serviceTag} onChange={e => setServiceTag(e.target.value)} required />
        <Input placeholder="Device Type" value={deviceType} onChange={e => setDeviceType(e.target.value)} required />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
        </div>
      </form>
    </div>
  );
}
