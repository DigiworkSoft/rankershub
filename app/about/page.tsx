import type { Metadata } from "next";
import AboutClient from "./AboutClient";
import PopupDisplay from "@/app/_components/PopupDisplay";

export const metadata: Metadata = {
  title: "About Us — RankersHub Commerce Coaching Pune",
  description:
    "Learn about RankersHub — our mission, vision, expert faculty and what makes us the best commerce coaching institute in Pune.",
};

export default function AboutPage() {
  return (
    <>
      <AboutClient />
      <PopupDisplay location="about" />
    </>
  );
}

