import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Three White Lines — Trust Your Instincts" },
      {
        name: "description",
        content:
          "Two promise comfort, one promises escape. A glittering, Euphoria-coded game of nerve that reshuffles every round.",
      },
      { property: "og:title", content: "Three White Lines — Trust Your Instincts" },
      {
        property: "og:description",
        content:
          "Two promise comfort, one promises escape. A glittering game of nerve, reshuffled every round.",
      },
    ],
  }),
  component: Landing,
});
