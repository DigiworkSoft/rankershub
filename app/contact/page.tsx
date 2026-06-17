import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us — RankersHub Commerce Coaching Pune",
  description: "Get in touch with RankersHub. Visit us at Sadashiv Peth, Pune or call +91 9272547817.",
};

export default function ContactPage() {
  return <ContactClient />;
}
