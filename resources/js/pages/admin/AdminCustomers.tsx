import { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { Search, X, Calendar, User, MapPin, CreditCard, ShoppingBag } from "lucide-react";
import { fetchAdminCustomers, fetchCustomerDetails, AdminCustomer, PaginatedCustomers, CustomerDetails } from "@/lib/customerApi";
import { toast } from "@/hooks/use-toast";

const TIER_STYLES: Record<string, string> = {
  VIP: "bg-accent/10 text-accent",
  Regular: "bg-muted text-muted-foreground",
  New: "bg-card text-foreground",
};

const STATUS_STYLES: Record<string, string> = {
  Processing: "bg-accent/10 text-accent",
  Shipped: "bg-muted text-muted-foreground",
  Delivered: "bg-card text-foreground",
  Cancelled: "bg-destructive/10 text-destructive",
};

export default function AdminCustomers() {
  const [paginatedData, setPaginatedData] = useState<PaginatedCustomers | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  // Customer Detail Modal states
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, sort: sortBy };
      if (query) params.query = query;

      const data = await fetchAdminCustomers(params);
      setPaginatedData(data);
    } catch (error: any) {
      toast({
        title: "Failed to load customers",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [page, sortBy]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadCustomers();
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handleCustomerClick = async (customerId: number) => {
    setSelectedCustomerId(customerId);
    setLoadingDetails(true);
    try {
      const data = await fetchCustomerDetails(customerId);
      setSelectedCustomer(data);
    } catch (error: any) {
      toast({
        title: "Failed to load customer details",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const customersList = paginatedData?.data || [];
  const headerStats = paginatedData?.header || {
    vip_count: 0,
    total_spent: 0,
    avg_lifetime_value: 0,
    total_customers: 0,
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl mb-1">Customers</h1>
          <p className="text-sm text-muted-foreground">
            {headerStats.total_customers} registered customers
          </p>
        </div>

        {/* Aggregate metric cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card p-6 text-center">
            <p className="font-serif text-2xl mb-1">{headerStats.vip_count}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">VIP Members</p>
          </div>
          <div className="bg-card p-6 text-center">
            <p className="font-serif text-2xl mb-1">
              ${headerStats.total_spent.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Total Revenue</p>
          </div>
          <div className="bg-card p-6 text-center">
            <p className="font-serif text-2xl mb-1">
              ${headerStats.avg_lifetime_value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Avg. Lifetime Value</p>
          </div>
        </div>

        <div className="bg-card">
          <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-border/20 items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search customers..."
                className="w-full bg-transparent border border-border/40 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                data-testid="input-admin-customer-search"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="bg-transparent border border-border/40 px-3 py-2.5 text-sm focus:outline-none focus:border-accent cursor-pointer"
              data-testid="select-admin-customer-sort"
            >
              <option value="newest">Newest Customers</option>
              <option value="oldest">Oldest Customers</option>
              <option value="highest_spending">Highest Spending</option>
              <option value="most_orders">Most Orders</option>
            </select>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/20">
                {["Customer", "Joined", "Orders", "Total Spent", "Tier"].map((h) => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-widest text-muted-foreground py-3 px-4 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">Loading customers...</td>
                </tr>
              ) : customersList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No customers found.</td>
                </tr>
              ) : customersList.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => handleCustomerClick(c.id)}
                  className="hover:bg-card/50 transition-colors cursor-pointer"
                  data-testid={`admin-customer-row-${c.id}`}
                >
                  <td className="py-3 px-4">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{c.joined}</td>
                  <td className="py-3 px-4">{c.orders}</td>
                  <td className="py-3 px-4 font-medium">
                    ${c.spent.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${TIER_STYLES[c.tier] || ""}`}>{c.tier}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between p-4 border-t border-border/20 text-xs text-muted-foreground">
            <div>
              Showing {paginatedData?.meta?.from || 0} to {paginatedData?.meta?.to || 0} of {paginatedData?.meta?.total || 0} customers
            </div>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border border-border/40 hover:border-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[10px] uppercase tracking-widest"
              >
                Previous
              </button>
              <button
                disabled={!paginatedData?.links?.next}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-border/40 hover:border-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[10px] uppercase tracking-widest"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-background border border-border w-full max-w-4xl p-8 max-h-[90vh] overflow-y-auto space-y-6 relative">
            <button
              onClick={() => { setSelectedCustomerId(null); setSelectedCustomer(null); }}
              className="absolute top-6 right-6 p-1 hover:bg-card/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {loadingDetails ? (
              <div className="py-20 text-center text-sm text-muted-foreground">
                Loading customer details...
              </div>
            ) : !selectedCustomer ? (
              <div className="py-20 text-center text-sm text-muted-foreground">
                Customer details could not be loaded.
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start border-b border-border/20 pb-6">
                  <div>
                    <h2 className="font-serif text-2xl mb-1">{selectedCustomer.user.name}</h2>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Joined on {selectedCustomer.user.joined}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Order History */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold border-b border-border/10 pb-2">Order History</h3>
                    {selectedCustomer.user.orders.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-4">No order history available for this customer.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/10 text-[10px] uppercase text-muted-foreground">
                            <th className="text-left py-2 font-normal">Order</th>
                            <th className="text-left py-2 font-normal">Date</th>
                            <th className="text-left py-2 font-normal">Items</th>
                            <th className="text-left py-2 font-normal">Amount</th>
                            <th className="text-left py-2 font-normal">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/10 text-xs">
                          {selectedCustomer.user.orders.map((ord) => (
                            <tr key={ord.id}>
                              <td className="py-3 font-mono">#{ord.order_number}</td>
                              <td className="py-3 text-muted-foreground">{ord.date}</td>
                              <td className="py-3">{ord.items_count}</td>
                              <td className="py-3 font-medium">${ord.total.toFixed(2)}</td>
                              <td className="py-3">
                                <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 ${STATUS_STYLES[ord.status] || ""}`}>
                                  {ord.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Sidebar Stats and Address Details */}
                  <div className="space-y-6">
                    {/* Metrics Summary */}
                    <div className="border border-border/40 p-4 bg-card/20 space-y-3">
                      <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2 pb-1 border-b border-border/10">
                        <CreditCard className="w-3.5 h-3.5" /> Customer Overview
                      </h4>
                      <div className="text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Orders</span>
                          <span>{selectedCustomer.stats.total_orders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Spending</span>
                          <span>
                            ${selectedCustomer.stats.total_spent.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-border/25 pt-2 font-medium">
                          <span className="text-muted-foreground">Last Order Date</span>
                          <span>{selectedCustomer.stats.last_order_date || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Profile details contact */}
                    <div className="border border-border/40 p-4 bg-card/20 space-y-3">
                      <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2 pb-1 border-b border-border/10">
                        <User className="w-3.5 h-3.5" /> Contact Details
                      </h4>
                      <div className="text-xs space-y-1">
                        <p className="font-medium">Email</p>
                        <p className="text-muted-foreground mb-2">{selectedCustomer.user.email}</p>
                        <p className="font-medium">Phone</p>
                        <p className="text-muted-foreground">{selectedCustomer.user.phone}</p>
                      </div>
                    </div>

                    {/* Saved Addresses */}
                    <div className="border border-border/40 p-4 bg-card/20 space-y-3">
                      <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2 pb-1 border-b border-border/10">
                        <MapPin className="w-3.5 h-3.5" /> Saved Addresses
                      </h4>
                      {selectedCustomer.user.addresses.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No addresses saved.</p>
                      ) : (
                        <div className="space-y-3 divide-y divide-border/10 max-h-40 overflow-y-auto">
                          {selectedCustomer.user.addresses.map((adr, index) => (
                            <div key={adr.id} className={`text-xs space-y-1 ${index > 0 ? "pt-2" : ""}`}>
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-foreground">
                                  {adr.first_name} {adr.last_name}
                                </span>
                                {adr.is_default && (
                                  <span className="text-[8px] uppercase tracking-widest px-1 py-0.5 bg-accent/15 text-accent">Default</span>
                                )}
                              </div>
                              <p className="text-muted-foreground">{adr.address}</p>
                              <p className="text-muted-foreground">{adr.city}, {adr.postcode}</p>
                              <p className="text-muted-foreground uppercase">{adr.country}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
