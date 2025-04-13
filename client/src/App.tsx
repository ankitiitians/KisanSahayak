import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import CustomerRegister from "@/pages/CustomerRegister";
import FarmerRegister from "@/pages/FarmerRegister";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import FarmerDashboard from "@/pages/FarmerDashboard";
import CustomerDashboard from "@/pages/CustomerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Messages from "@/pages/Messages";
import AddProduct from "@/pages/AddProduct";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register/customer" component={CustomerRegister} />
      <Route path="/register/farmer" component={FarmerRegister} />
      <Route path="/products" component={Products} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/farmer/dashboard" component={FarmerDashboard} />
      <Route path="/farmer/add-product" component={AddProduct} />
      <Route path="/customer/dashboard" component={CustomerDashboard} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/messages" component={Messages} />
      <Route path="/messages/:userId" component={Messages} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
