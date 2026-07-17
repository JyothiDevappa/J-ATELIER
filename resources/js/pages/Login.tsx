import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

type Tab = "login" | "register" | "otp";

export default function Login() {
  const [tab, setTab] = useState<Tab>(() => {
    return window.location.hash === "#register" ? "register" : "login";
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#register") {
        setTab("register");
      } else if (window.location.hash === "#login") {
        setTab("login");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const { login, register } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      setLocation("/");
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        name: `${firstName} ${lastName}`.trim(),
        email: regEmail,
        password: regPassword,
        password_confirmation: regConfirm,
      });
      setLocation("/");
    } catch (err: any) {
      const firstError = Object.values(err.response?.data?.errors || {})[0] as string[];
      setError(firstError?.[0] || err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };
  const handleOtpChange = (val: string, i: number) => {
    const newOtp = [...otp];
    newOtp[i] = val.slice(-1);
    setOtp(newOtp);
    if (val && i < 5) {
      const next = document.getElementById(`otp-${i + 1}`);
      if (next) (next as HTMLInputElement).focus();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 min-h-screen flex">
        {/* Left Image */}
        <div className="hidden lg:block w-1/2 relative">
          <img
            src="https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=1200&q=90"
            alt="J Atelier"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/20" />
          <div className="absolute bottom-16 left-16 text-primary-foreground">
            <p className="font-serif text-4xl mb-2">J ATELIER</p>
            <p className="text-sm text-primary-foreground/70 italic">Designed for Everyday Comfort.</p>
          </div>
        </div>

        {/* Right Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16">
          <div className="w-full max-w-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {tab !== "otp" && (
                <div className="flex gap-8 mb-12">
                  {(["login", "register"] as Tab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTab(t); setError(null); }}
                      className={`text-xs uppercase tracking-widest pb-2 border-b-2 transition-colors ${tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                      data-testid={`tab-${t}`}
                    >
                      {t === "login" ? "Sign In" : "Create Account"}
                    </button>
                  ))}
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-destructive/10 text-destructive text-xs border border-destructive/20 text-center">
                  {error}
                </div>
              )}

              <AnimatePresence mode="wait">
                {tab === "login" && (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onSubmit={handleLogin}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Email Address</label>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors" data-testid="input-login-email" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Password</label>
                      <div className="relative">
                        <input type={showPass ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors pr-10" data-testid="input-login-password" />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" data-testid="button-toggle-password">
                          {showPass ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                        <input type="checkbox" className="w-3.5 h-3.5" data-testid="checkbox-remember" /> Remember me
                      </label>
                      <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors" data-testid="link-forgot-password">Forgot password?</Link>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-4 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50" data-testid="button-login">
                      {loading ? "Signing in..." : "Sign In"}
                    </button>
                    <button type="button" onClick={() => setTab("otp")} className="w-full border border-border/40 py-4 text-xs uppercase tracking-widest hover:border-accent transition-colors" data-testid="button-otp-login">Sign In with OTP</button>
                    <div className="relative text-center">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/20" /></div>
                      <span className="relative bg-background px-4 text-xs text-muted-foreground">or continue with</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" className="border border-border/40 py-3 text-xs uppercase tracking-widest hover:border-accent transition-colors" data-testid="button-google-login">Google</button>
                      <button type="button" className="border border-border/40 py-3 text-xs uppercase tracking-widest hover:border-accent transition-colors" data-testid="button-apple-login">Apple</button>
                    </div>
                  </motion.form>
                )}

                {tab === "register" && (
                  <motion.form
                    key="register"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onSubmit={handleRegister}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">First Name</label>
                        <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors" data-testid="input-register-first-name" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Last Name</label>
                        <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors" data-testid="input-register-last-name" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Email Address</label>
                      <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors" data-testid="input-register-email" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Password</label>
                      <input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors" data-testid="input-register-password" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Confirm Password</label>
                      <input type="password" required value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors" data-testid="input-register-confirm-password" />
                    </div>
                    <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
                      <input type="checkbox" required className="w-3.5 h-3.5 mt-0.5" data-testid="checkbox-terms" />
                      <span>I agree to the <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link></span>
                    </label>
                    <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-4 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50" data-testid="button-register">
                      {loading ? "Creating Account..." : "Create Account"}
                    </button>
                  </motion.form>
                )}

                {tab === "otp" && (
                  <motion.div key="otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div className="mb-8">
                      <h2 className="font-serif text-2xl mb-2">Enter Verification Code</h2>
                      <p className="text-sm text-muted-foreground">We sent a 6-digit code to your email address.</p>
                    </div>
                    <div className="flex gap-2 mb-8">
                      {otp.map((val, i) => (
                        <input
                          key={i}
                          id={`otp-${i}`}
                          type="text"
                          maxLength={1}
                          value={val}
                          onChange={(e) => handleOtpChange(e.target.value, i)}
                          className="w-12 h-14 text-center text-lg border border-border/40 focus:outline-none focus:border-accent transition-colors bg-transparent"
                          data-testid={`input-otp-${i}`}
                        />
                      ))}
                    </div>
                    <button className="w-full bg-primary text-primary-foreground py-4 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors mb-4" data-testid="button-verify-otp">Verify Code</button>
                    <button onClick={() => setTab("login")} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors" data-testid="button-back-to-login">Back to Sign In</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
