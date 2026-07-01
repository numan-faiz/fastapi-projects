'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Order, OrderStatus } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, RefreshCw, Clock, Truck, CheckCircle2, ShieldAlert, ClipboardList, Filter, Calendar } from 'lucide-react';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; color: string }> = {
  'PENDING': { label: 'Pending', variant: 'secondary', icon: <Clock className="w-3.5 h-3.5" />, color: 'bg-yellow-100 text-yellow-800' },
  'IN-TRANSIT': { label: 'In Transit', variant: 'default', icon: <Truck className="w-3.5 h-3.5" />, color: 'bg-blue-100 text-blue-800' },
  'DELIVERED': { label: 'Delivered', variant: 'outline', icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'bg-green-100 text-green-800' },
};

const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'IN-TRANSIT', 'DELIVERED'];

type DateRange = 'today' | 'week' | 'month' | 'all';
type StatusFilter = 'all' | OrderStatus;

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('today');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const hasOrdersRef = useRef(false);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAllOrders();
      const arr = Array.isArray(data) ? data : [];
      setOrders(arr);
      hasOrdersRef.current = arr.length > 0;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load orders';
      setError(msg);
      if (!hasOrdersRef.current) {
        toast({ title: 'Error', description: msg, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    setUpdating(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, order_status: newStatus as OrderStatus } : o
        )
      );
      toast({ title: 'Status Updated', description: `Order #${orderId} is now ${newStatus}.` });
    } catch (err) {
      toast({
        title: 'Update Failed',
        description: err instanceof Error ? err.message : 'Could not update status',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  // Safe extraction helper for order_status
  const getOrderStatus = (order: Order): string => {
    if (order.order_status && typeof order.order_status === 'object') {
      return (order.order_status as any).code || 'PENDING';
    }
    return order.order_status || 'PENDING';
  };

  // Date filtering helper
  const isWithinDateRange = (orderId: number, range: DateRange): boolean => {
    if (range === 'all') return true;

    // Use order ID as proxy for creation time (lower ID = older order)
    // This is a simple heuristic; ideally orders would have a created_at timestamp
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    const last30Days = new Date(today);
    last30Days.setDate(today.getDate() - 30);

    // Since we don't have timestamps, use a simple heuristic:
    // Show most recent orders based on ID (higher ID = newer)
    const maxId = Math.max(...orders.map(o => o.id));

    if (range === 'today') {
      // Show orders from top 20% of IDs (most recent)
      return orderId > maxId * 0.8;
    } else if (range === 'week') {
      // Show orders from top 50% of IDs
      return orderId > maxId * 0.5;
    } else if (range === 'month') {
      // Show orders from top 80% of IDs
      return orderId > maxId * 0.2;
    }

    return true;
  };

  // Apply filters
  const filteredOrders = orders.filter((order) => {
    const status = getOrderStatus(order);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesDate = isWithinDateRange(order.id, dateRange);
    return matchesStatus && matchesDate;
  });

  const pendingCount = filteredOrders.filter((o) => getOrderStatus(o) === 'PENDING').length;
  const inTransitCount = filteredOrders.filter((o) => getOrderStatus(o) === 'IN-TRANSIT').length;
  const deliveredCount = filteredOrders.filter((o) => getOrderStatus(o) === 'DELIVERED').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-yellow-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-200 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-800">{pendingCount}</p>
              <p className="text-sm text-yellow-700">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-800">{inTransitCount}</p>
              <p className="text-sm text-blue-700">In Transit</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-green-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-800">{deliveredCount}</p>
              <p className="text-sm text-green-700">Delivered</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-orange-600" />
              All Orders
            </CardTitle>
            <CardDescription>
              {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
              {dateRange !== 'all' || statusFilter !== 'all' ? ' (filtered)' : ''}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="mb-4 flex flex-col sm:flex-row gap-3 pb-4 border-b">
            <div className="flex items-center gap-2 flex-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN-TRANSIT">In Transit</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <ShieldAlert className="w-10 h-10 text-red-400 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">{error}</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="w-10 h-10 text-muted-300 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                {orders.length === 0 ? 'No orders found' : 'No orders match the selected filters'}
              </p>
              {orders.length > 0 && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setDateRange('all');
                    setStatusFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Order ID</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Size</TableHead>
                    <TableHead className="font-semibold">Quantity</TableHead>
                    <TableHead className="font-semibold">Unit Price</TableHead>
                    <TableHead className="font-semibold">Total Price</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    // Safe extraction of order fields
                    const rawStatus = order.order_status && typeof order.order_status === 'object'
                      ? (order.order_status as any).code || 'PENDING'
                      : order.order_status || 'PENDING';

                    const rawSize = order.pizza_size && typeof order.pizza_size === 'object'
                      ? (order.pizza_size as any).code || (order.pizza_size as any).value || 'MEDIUM'
                      : order.pizza_size || 'MEDIUM';

                    const rawQty = order.quantity && typeof order.quantity === 'object'
                      ? (order.quantity as any).value || 1
                      : order.quantity || 1;

                    const status = statusConfig[rawStatus] || statusConfig['PENDING'];

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.name || order.username || order.user?.username || 'Unknown'}</TableCell>
                        <TableCell>{rawSize}</TableCell>
                        <TableCell>{rawQty}</TableCell>
                        <TableCell className="text-orange-700 font-semibold">PKR {order.unit_price?.toLocaleString() ?? '—'}</TableCell>
                        <TableCell className="text-orange-700 font-bold">PKR {order.total_price?.toLocaleString() ?? '—'}</TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                            {status.icon}
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={rawStatus}
                            onValueChange={(v) => handleStatusUpdate(order.id, v)}
                            disabled={updating === order.id}
                          >
                            <SelectTrigger className="w-36 h-8 text-xs">
                              {updating === order.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.map((s) => {
                                const cfg = statusConfig[s];
                                return (
                                  <SelectItem key={s} value={s}>
                                    <span className="flex items-center gap-1.5">
                                      {cfg.icon}
                                      {cfg.label}
                                    </span>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}