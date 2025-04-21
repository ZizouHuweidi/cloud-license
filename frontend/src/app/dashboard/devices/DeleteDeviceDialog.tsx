"use client";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useState } from "react";

interface DeleteDeviceDialogProps {
  deviceId: number;
  onDeleted: () => void;
  onClose: () => void;
}

export function DeleteDeviceDialog({ deviceId, onDeleted, onClose }: DeleteDeviceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await apiFetch(`/devices/${deviceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      onDeleted();
      onClose();
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "error" in err) {
        setError((err as { error?: string }).error || "Failed to delete device");
      } else {
        setError("Failed to delete device");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded shadow w-80">
        <h2 className="text-lg font-semibold mb-2">Delete Device</h2>
        <p className="mb-4">Are you sure you want to delete this device?</p>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
