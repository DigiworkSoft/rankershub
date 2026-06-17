import type { Metadata } from "next";
import AdmissionClient from "./AdmissionClient";

export const metadata: Metadata = {
  title: "Admission Details — RankersHub Commerce Coaching Pune",
  description: "Join RankersHub Commerce Classes. Learn about admission process, fee structure, eligibility criteria and required documents.",
};

export default function AdmissionPage() {
  return <AdmissionClient />;
}
