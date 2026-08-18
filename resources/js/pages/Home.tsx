import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform, AnimatePresence, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { ScrollIndicator } from "@/components/ScrollIndicator";
import { fetchHomepageColors, fetchHomepageInstagramGallery, fetchHeroBanner, HeroBanner, HomepageColor, InstagramGalleryItem } from "@/lib/homepageApi";
import { fetchPublicHomepageSections, HomepageSectionsMap } from "@/lib/homepageSectionsApi";

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
  { id: "section-hero",            nextLabel: "COLLECTIONS",          nextId: "section-collections" },
  { id: "section-collections",     nextLabel: "JUST IN",              nextId: "section-new-arrivals" },
  { id: "section-new-arrivals",    nextLabel: "CURATED PALETTES",     nextId: "section-color" },
  { id: "section-color",           nextLabel: "FEATURED COLLECTIONS", nextId: "section-best-sellers" },
  { id: "section-best-sellers",    nextLabel: "LIMITED EDITION",      nextId: "section-limited-edition" },
  { id: "section-limited-edition", nextLabel: "OUR STORY",            nextId: "section-our-story" },
  { id: "section-our-story",       nextLabel: "WHY CHOOSE US",        nextId: "section-why" },
  { id: "section-why",             nextLabel: "AS WORN",              nextId: "section-gallery" },
  { id: "section-gallery",         nextLabel: "THE EDIT",             nextId: "section-newsletter" },
];

const COLORS = [
  { label: "Ivory", hex: "#F5F0E8", slug: "ivory" },
  { label: "Black", hex: "#1A1A1A", slug: "black" },
  { label: "Pink", hex: "#F4A7B9", slug: "pink" },
  { label: "Sky Blue", hex: "#87CEEB", slug: "skyblue" },
];



