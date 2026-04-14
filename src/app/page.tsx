import { Navigation, Hero } from "@/components/holding-company";
import { ModalSystem } from "@/components/modals";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative">
      <Navigation />
      <Hero />
      <ModalSystem />
    </main>
  );
}
