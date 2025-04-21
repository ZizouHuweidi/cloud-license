"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useState } from "react";

interface License {
  id: number;
  key: string;
}

export default function DeleteLicenseDialog({ license, onClose }: { license: License; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");
    try {
      await apiFetch(`/licenses/${license.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      onClose();
    } catch {
      setError("Failed to delete license");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete License</DialogTitle>
        </DialogHeader>
        <div>Are you sure you want to delete license <span className="font-mono">{license.key}</span>?</div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex gap-2 mt-4">
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>{loading ? "Deleting..." : "Delete"}</Button>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