const GALLERY = [
  "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80",
  "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
  "https://images.unsplash.com/photo-1539109022462-16bc28a182c9?w=600&q=80",
  "https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=600&q=80",
  "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600&q=80",
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

  // Hero banner state — defaults match current static content as fallback
  const [heroBanner, setHeroBanner] = useState<HeroBanner>({
    small_heading: "Spring / Summer 2025",
    main_heading_line1: "The Art of",
    main_heading_line2: "Unhurried Style",
    primary_btn_text: "Discover Collection",
    primary_btn_url: "/shop",
    secondary_btn_text: "Limited Edition",
    secondary_btn_url: "/shop?collection=limited-edition",
    desktop_image_path: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1800&q=90",
    mobile_image_path: null,
  });

  // Dynamic Homepage Sections state
  const [sections, setSections] = useState<HomepageSectionsMap>({});

  // Resolve image: prefer mobile_image_path on small viewports, fallback to desktop
  const heroImageSrc =
    heroBanner.mobile_image_path && typeof window !== "undefined" && window.innerWidth < 768
      ? heroBanner.mobile_image_path
      : heroBanner.desktop_image_path;

  useEffect(() => {
    fetchHomepageColors().then(setColors).catch(console.error);
    fetchHomepageInstagramGallery().then(setGallery).catch(console.error);
    fetchHeroBanner().then(setHeroBanner).catch(console.error);
    fetchPublicHomepageSections().then(setSections).catch(console.error);
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

  // Section data helpers with default fallbacks
  const taglineData = sections['tagline']?.content ?? {
    line1: "Designed for Everyday Comfort.",
    line2: "Crafted for Timeless Style."
  };

  const collectionsData = {
    subtitle: sections['featured_collections']?.subtitle ?? "Collections",
    title: sections['featured_collections']?.title ?? "Shop by Collection",
    view_all_text: sections['featured_collections']?.content?.view_all_text ?? "View All",
    items: sections['featured_collections']?.content?.items ?? [],
  };

  const limitedBannerData = {
    subtitle: sections['limited_edition_banner']?.subtitle ?? "Rare, Considered, Final",
    title: sections['limited_edition_banner']?.title ?? "Limited Edition",
    btn_text: sections['limited_edition_banner']?.content?.btn_text ?? "View Collection",
    btn_url: sections['limited_edition_banner']?.content?.btn_url ?? "/shop?collection=limited-edition",
    image_path: sections['limited_edition_banner']?.content?.image_path ?? "/images/limited-edition-banner.png",
  };

  const storyData = {
    subtitle: sections['our_story']?.subtitle ?? "Our Story",
    title: sections['our_story']?.title ?? "Made with Intention.\nWorn without Effort.",
    body: sections['our_story']?.content?.body ?? "J Atelier began in a small studio in Paris with a single question: why does comfort have to look like an afterthought? We set out to make the most beautiful everyday pieces — the ones you reach for without thinking, that feel as considered as anything else in your wardrobe.",
    btn_text: sections['our_story']?.content?.btn_text ?? "Discover the Collection",
    btn_url: sections['our_story']?.content?.btn_url ?? "/shop",
  };

  const whyData = {
    subtitle: sections['why_jatelier']?.subtitle ?? "The Difference",
    title: sections['why_jatelier']?.title ?? "Why Choose Us",
    items: sections['why_jatelier']?.content?.items ?? [
      { title: "Exceptional Materials", body: "We source only the finest organic cotton, cashmere, and merino. Every fabric is chosen for longevity, softness, and environmental responsibility." },
      { title: "Intentional Design", body: "Every seam, pocket, and proportion is the result of months of refinement. Our pieces are considered, not assembled." },
      { title: "Made to Last", body: "We design against the disposable. Every J Atelier piece is built to outlast trends and improve with wear. Investment dressing for real life." },
    ]
  };

  const newsletterData = {
    subtitle: sections['newsletter']?.subtitle ?? "Stay Close",
    title: sections['newsletter']?.title ?? "The Atelier Edit",
    description: sections['newsletter']?.content?.description ?? "New arrivals, editorial stories, and the occasional secret — delivered quietly to your inbox.",
    input_placeholder: sections['newsletter']?.content?.input_placeholder ?? "Your email address",
    btn_text: sections['newsletter']?.content?.btn_text ?? "Subscribe",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Dior-style scroll indicator */}
      <ScrollIndicator sections={SCROLL_SECTIONS} />

      {/* Hero */}
      <section id="section-hero" ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <img
            src={heroImageSrc}
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
            {heroBanner.small_heading}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="font-serif text-6xl md:text-8xl lg:text-9xl leading-none mb-8 text-foreground"
          >
            {heroBanner.main_heading_line1}
            <br />
            <em>{heroBanner.main_heading_line2}</em>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href={heroBanner.primary_btn_url}
              className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-4 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors duration-300"
              data-testid="link-hero-shop"
            >
              {heroBanner.primary_btn_text}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href={heroBanner.secondary_btn_url}
              className="inline-flex items-center gap-3 bg-transparent border border-foreground/30 text-foreground px-10 py-4 text-xs uppercase tracking-widest hover:bg-foreground/5 transition-colors duration-300"
              data-testid="link-hero-limited"
            >
              {heroBanner.secondary_btn_text}
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Tagline Banner */}
      {sections['tagline']?.is_enabled !== false && (
        <section className="py-20 px-6 text-center bg-card/50">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="font-serif text-2xl md:text-3xl text-foreground/70 italic"
          >
            "{taglineData.line1}
            <br className="hidden md:block" />
            {taglineData.line2}"
          </motion.p>
        </section>
      )}

      {/* Featured Collections */}
      {sections['featured_collections']?.is_enabled !== false && (
        <section id="section-collections" className="py-24 px-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-end justify-between mb-16"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{collectionsData.subtitle}</p>
              <h2 className="font-serif text-4xl md:text-5xl">{collectionsData.title}</h2>
            </div>
            <Link href="/shop" className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest hover:text-accent transition-colors" data-testid="link-all-collections">
              {collectionsData.view_all_text} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {collectionsData.items.map((col: any, i: number) => (
              <motion.div
                key={col.slug + i}
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
      )}

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
      {sections['limited_edition_banner']?.is_enabled !== false && (
        <section id="section-limited-edition" className="relative h-[70vh] overflow-hidden">
          <img
            src={limitedBannerData.image_path}
            alt={limitedBannerData.title}
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
              {limitedBannerData.subtitle}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="font-serif text-5xl md:text-7xl text-primary-foreground mb-8"
            >
              {limitedBannerData.title}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link
                href={limitedBannerData.btn_url}
                className="inline-flex items-center gap-3 border border-primary-foreground/50 text-primary-foreground px-10 py-4 text-xs uppercase tracking-widest hover:bg-primary-foreground/10 transition-colors"
                data-testid="link-limited-edition-banner"
              >
                {limitedBannerData.btn_text}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Our Story */}
      {sections['our_story']?.is_enabled !== false && (
        <section id="section-our-story" className="py-32 px-6 max-w-5xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-widest text-muted-foreground mb-6"
          >
            {storyData.subtitle}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-6xl mb-10 whitespace-pre-line"
          >
            {storyData.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10"
          >
            {storyData.body}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link href={storyData.btn_url} className="inline-flex items-center gap-2 text-xs uppercase tracking-widest border-b border-foreground pb-1 hover:text-accent hover:border-accent transition-colors" data-testid="link-our-story-shop">
              {storyData.btn_text}
            </Link>
          </motion.div>
        </section>
      )}

      {/* Why J Atelier */}
      {sections['why_jatelier']?.is_enabled !== false && (
        <section id="section-why" className="py-24 bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <p className="text-xs uppercase tracking-widest text-primary-foreground/60 mb-4">{whyData.subtitle}</p>
              <h2 className="font-serif text-4xl md:text-5xl">{whyData.title}</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {whyData.items.map((item: any, i: number) => (
                <motion.div
                  key={item.title + i}
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
      )}

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
      {sections['newsletter']?.is_enabled !== false && (
        <section id="section-newsletter" className="py-24 bg-secondary">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">{newsletterData.subtitle}</p>
              <h2 className="font-serif text-4xl mb-4">{newsletterData.title}</h2>
              <p className="text-sm text-muted-foreground mb-10 leading-relaxed">
                {newsletterData.description}
              </p>
              <form className="flex flex-col sm:flex-row gap-0" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder={newsletterData.input_placeholder}
                  className="flex-1 bg-background border border-border px-6 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  data-testid="input-newsletter-email"
                />
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground px-8 py-4 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors whitespace-nowrap"
                  data-testid="button-newsletter-subscribe"
                >
                  {newsletterData.btn_text}
                </button>
              </form>
            </motion.div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
