import { useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Plus, Copy, Trash2 } from "lucide-react";

const COUPONS = [
  { code: "WELCOME10", discount: "10%", type: "Percentage", minOrder: 0, uses: 142, maxUses: 500, expires: "31 Mar 2025", active: true },
  { code: "VIP20", discount: "20%", type: "Percentage", minOrder: 300, uses: 38, maxUses: 100, expires: "28 Feb 2025", active: true },
  { code: "FREESHIP", discount: "Free Shipping", type: "Shipping", minOrder: 150, uses: 89, maxUses: 200, expires: "15 Mar 2025", active: true },
  { code: "SAVE50", discount: "$50", type: "Fixed", minOrder: 250, uses: 200, maxUses: 200, expires: "31 Jan 2025", active: false },
  { code: "SPRING25", discount: "25%", type: "Percentage", minOrder: 200, uses: 0, maxUses: 150, expires: "30 Jun 2025", active: true },
];

export default function AdminCoupons() {
  const [showNew, setShowNew] = useState(false);
  const [newCode, setNewCode] = useState({ code: "", discount: "", type: "Percentage", minOrder: "0", maxUses: "100", expires: "" });

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl mb-1">Coupons</h1>
            <p className="text-sm text-muted-foreground">{COUPONS.filter((c) => c.active).length} active promotions</p>
          </div>
          <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors" data-testid="button-new-coupon">
            <Plus className="w-4 h-4" strokeWidth={1.5} /> Create Coupon
          </button>
        </div>

        {showNew && (
          <div className="bg-card p-6 mb-6">
            <h2 className="font-serif text-xl mb-6">New Coupon</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Coupon Code", key: "code", placeholder: "e.g. SUMMER25" },
                { label: "Discount Value", key: "discount", placeholder: "e.g. 25% or $50" },
                { label: "Min. Order ($)", key: "minOrder", placeholder: "0" },
                { label: "Max Uses", key: "maxUses", placeholder: "100" },
                { label: "Expires", key: "expires", placeholder: "", type: "date" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{field.label}</label>
                  <input
                    type={field.type || "text"}
                    value={newCode[field.key as keyof typeof newCode]}
                    onChange={(e) => setNewCode({ ...newCode, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full bg-transparent border border-border/40 px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                    data-testid={`input-new-coupon-${field.key}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="bg-primary text-primary-foreground px-6 py-3 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors" data-testid="button-save-coupon">Save Coupon</button>
              <button onClick={() => setShowNew(false)} className="border border-border/40 px-6 py-3 text-xs uppercase tracking-widest hover:border-accent transition-colors" data-testid="button-cancel-coupon">Cancel</button>
            </div>
          </div>
        )}

        <div className="bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/20">
                {["Code", "Discount", "Type", "Min. Order", "Uses", "Expires", "Status", ""].map((h) => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-widest text-muted-foreground py-3 px-4 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {COUPONS.map((coupon) => (
                <tr key={coupon.code} className="hover:bg-card/50 transition-colors" data-testid={`admin-coupon-row-${coupon.code}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono font-medium">{coupon.code}</code>
                      <button className="text-muted-foreground hover:text-foreground transition-colors" data-testid={`button-copy-coupon-${coupon.code}`} aria-label="Copy code">
                        <Copy className="w-3 h-3" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">{coupon.discount}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{coupon.type}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{coupon.minOrder === 0 ? "None" : `$${coupon.minOrder}`}</td>
                  <td className="py-3 px-4 text-xs">
                    <span className={coupon.uses >= coupon.maxUses ? "text-destructive" : "text-muted-foreground"}>{coupon.uses}</span>
                    <span className="text-muted-foreground">/{coupon.maxUses}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{coupon.expires}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${coupon.active ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                      {coupon.active ? "Active" : "Expired"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="p-1 hover:text-destructive transition-colors" data-testid={`button-delete-coupon-${coupon.code}`} aria-label="Delete">
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
