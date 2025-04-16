import { createFileRoute } from "@tanstack/react-router";
import { LicenseDetail } from "@/components/Licenses/LicenseDetail";

export const Route = createFileRoute("/_layout/licenses/$licenseId")({
  component: LicenseDetail,
});
