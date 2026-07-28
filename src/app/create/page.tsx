import type { Metadata } from "next";
import { CreateForm } from "./CreateForm";

const description =
  "Create a private Spyfall room and invite friends with a shareable game code.";

export const metadata: Metadata = {
  title: "Create Game",
  description,
  alternates: {
    canonical: "/create",
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Create Game | Spyfall",
    description,
    url: "/create",
  },
};

export default function CreatePage() {
  return <CreateForm />;
}
