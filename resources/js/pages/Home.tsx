import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform, AnimatePresence, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { ScrollIndicator } from "@/components/ScrollIndicator";
import { fetchHomepageColors, fetchHomepageInstagramGallery, HomepageColor, InstagramGalleryItem } from "@/lib/homepageApi";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: "easeOut" },
  }),
};

/** Ordered list of homepage sections for the scroll indicator */
const SCROLL_SECTIONS = [
  { id: "section-hero",            nextLabel: "COLLECTIONS",         nextId: "section-collections" },
  { id: "section-collections",     nextLabel: "JUST IN",             nextId: "section-new-arrivals" },
  { id: "section-new-arrivals",    nextLabel: "CURATED PALETTES",    nextId: "section-color" },
  { id: "section-color",           nextLabel: "FEATURED COLLECTIONS",nextId: "section-best-sellers" },
  { id: "section-best-sellers",    nextLabel: "LIMITED EDITION",     nextId: "section-limited-edition" },
  { id: "section-limited-edition", nextLabel: "OUR STORY",           nextId: "section-our-story" },
  { id: "section-our-story",       nextLabel: "WHY J ATELIER",       nextId: "section-why" },
  { id: "section-why",             nextLabel: "AS WORN",             nextId: "section-reviews" },
  { id: "section-reviews",         nextLabel: "THE EDIT",            nextId: "section-gallery" },
  { id: "section-gallery",         nextLabel: "THE EDIT",            nextId: "section-newsletter" },
];

const COLORS = [
  { label: "Ivory", hex: "#F5F0E8", slug: "ivory" },
  { label: "Black", hex: "#1A1A1A", slug: "black" },
  { label: "Pink", hex: "#F4A7B9", slug: "pink" },
  { label: "Sky Blue", hex: "#87CEEB", slug: "skyblue" },
];

const COLLECTIONS = [
  { label: "New Arrivals", slug: "new-arrivals", image: "/images/New Arrivals/aurora-pullover-hoodie-ivory.webp" },
  { label: "Best Sellers", slug: "best-sellers", image: "/images/Best Sellers/willow-pullover-hoodie-brown.webp" },
  { label: "Oversized", slug: "oversized", image: "/images/oversized/onyx-oversized-hoodie-black.avif" },
  { label: "Limited Edition", slug: "limited-edition", image: "/images/limited-edition/azure-long-sleeve-sky-blue.jpg" },
];

const GALLERY = [
  "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80",
  "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
  "https://images.unsplash.com/photo-1539109022462-16bc28a182c9?w=600&q=80",
  "https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=600&q=80",
  "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600&q=80",
];

