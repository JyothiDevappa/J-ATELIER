import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-20 px-4 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <h2 className="font-serif text-2xl tracking-widest mb-6">J ATELIER</h2>
          <p className="text-primary-foreground/70 max-w-sm mb-8 text-sm leading-relaxed">
            Designed for Everyday Comfort. Crafted for Timeless Style. 
            Elevating your everyday wardrobe with intentional pieces.
          </p>
        </div>
        
        <div>
          <h3 className="text-sm uppercase tracking-widest font-semibold mb-6">Shop</h3>
          <ul className="space-y-4 text-sm text-primary-foreground/70">
            <li><Link href="/shop" className="hover:text-primary-foreground transition-colors">All Products</Link></li>
            <li><Link href="/shop?collection=new-arrivals" className="hover:text-primary-foreground transition-colors">New Arrivals</Link></li>
            <li><Link href="/shop?collection=best-sellers" className="hover:text-primary-foreground transition-colors">Best Sellers</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm uppercase tracking-widest font-semibold mb-6">Support</h3>
          <ul className="space-y-4 text-sm text-primary-foreground/70">
            <li><Link href="/faq" className="hover:text-primary-foreground transition-colors">FAQ</Link></li>
            <li><Link href="/returns" className="hover:text-primary-foreground transition-colors">Returns & Exchanges</Link></li>
            <li><Link href="/contact" className="hover:text-primary-foreground transition-colors">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-primary-foreground/10 text-xs text-primary-foreground/50 flex flex-col md:flex-row justify-between items-center">
        <p>&copy; {new Date().getFullYear()} J Atelier. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link href="/privacy" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-primary-foreground transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
