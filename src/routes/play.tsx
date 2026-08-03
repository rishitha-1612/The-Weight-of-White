import { createFileRoute } from "@tanstack/react-router";
import { Snort } from "@/components/Snort";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Play — Three White Lines" },
      {
        name: "description",
        content:
          "Swipe a line and find out. Two promise comfort, one promises escape. Reshuffled every round.",
      },
      { property: "og:title", content: "Play — Three White Lines" },
      {
        property: "og:description",
        content: "Swipe a line and find out. Reshuffled every round.",
      },
    ],
  }),
  component: Snort,
});
