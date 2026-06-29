import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";

import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import Profile from "@/pages/Profile";
import Wishlist from "@/pages/Wishlist";
import ColorCollection from "@/pages/ColorCollection";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminCoupons from "@/pages/admin/AdminCoupons";
import AdminInventory from "@/pages/admin/AdminInventory";
import AdminSettings from "@/pages/admin/AdminSettings";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/shop/color/:color" component={ColorCollection} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-confirmation" component={OrderConfirmation} />
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/profile" component={Profile} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/admin" component={Dashboard} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/customers" component={AdminCustomers} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/coupons" component={AdminCoupons} />
      <Route path="/admin/inventory" component={AdminInventory} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <WishlistProvider>
          <RecentlyViewedProvider>
            <TooltipProvider>
              <Router />
              <Toaster />
            </TooltipProvider>
          </RecentlyViewedProvider>
        </WishlistProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
