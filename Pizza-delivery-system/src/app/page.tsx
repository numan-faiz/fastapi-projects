'use client';

import { useEffect, useState } from 'react';
import { useAuthStore, hydrateAuth } from '@/store/auth';
import { LoginForm } from '@/components/auth/login-form';
import { SignupForm } from '@/components/auth/signup-form';
import { Header } from '@/components/layout/header';
import { MyOrders } from '@/components/orders/my-orders';
import { AdminOrders } from '@/components/orders/admin-orders';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { OrderForm } from '@/components/orders/order-form';
import { Pizza, PlusCircle, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const { view, name, username, isStaff, setView } = useAuthStore();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [mounted, setMounted] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [ordersKey, setOrdersKey] = useState(0);

  useEffect(() => {
    hydrateAuth();
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const refreshOrders = () => setOrdersKey((k) => k + 1);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center animate-pulse">
          <Pizza className="w-8 h-8 text-white" />
        </div>
      </div>
    );
  }

  // Auth View
  if (!username) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-amber-50">
        {/* Auth Background Decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-100/20 rounded-full blur-3xl" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-4">
          {/* Hero Brand */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4">
              <Pizza className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                PizzaDash
              </span>
            </h1>
            <p className="text-muted-foreground mt-2 text-base sm:text-lg">
              Order your favorite pizza in seconds
            </p>
          </div>

          {authMode === 'login' ? (
            <LoginForm onSwitchToSignup={() => setAuthMode('signup')} />
          ) : (
            <SignupForm onSwitchToLogin={() => setAuthMode('login')} />
          )}
        </div>

        <footer className="relative z-10 py-4 text-center text-sm text-muted-foreground">
          PizzaDash &mdash; Pizza Delivery Service
        </footer>
      </div>
    );
  }

  // Dashboard / Admin View
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50/50 via-white to-amber-50/30">
      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {view === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-6 sm:p-8 text-white shadow-lg shadow-orange-500/20">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Welcome back, {name || username}!
              </h2>
              <p className="text-orange-100 text-sm sm:text-base">
                Ready to order your next delicious pizza?
              </p>
              <div className="mt-4">
                <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-white text-orange-600 hover:bg-orange-50 font-semibold shadow-md">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Place New Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Pizza className="w-5 h-5 text-orange-600" />
                        Place a New Order
                      </DialogTitle>
                    </DialogHeader>
                    <OrderForm onSuccess={() => { setOrderDialogOpen(false); refreshOrders(); }} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Orders</p>
                    <p className="text-xl font-bold">My Pizzas</p>
                  </div>
                </CardContent>
              </Card>
              {isStaff && (
                <button
                  onClick={() => setView('admin')}
                  className="text-left"
                >
                  <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Admin Panel</p>
                        <p className="text-xl font-bold">Manage All</p>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              )}
            </div>

            {/* My Orders */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
                My Orders
              </h3>
              <MyOrders key={ordersKey} />
            </div>
          </div>
        )}

        {view === 'admin' && isStaff && <AdminOrders />}
      </main>

      <footer className="mt-auto py-4 text-center text-sm text-muted-foreground border-t bg-white/50">
        PizzaDash &mdash; Pizza Delivery Service
      </footer>
    </div>
  );
}