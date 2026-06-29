import { useState } from "react";
import { AdminLayout } from "./AdminLayout";

export default function AdminSettings() {
  const [tab, setTab] = useState<"general" | "shipping" | "notifications" | "security">("general");

  const tabs = [
    { id: "general", label: "General" },
    { id: "shipping", label: "Shipping" },
    { id: "notifications", label: "Notifications" },
    { id: "security", label: "Security" },
  ] as const;

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
            {[
              { label: "Store Name", defaultValue: "J Atelier" },
              { label: "Store URL", defaultValue: "jatelier.com" },
              { label: "Support Email", defaultValue: "hello@jatelier.com" },
              { label: "Currency", defaultValue: "USD" },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{field.label}</label>
                <input
                  defaultValue={field.defaultValue}
                  className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                  data-testid={`input-setting-${field.label.toLowerCase().replace(/\s+/g, "-")}`}
                />
              </div>
            ))}
            <button className="bg-primary text-primary-foreground px-8 py-3 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors" data-testid="button-save-general">Save Changes</button>
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
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Current Password</label>
              <input type="password" className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors" data-testid="input-current-password" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">New Password</label>
              <input type="password" className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors" data-testid="input-new-password" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Confirm New Password</label>
              <input type="password" className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors" data-testid="input-confirm-password" />
            </div>
            <div className="pt-4 border-t border-border/20">
              <label className="flex items-start gap-3 cursor-pointer mb-4">
                <input type="checkbox" className="w-4 h-4 mt-0.5" data-testid="checkbox-2fa" />
                <div>
                  <p className="text-sm font-medium">Enable Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Recommended for admin account security</p>
                </div>
              </label>
            </div>
            <button className="bg-primary text-primary-foreground px-8 py-3 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors" data-testid="button-save-security">Update Security</button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
