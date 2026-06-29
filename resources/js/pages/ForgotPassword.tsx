import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 min-h-screen flex items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <Link href="/login" className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-10" data-testid="link-back-to-login">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>

          {!sent ? (
            <>
              <div className="mb-10">
                <h1 className="font-serif text-3xl mb-3">Reset Password</h1>
                <p className="text-sm text-muted-foreground">Enter your email address and we'll send you a link to reset your password.</p>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-5">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                    data-testid="input-forgot-email"
                  />
                </div>
                <button type="submit" className="w-full bg-primary text-primary-foreground py-4 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors" data-testid="button-reset-password">Send Reset Link</button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <CheckCircle className="w-12 h-12 text-accent mx-auto mb-6" strokeWidth={1} />
              <h2 className="font-serif text-2xl mb-4">Check your inbox</h2>
              <p className="text-sm text-muted-foreground mb-8">We've sent a reset link to <span className="text-foreground">{email}</span></p>
              <Link href="/login" className="text-xs uppercase tracking-widest border-b border-foreground hover:text-accent hover:border-accent transition-colors" data-testid="link-return-login">Return to Sign In</Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
