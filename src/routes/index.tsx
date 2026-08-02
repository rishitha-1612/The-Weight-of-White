import { createFileRoute } from "@tanstack/react-router";
import { Snort } from "@/components/Snort";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Two Lines Lie — Sugar or Not" },
      {
        name: "description",
        content:
          "Three glittering powder lines, one is powdered sugar. Swipe to find out which — Euphoria-coded, reshuffled every round.",
      },
      { property: "og:title", content: "Two Lines Lie — Sugar or Not" },
      {
        property: "og:description",
        content:
          "Three glittering powder lines, one is powdered sugar. Swipe to find out which — reshuffled every round.",
      },
    ],
  }),
  component: Snort,
});
