import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      
      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-cinzel text-sm tracking-widest text-primary/50">
            HR ki Duniya
          </p>
          <p className="font-body text-xs text-muted-foreground">
            © {new Date().getFullYear()} — शब्दों की दुनिया, दिल से दिल तक
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
