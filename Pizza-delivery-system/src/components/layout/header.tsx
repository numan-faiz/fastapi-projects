'use client';

import { Button } from '@/components/ui/button';
import { LogOut, Pizza, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { OrderForm } from '@/components/orders/order-form';

export function Header() {
  const { name, username, isStaff, view, setView, clearTokens } = useAuthStore();
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  if (!username) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center">
            <Pizza className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-orange-700 hidden sm:block">PizzaDash</span>
        </div>

        <nav className="flex items-center gap-1">
          <Button
            variant={view === 'dashboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('dashboard')}
            className={view === 'dashboard' ? 'bg-orange-600 hover:bg-orange-700 text-white' : ''}
          >
            <LayoutDashboard className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
          {isStaff && (
            <Button
              variant={view === 'admin' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('admin')}
              className={view === 'admin' ? 'bg-orange-600 hover:bg-orange-700 text-white' : ''}
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          )}
          <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white font-medium"
              >
                <Pizza className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">New Order</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Pizza className="w-5 h-5 text-orange-600" />
                  Place a New Order
                </DialogTitle>
              </DialogHeader>
              <OrderForm onSuccess={() => setOrderDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground hidden md:flex items-center gap-1.5">
            {isStaff && <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />}
            {name || username}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={clearTokens}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}