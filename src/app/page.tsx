import Navigation from "@/components/holding-company/Navigation";
import Hero from "@/components/holding-company/Hero";
import ModalSystem from "@/components/modals/ModalSystem";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative">
      <Navigation />
      <Hero />
      <ModalSystem />
    </main>
  );
}
