export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="lens-flare" style={{ top: '20%', left: '30%' }} />
        
        <div className="container relative z-10">
          <h1 className="heading-font text-6xl md:text-8xl gradient-text text-center mb-6 atmospheric-glow">
            ABOUT THE ARTIST
          </h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto">
            Exploring the boundaries between light and shadow
          </p>
        </div>
      </section>

      {/* Biography Section */}
      <section className="container py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Introduction */}
          <div className="space-y-6">
            <h2 className="heading-font text-4xl gradient-text">Biography</h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                Jennefer Ann is a contemporary artist whose work explores the dramatic interplay 
                between light and darkness. Drawing inspiration from the chiaroscuro techniques 
                of the Old Masters, her paintings create powerful emotional narratives through 
                bold contrasts and atmospheric depth.
              </p>
              <p>
                Born and raised in South Africa, Jennefer developed her distinctive style through 
                years of experimentation with various mediums and techniques. Her work reflects a 
                deep understanding of how light can transform a composition, creating mood, drama, 
                and emotional resonance.
              </p>
              <p>
                Each piece begins with careful observation of natural light and shadow patterns, 
                which are then translated into bold, expressive compositions. Her paintings often 
                feature strong directional lighting that emerges from deep, void-like backgrounds, 
                creating a sense of mystery and revelation.
              </p>
            </div>
          </div>

          {/* Artistic Philosophy */}
          <div className="space-y-6">
            <h2 className="heading-font text-4xl gradient-text">Artistic Philosophy</h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                At the heart of my practice is the belief that art should evoke emotion and 
                create a visceral response in the viewer. I use the dramatic contrast of light 
                and shadow—the essence of chiaroscuro—to create works that speak to the human 
                experience of hope emerging from darkness, clarity from confusion, and beauty 
                from struggle.
              </p>
              <p>
                My process is both intuitive and deliberate. I begin with careful planning of 
                the composition and light sources, but allow the painting to evolve organically 
                as layers of paint build up. This balance between control and spontaneity results 
                in works that feel both structured and alive.
              </p>
              <p>
                I believe that contemporary art can draw from historical techniques while remaining 
                relevant to modern audiences. By combining traditional chiaroscuro methods with 
                contemporary subject matter and sensibilities, I aim to create timeless works that 
                resonate across generations.
              </p>
            </div>
          </div>

          {/* Technique & Medium */}
          <div className="space-y-6">
            <h2 className="heading-font text-4xl gradient-text">Technique & Medium</h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                I work primarily with oil paints on canvas, a medium that allows for the rich, 
                luminous quality essential to chiaroscuro painting. The slow-drying nature of 
                oils enables me to blend and layer colors, creating the subtle gradations from 
                deep shadow to brilliant highlight that define my work.
              </p>
              <p>
                My technique involves building up multiple thin layers of paint, a process known 
                as glazing, which creates depth and luminosity. I pay particular attention to the 
                transition zones between light and shadow, where the drama of the composition is 
                most powerfully expressed.
              </p>
              <p>
                Each painting can take several weeks to complete, as I allow layers to dry before 
                adding the next. This patient, methodical approach results in works with a depth 
                and richness that cannot be achieved through faster methods.
              </p>
            </div>
          </div>

          {/* Exhibitions & Recognition */}
          <div className="space-y-6">
            <h2 className="heading-font text-4xl gradient-text">Exhibitions & Recognition</h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                My work has been exhibited in galleries throughout South Africa and has found homes 
                in private collections around the world. Each exhibition is an opportunity to share 
                my vision and connect with viewers who appreciate the power of light and shadow.
              </p>
              <p>
                I continue to develop my practice through ongoing exploration of new subjects and 
                techniques, while remaining true to the core principles of chiaroscuro that define 
                my artistic identity. My goal is to create works that stand the test of time, 
                speaking to viewers long after they leave the gallery.
              </p>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="pt-12 text-center">
            <h2 className="heading-font text-4xl gradient-text mb-6">Let's Connect</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Interested in commissioning a piece or learning more about my work? 
              I'd love to hear from you.
            </p>
            <div className="space-y-4">
              <p className="text-foreground">
                <strong>Email:</strong>{" "}
                <a href="mailto:jennefer@artgallery.com" className="text-primary hover:underline">
                  jennefer@artgallery.com
                </a>
              </p>
              <p className="text-foreground">
                <strong>Location:</strong> South Africa
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
