import { DeviceTable } from "./DeviceTable";

export default function DevicesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Devices</h1>
      <p className="mb-4">Manage your devices here.</p>
      <DeviceTable />
    </div>
  );
}
