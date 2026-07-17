import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useStoreSetting } from "@/context/StoreSettingContext";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { adminLogin, user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { settings } = useStoreSetting();

  // Already authenticated admin → redirect to dashboard
  useEffect(() => {
    if (!isLoading && user?.is_admin) {
      setLocation("/admin");
    }
  }, [user, isLoading, setLocation]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminLogin({ username, password });
      setLocation("/admin");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.username?.[0] ||
        "The provided credentials do not match our records or you do not have admin access."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - Premium dark brand banner */}
      <div className="hidden lg:flex w-1/2 bg-sidebar border-r border-sidebar-border flex-col justify-between p-16 text-sidebar-foreground">
        <div>
          <span className="font-serif text-2xl tracking-widest text-sidebar-foreground">
            {(settings.store_name ?? "J ATELIER").toUpperCase()}
          </span>
          <p className="text-[10px] uppercase tracking-[0.25em] text-sidebar-foreground/40 mt-2">
            Management Portal
          </p>
        </div>
        <div className="max-w-md">
          <p className="font-serif text-4xl leading-tight mb-4 text-sidebar-foreground font-light italic">
            "Details make perfection, and perfection is not a detail."
          </p>
          <p className="text-xs uppercase tracking-widest text-sidebar-foreground/45">
            — J
          </p>
        </div>
        <div className="text-xs text-sidebar-foreground/30 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} J Atelier. All rights reserved.
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="font-serif text-3xl md:text-4xl text-foreground font-light mb-2">
              Admin Access
            </h1>
            <p className="text-sm text-muted-foreground">
              Please enter your dashboard credentials to proceed.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs uppercase tracking-wider">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                Username or Email
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-foreground"
                placeholder="admin"
                data-testid="input-admin-username"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border border-border/40 pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-foreground"
                  placeholder="••••••••"
                  data-testid="input-admin-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors duration-300 disabled:opacity-50 mt-8"
              data-testid="button-admin-login"
            >
              {loading ? "Authenticating…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
