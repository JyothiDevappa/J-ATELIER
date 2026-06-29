import { useParams } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getProductsByColor } from "@/data/products";

const COLOR_META: Record<string, { label: string; hex: string; description: string }> = {
  ivory: { label: "Ivory", hex: "#F5F0E8", description: "Warm, soft, and endlessly versatile. Our Ivory palette is built on the tone of untouched natural fibres." },
  black: { label: "Black", hex: "#1A1A1A", description: "Not the black of absence, but the black of intention. Deep, matte, and permanently relevant." },
  mocha: { label: "Mocha", hex: "#8C6A56", description: "Drawn from earth and espresso. A warm brown that lives at the intersection of nature and warmth." },
  olive: { label: "Olive", hex: "#5C5C3D", description: "Quiet and grounded. The colour of late-season light filtering through leaves — understated and timeless." },
};

export default function ColorCollection() {
  const params = useParams<{ color: string }>();
  const slug = params.color?.toLowerCase() || "";
  const meta = COLOR_META[slug];
  const colorProducts = getProductsByColor(slug);

  if (!meta) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <p className="font-serif text-2xl">Collection not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        {/* Header */}
        <div className="relative h-72 flex items-center justify-center" style={{ backgroundColor: meta.hex }}>
          <div className="absolute inset-0 bg-foreground/20" />
          <div className="relative text-center px-6">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs uppercase tracking-widest text-primary-foreground/70 mb-3"
            >
              Shop by Color
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-5xl md:text-7xl text-primary-foreground"
            >
              {meta.label}
            </motion.h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-16">
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">{meta.description}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground flex-shrink-0">
              {colorProducts.length} {colorProducts.length === 1 ? "piece" : "pieces"}
            </p>
          </div>

          {colorProducts.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-serif text-2xl text-muted-foreground">No pieces available in this color.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {colorProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
