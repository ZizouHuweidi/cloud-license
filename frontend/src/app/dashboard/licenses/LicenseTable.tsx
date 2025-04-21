"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import AddLicenseModal from "./AddLicenseModal";
import EditLicenseModal from "./EditLicenseModal";
import DeleteLicenseDialog from "./DeleteLicenseDialog";

interface License {
  id: number;
  key: string;
  type: string;
  assignedTo: string;
  expiresAt: string;
}

export default function LicenseTable() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editLicense, setEditLicense] = useState<License | null>(null);
  const [deleteLicense, setDeleteLicense] = useState<License | null>(null);

  async function fetchLicenses() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<License[]>("/licenses", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setLicenses(data);
    } catch {
      setError("Failed to load licenses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchLicenses(); }, []);

  const filtered = licenses.filter(l =>
    l.key.toLowerCase().includes(search.toLowerCase()) ||
    l.type.toLowerCase().includes(search.toLowerCase()) ||
    l.assignedTo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center mb-4 gap-2">
        <input
          className="border rounded px-2 py-1"
          placeholder="Search by key, type, or assignee"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button onClick={() => setAddOpen(true)}>Add License</Button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-muted">
              <th className="px-2 py-1 border">Key</th>
              <th className="px-2 py-1 border">Type</th>
              <th className="px-2 py-1 border">Assigned To</th>
              <th className="px-2 py-1 border">Expires At</th>
              <th className="px-2 py-1 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(lic => (
              <tr key={lic.id}>
                <td className="border px-2 py-1">{lic.key}</td>
                <td className="border px-2 py-1">{lic.type}</td>
                <td className="border px-2 py-1">{lic.assignedTo}</td>
                <td className="border px-2 py-1">{lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString() : "-"}</td>
                <td className="border px-2 py-1 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditLicense(lic)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteLicense(lic)}>Delete</Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-4">No licenses found</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <AddLicenseModal open={addOpen} onClose={() => { setAddOpen(false); fetchLicenses(); }} />
      {editLicense && <EditLicenseModal license={editLicense} onClose={() => { setEditLicense(null); fetchLicenses(); }} />}
      {deleteLicense && <DeleteLicenseDialog license={deleteLicense} onClose={() => { setDeleteLicense(null); fetchLicenses(); }} />}
    </div>
  );
}
