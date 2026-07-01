'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/types';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { OrderForm } from './order-form';
import { Loader2, Trash2, Edit, Package, Clock, Truck, CheckCircle2, ShoppingBag } from 'lucide-react';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  'PENDING': { label: 'Pending', variant: 'secondary', icon: <Clock className="w-3.5 h-3.5" /> },
  'IN-TRANSIT': { label: 'In Transit', variant: 'default', icon: <Truck className="w-3.5 h-3.5" /> },
  'DELIVERED': { label: 'Delivered', variant: 'outline', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

const sizeLabels: Record<string, string> = {
  'SMALL': 'Small (8")',
  'MEDIUM': 'Medium (10")',
  'LARGE': 'Large (12")',
  'EXTRA-LARGE': 'Extra Large (14")',
};

export function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const hasOrdersRef = useRef(false);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getMyOrders();
      const arr = Array.isArray(data) ? data : [];
      setOrders(arr);
      hasOrdersRef.current = arr.length > 0;
    } catch (err) {
      if (!hasOrdersRef.current) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to load orders',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await api.deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      toast({ title: 'Deleted', description: 'Order has been removed.' });
    } catch (err) {
      toast({
        title: 'Delete Failed',
        description: err instanceof Error ? err.message : 'Could not delete order',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-6">
              <Skeleton className="h-5 w-32 mb-3" />
              <Skeleton className="h-4 w-48" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No orders yet</h3>
          <p className="text-muted-foreground text-sm">Click &quot;New Order&quot; to place your first pizza order!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        // Safe string extraction for order_status
        const rawStatus = order.order_status && typeof order.order_status === 'object'
          ? (order.order_status as any).code || 'PENDING'
          : order.order_status || 'PENDING';

        const status = statusConfig[rawStatus] || statusConfig['PENDING'];

        // Safe string extraction for pizza_size
        const rawSize = order.pizza_size && typeof order.pizza_size === 'object'
          ? (order.pizza_size as any).value || (order.pizza_size as any).code || 'MEDIUM'
          : order.pizza_size || 'MEDIUM';

        // Safe extraction for quantity
        const rawQty = order.quantity && typeof order.quantity === 'object'
          ? (order.quantity as any).value || 1
          : order.quantity || 1;

        return (
          <Card key={order.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span className="font-semibold text-sm">Order #{order.id}</span>
                    {order.name && (
                      <span className="text-xs text-muted-foreground ml-1">by {order.name}</span>
                    )}
                    <Badge variant={status.variant} className="flex items-center gap-1 text-xs">
                      {status.icon}
                      {status.label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="font-medium text-foreground">Size:</span>
                      {sizeLabels[rawSize] || rawSize}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="font-medium text-foreground">Qty:</span>
                      {rawQty}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/50 text-sm">
                    <span className="flex items-center gap-1.5">
                      <span className="font-medium text-foreground">Unit:</span>
                      <span className="text-orange-700 font-semibold">PKR {order.unit_price?.toLocaleString() ?? '—'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="font-medium text-foreground">Total:</span>
                      <span className="text-orange-700 font-bold">PKR {order.total_price?.toLocaleString() ?? '—'}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-orange-600">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Order #{order.id}</DialogTitle>
                      </DialogHeader>
                      <OrderForm
                        editOrder={{ id: order.id, quantity: Number(rawQty), pizza_size: rawSize as any }}
                        onSuccess={fetchOrders}
                      />
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                        disabled={deleting === order.id}
                      >
                        {deleting === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Order #{order.id}?</AlertDialogTitle>
                      <AlertDialogDescription>
                          This action cannot be undone. The order will be permanently removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(order.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}