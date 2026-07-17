import { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { useStoreSetting } from "@/context/StoreSettingContext";
import { toast } from "@/hooks/use-toast";
import { StoreSettings, SecurityPayload, updateSecurity } from "@/lib/settingsApi";

export default function AdminSettings() {
  const [tab, setTab] = useState<"general" | "shipping" | "notifications" | "security">("general");
  const { settings, updateSettings } = useStoreSetting();

  // Local form state for the General tab
  const [form, setForm] = useState<StoreSettings>({
    store_name: settings.store_name,
    store_url: settings.store_url,
    support_email: settings.support_email,
    currency: settings.currency,
  });
  const [saving, setSaving] = useState(false);

  // Sync form when context settings load/change
  useEffect(() => {
    setForm({
      store_name: settings.store_name,
      store_url: settings.store_url,
      support_email: settings.support_email,
      currency: settings.currency,
    });
  }, [settings]);

  const handleChange = (key: keyof StoreSettings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(form);
      toast({ title: "Settings saved", description: "Store information has been updated." });
    } catch (err: any) {
      toast({
        title: "Failed to save",
        description: err?.response?.data?.message ?? err?.message ?? "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Local form state for the Security tab
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingSecurity, setUpdatingSecurity] = useState(false);

  const handleSaveSecurity = async () => {
    if (!currentPassword) {
      toast({
        title: "Current Password Required",
        description: "Please enter your current password to authenticate the change.",
        variant: "destructive",
      });
      return;
    }

    const wantsEmail    = newEmail.trim().length > 0;
    const wantsPassword = newPassword.length > 0;

    if (!wantsEmail && !wantsPassword) {
      toast({
        title: "Nothing to Update",
        description: "Please enter a new email, a new password, or both.",
        variant: "destructive",
      });
      return;
    }

    if (wantsEmail && newEmail !== confirmEmail) {
      toast({
        title: "Email Mismatch",
        description: "The email confirmation does not match the new email.",
        variant: "destructive",
      });
      return;
    }

    if (wantsPassword && newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "The password confirmation does not match the new password.",
        variant: "destructive",
      });
      return;
    }

    setUpdatingSecurity(true);
    try {
      const payload: SecurityPayload = { current_password: currentPassword };
      if (wantsEmail)    { payload.new_email = newEmail; payload.confirm_email = confirmEmail; }
      if (wantsPassword) { payload.new_password = newPassword; payload.confirm_password = confirmPassword; }

      const result = await updateSecurity(payload);
      toast({
        title: "Security updated",
        description: result.message ?? "Your administrator credentials have been updated.",
      });
      // Clear all fields after success
      setCurrentPassword("");
      setNewEmail("");
      setConfirmEmail("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({
        title: "Failed to update security",
        description: err?.response?.data?.message ?? err?.message ?? "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setUpdatingSecurity(false);
    }
  };

  const tabs = [
    { id: "general", label: "General" },
    { id: "shipping", label: "Shipping" },
    { id: "notifications", label: "Notifications" },
    { id: "security", label: "Security" },
  ] as const;

  const generalFields: { label: string; key: keyof StoreSettings; type?: string }[] = [
    { label: "Store Name",    key: "store_name" },
    { label: "Store URL",     key: "store_url" },
    { label: "Support Email", key: "support_email", type: "email" },
    { label: "Currency",      key: "currency" },
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl mb-1">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage store configuration</p>
        </div>

        <div className="flex gap-2 mb-8 border-b border-border/20">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-xs uppercase tracking-widest transition-colors border-b-2 -mb-px ${tab === t.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              data-testid={`tab-settings-${t.id}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "general" && (
          <div className="bg-card p-8 space-y-6 max-w-2xl">
            <h2 className="font-serif text-xl">Store Information</h2>
            {generalFields.map((field) => (
              <div key={field.key}>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  {field.label}
                </label>
                <input
                  type={field.type ?? "text"}
                  value={form[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                  data-testid={`input-setting-${field.label.toLowerCase().replace(/\s+/g, "-")}`}
                />
              </div>
            ))}
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-primary-foreground px-8 py-3 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
              data-testid="button-save-general"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        )}

        {tab === "shipping" && (
          <div className="bg-card p-8 space-y-6 max-w-2xl">
            <h2 className="font-serif text-xl">Shipping Rates</h2>
            {[
              { label: "Standard Delivery (3–5 days)", defaultValue: "15.00" },
              { label: "Express Delivery (1–2 days)", defaultValue: "28.00" },
              { label: "Overnight Delivery", defaultValue: "45.00" },
              { label: "Free Shipping Threshold ($)", defaultValue: "300.00" },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{field.label}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <input
                    type="number"
                    defaultValue={field.defaultValue}
                    className="w-full bg-transparent border border-border/40 pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                    data-testid={`input-shipping-${field.label.toLowerCase().replace(/\s+/g, "-")}`}
                  />
                </div>
              </div>
            ))}
            <button className="bg-primary text-primary-foreground px-8 py-3 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors" data-testid="button-save-shipping">Save Changes</button>
          </div>
        )}

        {tab === "notifications" && (
          <div className="bg-card p-8 max-w-2xl">
            <h2 className="font-serif text-xl mb-6">Email Notifications</h2>
            <div className="space-y-4">
              {[
                { label: "New order received", description: "Get notified immediately when a new order is placed" },
                { label: "Order shipped", description: "Notification when tracking is added to an order" },
                { label: "Low stock alert", description: "Alert when product stock falls below threshold" },
                { label: "New customer registered", description: "When a new account is created" },
                { label: "Review submitted", description: "When a customer leaves a product review" },
              ].map((notif) => (
                <label key={notif.label} className="flex items-start gap-4 py-4 border-b border-border/20 last:border-0 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 mt-0.5 flex-shrink-0" data-testid={`checkbox-notif-${notif.label.toLowerCase().replace(/\s+/g, "-")}`} />
                  <div>
                    <p className="text-sm font-medium">{notif.label}</p>
                    <p className="text-xs text-muted-foreground">{notif.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {tab === "security" && (
          <div className="bg-card p-8 space-y-6 max-w-2xl">
            <h2 className="font-serif text-xl">Security Settings</h2>

            {/* ─── Authentication proof ─── */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Required to authorise any change"
                className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/30"
                data-testid="input-current-password"
              />
            </div>

            {/* ─── Update Login Email ─── */}
            <div className="pt-2 border-t border-border/20">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-4">Update Login Email — leave blank to keep current</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">New Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. newadmin@example.com"
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/30"
                    data-testid="input-new-email"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Confirm New Email</label>
                  <input
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder="Re-enter new email"
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/30"
                    data-testid="input-confirm-email"
                  />
                </div>
              </div>
            </div>

            {/* ─── Update Password ─── */}
            <div className="pt-2 border-t border-border/20">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-4">Update Password — leave blank to keep current</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/30"
                    data-testid="input-new-password"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/30"
                    data-testid="input-confirm-password"
                  />
                </div>
              </div>
            </div>

            {/* ─── 2FA placeholder ─── */}
            <div className="pt-4 border-t border-border/20">
              <label className="flex items-start gap-3 cursor-pointer mb-4">
                <input type="checkbox" className="w-4 h-4 mt-0.5" data-testid="checkbox-2fa" />
                <div>
                  <p className="text-sm font-medium">Enable Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Recommended for admin account security</p>
                </div>
              </label>
            </div>

            <button
              onClick={handleSaveSecurity}
              disabled={updatingSecurity}
              className="bg-primary text-primary-foreground px-8 py-3 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
              data-testid="button-save-security"
            >
              {updatingSecurity ? "Updating…" : "Update Security"}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
