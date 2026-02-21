import Navbar from "@/components/Navbar";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-up">
          <p className="font-body text-sm tracking-[0.3em] text-muted-foreground uppercase mb-4">
            The Writer Behind the Words
          </p>
          <h1 className="font-cinzel text-4xl md:text-5xl gold-text-gradient gold-text-glow mb-4">
            About the Author
          </h1>
          <div className="golden-divider max-w-xs mx-auto" />
        </div>

        {/* Philosophy */}
        <div className="space-y-12 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <section>
            <h2 className="font-display text-2xl text-primary mb-4">Philosophy</h2>
            <div className="w-12 h-px bg-primary/30 mb-6" />
            <p className="font-body text-lg leading-relaxed text-foreground/80">
              मैं शब्दों का एक मुसाफ़िर हूँ। हर कविता एक सफ़र है, हर कहानी एक मंज़िल। 
              मेरा मानना है कि शब्दों में वो ताक़त है जो दुनिया बदल सकती है। 
              HR ki Duniya मेरी कलम की वो दुनिया है जहाँ भावनाएँ बोलती हैं, 
              जहाँ ख़ामोशी को भी आवाज़ मिलती है।
            </p>
            <p className="font-body text-lg leading-relaxed text-foreground/80 mt-4">
              I believe in the power of honest words. Not loud, not perfect — just real. 
              Every poem here is a piece of my soul, every story a fragment of the world I see. 
              Writing, for me, is not a craft — it is breathing.
            </p>
          </section>

          <div className="golden-divider" />

          {/* Writing Journey */}
          <section>
            <h2 className="font-display text-2xl text-primary mb-6">The Journey</h2>
            <div className="space-y-8 border-l border-primary/20 pl-6">
              {[
                { year: "The Beginning", text: "Started writing poetry in school notebooks, hidden from everyone." },
                { year: "Finding Voice", text: "Realized that Hindi poetry is not old-fashioned — it's timeless." },
                { year: "HR ki Duniya", text: "Created this space to share my world of words with anyone who listens." },
                { year: "The Journey Continues", text: "Every day, a new verse. Every night, a new story." },
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[29px] w-3 h-3 rounded-full bg-primary/60" />
                  <h3 className="font-display text-lg text-primary/80 mb-1">{item.year}</h3>
                  <p className="font-body text-base text-foreground/60">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="golden-divider" />

          {/* Manifesto */}
          <section className="text-center py-8">
            <p className="font-body text-sm tracking-[0.2em] text-muted-foreground uppercase mb-6">
              A Personal Manifesto
            </p>
            <blockquote className="font-display text-xl md:text-2xl text-foreground/80 italic leading-relaxed max-w-xl mx-auto">
              "लिखना मेरे लिए साँस लेना है। हर शब्द एक धड़कन, हर पन्ना एक ज़िन्दगी।
              मैं सिर्फ़ लिखता नहीं — मैं जीता हूँ अपनी कलम के ज़रिए।"
            </blockquote>
            <div className="mt-8">
              <p className="font-cinzel text-primary/60 text-lg tracking-widest italic">
                — HR
              </p>
            </div>
          </section>

          {/* Signature */}
          <div className="text-center py-8">
            <div className="inline-block">
              <p className="font-display text-3xl gold-text-gradient italic">
                HR ki Duniya
              </p>
              <div className="w-full h-px bg-primary/30 mt-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
