"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AddDeviceModal } from "./AddDeviceModal";
import { EditDeviceModal } from "./EditDeviceModal";
import { DeleteDeviceDialog } from "./DeleteDeviceDialog";

export interface Device {
  id: number;
  service_tag: string;
  device_type: string;
}

export function DeviceTable() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Device | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  async function fetchDevices() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const data = await apiFetch<Device[]>("/devices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(data);
    } catch (err: unknown) {
      setError("Failed to load devices");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDevices();
  }, []);

  if (loading) return <div>Loading devices...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  // Filter devices by service tag or device type
  const filteredDevices = devices.filter(d =>
    d.service_tag.toLowerCase().includes(search.toLowerCase()) ||
    d.device_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <AddDeviceModal onAdded={fetchDevices} />
      <input
        className="mb-4 px-3 py-2 border rounded w-full max-w-xs"
        placeholder="Search devices..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {filteredDevices.length === 0 ? (
        <div>No devices found.</div>
      ) : (
        <table className="w-full border mt-4">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 text-left">Service Tag</th>
              <th className="p-2 text-left">Device Type</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((device) => (
              <tr key={device.id} className="border-t">
                <td className="p-2">{device.service_tag}</td>
                <td className="p-2">{device.device_type}</td>
                <td className="p-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(device)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleting(device.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editing && (
        <EditDeviceModal
          device={editing}
          onUpdated={fetchDevices}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting !== null && (
        <DeleteDeviceDialog
          deviceId={deleting}
          onDeleted={fetchDevices}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