const REVIEWS = [
  { name: "Isabelle M.", text: "J Atelier pieces are the only ones I reach for without thinking. That's the highest compliment I can give.", rating: 5 },
  { name: "Clara T.", text: "I bought my first piece as a treat. Now my wardrobe is almost entirely J Atelier. Worth every penny.", rating: 5 },
  { name: "Valentina R.", text: "The quality difference is immediately obvious. These aren't just hoodies — they're investments.", rating: 5 },
];

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [colors, setColors] = useState<HomepageColor[]>(COLORS);
  const [gallery, setGallery] = useState<InstagramGalleryItem[]>(
    GALLERY.map((src, index) => ({
      id: -(index + 1),
      image_path: src,
      alt_text: "As Worn Gallery Image " + (index + 1),
      instagram_url: "https://instagram.com",
      is_enabled: true,
      sort_order: index
    }))
  );

  useEffect(() => {
    fetchHomepageColors().then(setColors).catch(console.error);
    fetchHomepageInstagramGallery().then(setGallery).catch(console.error);
  }, []);

  const { getNewArrivals, getBestSellers, getProductsByColor, loading } = useProducts();

  const newArrivals = getNewArrivals().slice(0, 4);
  const bestSellers = getBestSellers().slice(0, 4);

  const colorProducts = activeColor
    ? getProductsByColor(activeColor)
    : [];

  const otherColors = activeColor
    ? colors.filter((c) => c.label !== activeColor)
    : colors;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Dior-style scroll indicator */}
      <ScrollIndicator sections={SCROLL_SECTIONS} />

      {/* Hero */}
      <section id="section-hero" ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1800&q=90"
            alt="J Atelier"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-background/25" />
        </motion.div>
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative h-full flex flex-col items-center justify-end pb-24 text-center px-6"
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.3em" }}
            animate={{ opacity: 1, letterSpacing: "0.5em" }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="text-xs uppercase tracking-[0.5em] text-foreground/70 mb-6"
          >
            Spring / Summer 2025
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="font-serif text-6xl md:text-8xl lg:text-9xl leading-none mb-8 text-foreground"
          >
            The Art of
            <br />
            <em>Unhurried</em> Style
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-4 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors duration-300"
              data-testid="link-hero-shop"
            >
              Discover Collection
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/shop?collection=limited-edition"
              className="inline-flex items-center gap-3 bg-transparent border border-foreground/30 text-foreground px-10 py-4 text-xs uppercase tracking-widest hover:bg-foreground/5 transition-colors duration-300"
              data-testid="link-hero-limited"
            >
              Limited Edition
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Tagline Banner */}
      <section className="py-20 px-6 text-center bg-card/50">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="font-serif text-2xl md:text-3xl text-foreground/70 italic"
        >
          "Designed for Everyday Comfort.
          <br className="hidden md:block" />
          Crafted for Timeless Style."
        </motion.p>
      </section>

      {/* Featured Collections */}
      <section id="section-collections" className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-16"
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Collections</p>
            <h2 className="font-serif text-4xl md:text-5xl">Shop by Collection</h2>
          </div>
          <Link href="/shop" className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest hover:text-accent transition-colors" data-testid="link-all-collections">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLLECTIONS.map((col, i) => (
            <motion.div
              key={col.slug}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <Link href={`/shop?collection=${col.slug}`} data-testid={`link-collection-${col.slug}`}>
                <div className="group relative aspect-[3/4] overflow-hidden">
                  <img
                    src={col.image}
                    alt={col.label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="font-serif text-xl text-primary-foreground mb-1">{col.label}</p>
                    <p className="text-xs uppercase tracking-widest text-primary-foreground/70">Explore</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section id="section-new-arrivals" className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-16"
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Just In</p>
            <h2 className="font-serif text-4xl md:text-5xl">New Arrivals</h2>
          </div>
          <Link href="/shop?collection=new-arrivals" className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest hover:text-accent transition-colors" data-testid="link-new-arrivals">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {newArrivals.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* Shop by Color — Interactive */}
      <section id="section-color" className="py-24 bg-card/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Curated Palettes</p>
            <h2 className="font-serif text-4xl md:text-5xl">Shop by Color</h2>
          </motion.div>

          {/* Color Swatches */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {colors.map((color, i) => (
              <motion.div
                key={color.slug}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <button
                  onClick={() => setActiveColor(activeColor === color.label ? null : color.label)}
                  className="group cursor-pointer text-center w-full"
                  data-testid={`button-color-${color.slug}`}
                >
                  <div
                    className={`aspect-square mb-4 border transition-all duration-500 ${activeColor === color.label
                        ? "border-foreground scale-[0.96] ring-2 ring-foreground ring-offset-2"
                        : "border-border/20 group-hover:scale-[0.97]"
                      }`}
                    style={{ backgroundColor: color.hex }}
                  />
                  <p className={`text-xs uppercase tracking-widest transition-colors ${activeColor === color.label ? "text-accent font-medium" : "group-hover:text-accent"
                    }`}>
                    {color.label}
                  </p>
                </button>
              </motion.div>
            ))}
          </div>

          {/* Filtered Products */}
          <AnimatePresence mode="wait">
            {activeColor && (
              <motion.div
                key={activeColor}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                {/* Active Filter Label */}
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border border-border/30"
                      style={{ backgroundColor: colors.find(c => c.label === activeColor)?.hex }}
                    />
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Showing: <span className="text-foreground font-medium">{activeColor}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveColor(null)}
                    className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors border-b border-muted-foreground/30 pb-0.5"
                  >
                    Clear Filter
                  </button>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14">
                  {colorProducts.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>

                {/* Explore Other Colors */}
                <div className="border-t border-border/20 pt-10">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6 text-center">Explore Other Colors</p>
                  <div className="flex justify-center gap-8">
                    {otherColors.map((color) => (
                      <button
                        key={color.slug}
                        onClick={() => setActiveColor(color.label)}
                        className="group flex flex-col items-center gap-2"
                        data-testid={`button-other-color-${color.slug}`}
                      >
                        <div
                          className="w-12 h-12 border border-border/20 transition-transform duration-300 group-hover:scale-110"
                          style={{ backgroundColor: color.hex }}
                        />
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-accent transition-colors">
                          {color.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Best Sellers */}
      <section id="section-best-sellers" className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-16"
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Perennial Favourites</p>
            <h2 className="font-serif text-4xl md:text-5xl">Best Sellers</h2>
          </div>
          <Link href="/shop?collection=best-sellers" className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest hover:text-accent transition-colors" data-testid="link-best-sellers">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {bestSellers.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* Limited Edition Banner */}
      <section id="section-limited-edition" className="relative h-[70vh] overflow-hidden">
        <img
          src="/images/limited-edition-banner.png"
          alt="Limited Edition"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-primary/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-widest text-primary-foreground/70 mb-4"
          >
            Rare, Considered, Final
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-serif text-5xl md:text-7xl text-primary-foreground mb-8"
          >
            Limited Edition
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/shop?collection=limited-edition"
              className="inline-flex items-center gap-3 border border-primary-foreground/50 text-primary-foreground px-10 py-4 text-xs uppercase tracking-widest hover:bg-primary-foreground/10 transition-colors"
              data-testid="link-limited-edition-banner"
            >
              View Collection
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section id="section-our-story" className="py-32 px-6 max-w-5xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-widest text-muted-foreground mb-6"
        >
          Our Story
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-serif text-4xl md:text-6xl mb-10"
        >
          Made with Intention.
          <br />
          Worn without Effort.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10"
        >
          J Atelier began in a small studio in Paris with a single question: why does comfort
          have to look like an afterthought? We set out to make the most beautiful everyday
          pieces — the ones you reach for without thinking, that feel as considered as anything
          else in your wardrobe.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/shop" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest border-b border-foreground pb-1 hover:text-accent hover:border-accent transition-colors" data-testid="link-our-story-shop">
            Discover the Collection
          </Link>
        </motion.div>
      </section>

      {/* Why J Atelier */}
      <section id="section-why" className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-xs uppercase tracking-widest text-primary-foreground/60 mb-4">The Difference</p>
            <h2 className="font-serif text-4xl md:text-5xl">Why J Atelier</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { title: "Exceptional Materials", body: "We source only the finest organic cotton, cashmere, and merino. Every fabric is chosen for longevity, softness, and environmental responsibility." },
              { title: "Intentional Design", body: "Every seam, pocket, and proportion is the result of months of refinement. Our pieces are considered, not assembled." },
              { title: "Made to Last", body: "We design against the disposable. Every J Atelier piece is built to outlast trends and improve with wear. Investment dressing for real life." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <div className="w-8 h-px bg-primary-foreground/30 mx-auto mb-8" />
                <h3 className="font-serif text-xl mb-4 text-primary-foreground">{item.title}</h3>
                <p className="text-sm text-primary-foreground/60 leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section id="section-reviews" className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Worn and Loved</p>
          <h2 className="font-serif text-4xl md:text-5xl">What They Say</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={review.name}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-card p-10"
            >
              <div className="flex gap-1 mb-6">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <span key={j} className="text-accent text-sm">★</span>
                ))}
              </div>
              <p className="font-serif text-lg italic text-foreground/80 mb-6 leading-relaxed">"{review.text}"</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">— {review.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section id="section-gallery" className="py-16 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">@jatelier</p>
          <h2 className="font-serif text-4xl">As Worn</h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {gallery.map((item, i) => {
            const content = (
              <img
                src={item.image_path}
                alt={item.alt_text || "As Worn Gallery"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            );
            return (
              <motion.div
                key={item.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="aspect-square overflow-hidden group cursor-pointer"
              >
                {item.instagram_url ? (
                  <a href={item.instagram_url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                    {content}
                  </a>
                ) : (
                  content
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Newsletter */}
      <section id="section-newsletter" className="py-24 bg-secondary">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Stay Close</p>
            <h2 className="font-serif text-4xl mb-4">The Atelier Edit</h2>
            <p className="text-sm text-muted-foreground mb-10 leading-relaxed">
              New arrivals, editorial stories, and the occasional secret — delivered quietly to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-0" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-background border border-border px-6 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                data-testid="input-newsletter-email"
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-8 py-4 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors whitespace-nowrap"
                data-testid="button-newsletter-subscribe"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>



      <Footer />
    </div>
  );
}
