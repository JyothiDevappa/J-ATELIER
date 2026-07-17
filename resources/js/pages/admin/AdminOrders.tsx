import { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { Search, Download, X, Calendar, User, Truck, CreditCard } from "lucide-react";
import { fetchAdminOrders, fetchAdminOrderDetails, updateOrderStatus, AdminOrder, PaginatedOrders } from "@/lib/orderApi";
import { toast } from "@/hooks/use-toast";

const STATUS_STYLES: Record<string, string> = {
  Processing: "bg-accent/10 text-accent",
  Shipped: "bg-muted text-muted-foreground",
  Delivered: "bg-card text-foreground",
  Cancelled: "bg-destructive/10 text-destructive",
};

const STATUSES = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [paginatedData, setPaginatedData] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);

  // Order Detail Modal states
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page };
      if (query) params.query = query;
      if (status !== "All") params.status = status;

      const data = await fetchAdminOrders(params);
      setPaginatedData(data);
    } catch (error: any) {
      toast({
        title: "Failed to load orders",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, status]);

  // Debounce search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadOrders();
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handleOrderClick = async (orderId: number) => {
    setSelectedOrderId(orderId);
    setLoadingDetails(true);
    try {
      const data = await fetchAdminOrderDetails(orderId);
      setSelectedOrder(data);
    } catch (error: any) {
      toast({
        title: "Failed to load order details",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const updated = await updateOrderStatus(selectedOrder.id, newStatus);
      setSelectedOrder(updated);
      toast({
        title: "Order status updated",
        description: `Order ${updated.order_number} status is now ${newStatus}.`,
      });
      loadOrders();
    } catch (error: any) {
      toast({
        title: "Failed to update order status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const ordersList = paginatedData?.data || [];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl mb-1">Orders</h1>
            <p className="text-sm text-muted-foreground">{paginatedData?.meta?.total || 0} orders total</p>
          </div>
          <button className="flex items-center gap-2 border border-border/40 text-foreground px-5 py-3 text-xs uppercase tracking-widest hover:border-accent transition-colors" data-testid="button-export-orders">
            <Download className="w-4 h-4" strokeWidth={1.5} /> Export CSV
          </button>
        </div>

        <div className="bg-card">
          <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-border/20 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by order or customer..."
                className="w-full bg-transparent border border-border/40 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                data-testid="input-admin-order-search"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatus(s); setPage(1); }}
                  className={`px-3 py-1.5 text-[10px] uppercase tracking-widest transition-colors ${status === s ? "bg-primary text-primary-foreground" : "border border-border/40 text-muted-foreground hover:border-accent"}`}
                  data-testid={`filter-status-${s.toLowerCase()}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/20">
                {["Order ID", "Customer", "Date", "Items", "Amount", "Method", "Status"].map((h) => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-widest text-muted-foreground py-3 px-4 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">Loading orders...</td>
                </tr>
              ) : ordersList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">No orders found.</td>
                </tr>
              ) : ordersList.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => handleOrderClick(order.id)}
                  className="hover:bg-card/50 transition-colors cursor-pointer"
                  data-testid={`admin-order-row-${order.id}`}
                >
                  <td className="py-3 px-4 text-xs font-mono text-muted-foreground">#{order.order_number}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium">{order.first_name} {order.last_name}</p>
                    <p className="text-xs text-muted-foreground">{order.email}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-4">{order.items.reduce((acc, it) => acc + it.quantity, 0)}</td>
                  <td className="py-3 px-4 font-medium">${order.total}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground capitalize">{order.delivery_method.replace(/-/g, " ")}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${STATUS_STYLES[order.status] || ""}`}>{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between p-4 border-t border-border/20 text-xs text-muted-foreground">
            <div>
              Showing {paginatedData?.meta?.from || 0} to {paginatedData?.meta?.to || 0} of {paginatedData?.meta?.total || 0} orders
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

      {/* Order Details Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-background border border-border w-full max-w-4xl p-8 max-h-[90vh] overflow-y-auto space-y-6 relative">
            <button
              onClick={() => { setSelectedOrderId(null); setSelectedOrder(null); }}
              className="absolute top-6 right-6 p-1 hover:bg-card/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {loadingDetails ? (
              <div className="py-20 text-center text-sm text-muted-foreground">
                Loading order details...
              </div>
            ) : !selectedOrder ? (
              <div className="py-20 text-center text-sm text-muted-foreground">
                Order details could not be loaded.
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/20 pb-6">
                  <div>
                    <h2 className="font-serif text-2xl mb-1">Order #{selectedOrder.order_number}</h2>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(selectedOrder.created_at).toLocaleString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Status:</span>
                    <select
                      value={selectedOrder.status}
                      disabled={updatingStatus}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="bg-transparent border border-border/40 px-3 py-2 text-xs uppercase tracking-widest focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Items List */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold border-b border-border/10 pb-2">Items Ordered</h3>
                    <div className="divide-y divide-border/10">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="py-4 flex gap-4">
                          <img
                            src={item.product?.images?.[0]}
                            alt={item.product?.name}
                            className="w-16 h-20 object-cover bg-card flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">{item.product?.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Size: {item.size} &middot; Color: {item.color}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              ${item.price} &times; {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer and Summary Information */}
                  <div className="space-y-6">
                    {/* Customer info */}
                    <div className="border border-border/40 p-4 bg-card/20 space-y-3">
                      <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2 pb-1 border-b border-border/10">
                        <User className="w-3.5 h-3.5" /> Customer Details
                      </h4>
                      <div className="text-xs space-y-1">
                        <p className="font-medium text-sm">{selectedOrder.first_name} {selectedOrder.last_name}</p>
                        <p className="text-muted-foreground">{selectedOrder.email}</p>
                        <p className="text-muted-foreground">{selectedOrder.phone}</p>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="border border-border/40 p-4 bg-card/20 space-y-3">
                      <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2 pb-1 border-b border-border/10">
                        <Truck className="w-3.5 h-3.5" /> Shipping Address
                      </h4>
                      <div className="text-xs space-y-1 text-muted-foreground">
                        <p className="text-foreground">{selectedOrder.address}</p>
                        <p>{selectedOrder.city}, {selectedOrder.postcode}</p>
                        <p className="uppercase tracking-wide">{selectedOrder.country}</p>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="border border-border/40 p-4 bg-card/20 space-y-3">
                      <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2 pb-1 border-b border-border/10">
                        <CreditCard className="w-3.5 h-3.5" /> Summary
                      </h4>
                      <div className="text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>${parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Delivery Cost</span>
                          <span>${parseFloat(selectedOrder.delivery_cost).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-border/20 pt-2 font-medium text-sm">
                          <span>Total</span>
                          <span>${parseFloat(selectedOrder.total).toFixed(2)}</span>
                        </div>
                      </div>
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
