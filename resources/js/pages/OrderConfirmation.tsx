import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function OrderConfirmation() {
  const orderNumber = typeof window !== 'undefined' ? (sessionStorage.getItem("last_order_number") || `JA-${Math.floor(100000 + Math.random() * 900000)}`) : `JA-${Math.floor(100000 + Math.random() * 900000)}`;
  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl w-full text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              className="mb-8 flex justify-center"
            >
              <CheckCircle className="w-16 h-16 text-accent" strokeWidth={1} />
            </motion.div>

            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Order Confirmed</p>
            <h1 className="font-serif text-4xl md:text-5xl mb-4">Thank You</h1>
            <p className="text-base text-muted-foreground mb-10 leading-relaxed">
              Your order has been received and is being prepared with care.
              You will receive a confirmation email shortly.
            </p>

            <div className="bg-card p-8 mb-10 text-left space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order Number</span>
                <span className="font-medium" data-testid="text-order-number">{orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Delivery</span>
                <span>{estimatedDelivery}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="text-accent">Processing</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/profile"
                className="flex-1 border border-border/40 py-4 text-xs uppercase tracking-widest hover:border-accent transition-colors text-center"
                data-testid="link-view-orders"
              >
                View Orders
              </Link>
              <Link
                href="/shop"
                className="flex-1 bg-primary text-primary-foreground py-4 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                data-testid="link-continue-shopping-confirmation"
              >
                Continue Shopping
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
