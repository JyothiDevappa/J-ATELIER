import { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { Plus, Copy, Trash2, Search, Edit2 } from "lucide-react";
import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon, Coupon, PaginatedCoupons } from "@/lib/couponApi";
import { toast } from "@/hooks/use-toast";

export default function AdminCoupons() {
  const [paginatedData, setPaginatedData] = useState<PaginatedCoupons | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  // Form states
  const [showNew, setShowNew] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "Percentage",
    value: "",
    min_order: "0",
    limit: "",
    expires_at: "",
    active: true,
  });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page };
      if (query) params.query = query;
      if (status) params.status = status;
      
      const data = await fetchCoupons(params);
      setPaginatedData(data);
    } catch (error: any) {
      toast({
        title: "Failed to load coupons",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [page, status]);

  // Debounce query search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadCoupons();
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setValidationErrors({});
    setForm({
      code: "",
      type: "Percentage",
      value: "",
      min_order: "0",
      limit: "",
      expires_at: "",
      active: true,
    });
    setShowNew(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setValidationErrors({});
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      min_order: coupon.min_order.toString(),
      limit: coupon.limit !== null ? coupon.limit.toString() : "",
      expires_at: coupon.expires_at || "",
      active: coupon.active,
    });
    setShowNew(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setValidationErrors({});
    try {
      const payload = {
        code: form.code,
        type: form.type,
        value: parseFloat(form.value),
        min_order: parseFloat(form.min_order),
        limit: form.limit ? parseInt(form.limit) : null,
        expires_at: form.expires_at || null,
        active: form.active,
      };

      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, payload);
        toast({ title: "Coupon updated successfully" });
      } else {
        await createCoupon(payload);
        toast({ title: "Coupon created successfully" });
      }
      setShowNew(false);
      loadCoupons();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
      } else {
        toast({
          title: "Failed to save coupon",
          description: error.response?.data?.message || error.message,
          variant: "destructive"
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await deleteCoupon(id);
      toast({ title: "Coupon deleted successfully" });
      loadCoupons();
    } catch (error: any) {
      toast({
        title: "Failed to delete coupon",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Coupon code copied" });
  };

  const checkExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt + 'T00:00:00') < new Date(new Date().setHours(0,0,0,0));
  };

  const couponsList = paginatedData?.data || [];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl mb-1">Coupons</h1>
            <p className="text-sm text-muted-foreground">
              {paginatedData?.meta.total || 0} coupons in database
            </p>
          </div>
          <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors" data-testid="button-new-coupon">
            <Plus className="w-4 h-4" strokeWidth={1.5} /> Create Coupon
          </button>
        </div>

        {showNew && (
          <div className="bg-card p-6 mb-6">
            <h2 className="font-serif text-xl mb-6">
              {editingCoupon ? "Edit Coupon" : "New Coupon"}
            </h2>
            <form onSubmit={handleSaveCoupon} className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Coupon Code */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Coupon Code</label>
                  <input
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="e.g. SUMMER25"
                    className="w-full bg-transparent border border-border/40 px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                    data-testid="input-new-coupon-code"
                  />
                  {validationErrors.code && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.code[0]}</p>
                  )}
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Discount Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full bg-transparent border border-border/40 px-3 py-2.5 text-sm focus:outline-none focus:border-accent cursor-pointer"
                    data-testid="select-coupon-type"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Discount Value</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    placeholder="e.g. 10 or 50"
                    className="w-full bg-transparent border border-border/40 px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                    data-testid="input-new-coupon-value"
                  />
                  {validationErrors.value && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.value[0]}</p>
                  )}
                </div>

                {/* Min. Order */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Min. Order ($)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.min_order}
                    onChange={(e) => setForm({ ...form, min_order: e.target.value })}
                    placeholder="0"
                    className="w-full bg-transparent border border-border/40 px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                    data-testid="input-new-coupon-minOrder"
                  />
                  {validationErrors.min_order && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.min_order[0]}</p>
                  )}
                </div>

                {/* Max Uses */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Usage Limit (Max Uses)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.limit}
                    onChange={(e) => setForm({ ...form, limit: e.target.value })}
                    placeholder="Leave blank for unlimited"
                    className="w-full bg-transparent border border-border/40 px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                    data-testid="input-new-coupon-maxUses"
                  />
                  {validationErrors.limit && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.limit[0]}</p>
                  )}
                </div>

                {/* Expires */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Expires</label>
                  <input
                    type="date"
                    value={form.expires_at}
                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                    className="w-full bg-transparent border border-border/40 px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                    data-testid="input-new-coupon-expires"
                  />
                  {validationErrors.expires_at && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.expires_at[0]}</p>
                  )}
                </div>

                {/* Active Checkbox */}
                <div className="col-span-2 md:col-span-3 flex items-center gap-2 py-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs uppercase tracking-widest">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                      className="w-4 h-4"
                      data-testid="input-new-coupon-active"
                    />
                    <span>Active / Enabled</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-primary-foreground px-6 py-3 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
                  data-testid="button-save-coupon"
                >
                  {saving ? "Saving..." : "Save Coupon"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNew(false)}
                  className="border border-border/40 px-6 py-3 text-xs uppercase tracking-widest hover:border-accent transition-colors"
                  data-testid="button-cancel-coupon"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-card">
          <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-border/20">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search coupons by code..."
                className="w-full bg-transparent border border-border/40 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                data-testid="input-admin-coupon-search"
              />
            </div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="bg-transparent border border-border/40 px-3 py-2.5 text-sm focus:outline-none focus:border-accent cursor-pointer"
              data-testid="select-admin-coupon-status-filter"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/20">
                {["Code", "Discount", "Type", "Min. Order", "Uses", "Expires", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-widest text-muted-foreground py-3 px-4 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">Loading coupons...</td>
                </tr>
              ) : couponsList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">No coupons found.</td>
                </tr>
              ) : couponsList.map((coupon) => {
                const expired = checkExpired(coupon.expires_at);
                const limitReached = coupon.limit !== null && coupon.used >= coupon.limit;
                const statusLabel = !coupon.active ? "Disabled" : (expired ? "Expired" : (limitReached ? "Limit Reached" : "Active"));
                const statusClass = !coupon.active ? "bg-muted text-muted-foreground" : (expired ? "bg-destructive/10 text-destructive" : (limitReached ? "bg-yellow-500/10 text-yellow-600" : "bg-accent/10 text-accent"));

                return (
                  <tr key={coupon.id} className="hover:bg-card/50 transition-colors" data-testid={`admin-coupon-row-${coupon.code}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono font-medium">{coupon.code}</code>
                        <button onClick={() => handleCopyCode(coupon.code)} className="text-muted-foreground hover:text-foreground transition-colors" data-testid={`button-copy-coupon-${coupon.code}`} aria-label="Copy code">
                          <Copy className="w-3 h-3" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {coupon.type === "Percentage" ? `${coupon.value}%` : `$${coupon.value}`}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{coupon.type}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {coupon.min_order === 0 ? "None" : `$${coupon.min_order}`}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className={limitReached ? "text-destructive" : "text-muted-foreground"}>{coupon.used}</span>
                      <span className="text-muted-foreground">/{coupon.limit !== null ? coupon.limit : "∞"}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{coupon.expires_at || "Never"}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenEdit(coupon)} className="p-1.5 hover:text-accent transition-colors" data-testid={`button-edit-coupon-${coupon.code}`} aria-label="Edit">
                          <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                        <button onClick={() => handleDelete(coupon.id)} className="p-1.5 hover:text-destructive transition-colors" data-testid={`button-delete-coupon-${coupon.code}`} aria-label="Delete">
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex items-center justify-between p-4 border-t border-border/20 text-xs text-muted-foreground">
            <div>
              Showing {paginatedData?.meta.from || 0} to {paginatedData?.meta.to || 0} of {paginatedData?.meta.total || 0} coupons
            </div>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 border border-border/40 hover:border-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[10px] uppercase tracking-widest"
              >
                Previous
              </button>
              <button
                disabled={!paginatedData?.links.next}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 border border-border/40 hover:border-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[10px] uppercase tracking-widest"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
