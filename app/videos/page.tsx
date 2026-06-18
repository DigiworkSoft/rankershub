import type { Metadata } from "next";
import VideosClient from "./VideosClient";

export const metadata: Metadata = {
  title: "Latest YouTube Content | RankersHub",
  description: "Watch the latest educational videos and Shorts from Rankers Hub Commerce Academy.",
};

export default function YoutubeVideosPage() {
  return <VideosClient />;
}
