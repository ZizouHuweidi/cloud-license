"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

interface License {
  id: number;
  key: string;
  type: string;
  assignedTo: string;
  expiresAt: string;
}

export default function EditLicenseModal({ license, onClose }: { license: License; onClose: () => void }) {
  const [key, setKey] = useState(license.key);
  const [type, setType] = useState(license.type);
  const [assignedTo, setAssignedTo] = useState(license.assignedTo);
  const [expiresAt, setExpiresAt] = useState(license.expiresAt || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch(`/licenses/${license.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ key, type, assignedTo, expiresAt }),
      });
      onClose();
    } catch {
      setError("Failed to update license");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit License</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input placeholder="Key" value={key} onChange={e => setKey(e.target.value)} required />
          <Input placeholder="Type" value={type} onChange={e => setType(e.target.value)} required />
          <Input placeholder="Assigned To" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} required />
          <Input placeholder="Expires At (YYYY-MM-DD)" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
