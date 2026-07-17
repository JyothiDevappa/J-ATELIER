import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import { AuthProvider } from "@/context/AuthContext";
import { StoreSettingProvider } from "@/context/StoreSettingContext";

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
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";

import Dashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminCoupons from "@/pages/admin/AdminCoupons";
import AdminInventory from "@/pages/admin/AdminInventory";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminShopByColor from "@/pages/admin/AdminShopByColor";
import AdminInstagramGallery from "@/pages/admin/AdminInstagramGallery";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/shop/color/:color" component={ColorCollection} />
      <Route path="/product/:slug" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-confirmation" component={OrderConfirmation} />
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin">
        <AdminProtectedRoute>
          <Dashboard />
        </AdminProtectedRoute>
      </Route>
      <Route path="/admin/products">
        <AdminProtectedRoute>
          <AdminProducts />
        </AdminProtectedRoute>
      </Route>
      <Route path="/admin/orders">
        <AdminProtectedRoute>
          <AdminOrders />
        </AdminProtectedRoute>
      </Route>
      <Route path="/admin/customers">
        <AdminProtectedRoute>
          <AdminCustomers />
        </AdminProtectedRoute>
      </Route>
      <Route path="/admin/analytics">
        <AdminProtectedRoute>
          <AdminAnalytics />
        </AdminProtectedRoute>
      </Route>
      <Route path="/admin/coupons">
        <AdminProtectedRoute>
          <AdminCoupons />
        </AdminProtectedRoute>
      </Route>
      <Route path="/admin/inventory">
        <AdminProtectedRoute>
          <AdminInventory />
        </AdminProtectedRoute>
      </Route>
      <Route path="/admin/settings">
        <AdminProtectedRoute>
          <AdminSettings />
        </AdminProtectedRoute>
      </Route>
      <Route path="/admin/shop-by-color">
        <AdminProtectedRoute>
          <AdminShopByColor />
        </AdminProtectedRoute>
      </Route>
      <Route path="/admin/instagram-gallery">
        <AdminProtectedRoute>
          <AdminInstagramGallery />
        </AdminProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreSettingProvider>
        <AuthProvider>
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
        </AuthProvider>
      </StoreSettingProvider>
    </QueryClientProvider>
  );
}

export default App;
