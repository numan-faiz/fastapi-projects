'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Loader2, Plus } from 'lucide-react';
import type { PizzaSize, CreateOrderPayload } from '@/types';

interface OrderFormProps {
  editOrder?: { id: number; quantity: number; pizza_size: PizzaSize };
  onSuccess?: () => void;
}

const PIZZA_SIZES: { value: PizzaSize; label: string; description: string }[] = [
  { value: 'SMALL', label: 'Small', description: '8 inch — personal size' },
  { value: 'MEDIUM', label: 'Medium', description: '10 inch — perfect for one' },
  { value: 'LARGE', label: 'Large', description: '12 inch — great for sharing' },
  { value: 'EXTRA-LARGE', label: 'Extra Large', description: '14 inch — feeds the family' },
];

const UNIT_PRICES: Record<PizzaSize, number> = {
  SMALL: 1000,
  MEDIUM: 1500,
  LARGE: 2500,
  'EXTRA-LARGE': 4500,
};

export function OrderForm({ editOrder, onSuccess }: OrderFormProps) {
  const [quantity, setQuantity] = useState(editOrder?.quantity?.toString() || '1');
  const [pizzaSize, setPizzaSize] = useState<PizzaSize | ''>(editOrder?.pizza_size || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isValid = quantity && parseInt(quantity) > 0 && pizzaSize;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    try {
      const payload: CreateOrderPayload = {
        quantity: parseInt(quantity),
        pizza_size: pizzaSize as PizzaSize,
      };

      if (editOrder) {
        const order = await api.updateOrder(editOrder.id, payload);
        toast({
          title: 'Order Updated',
          description: `Order #${editOrder.id} updated. Unit: PKR ${order.unit_price?.toLocaleString() ?? '—'} | Total: PKR ${order.total_price?.toLocaleString() ?? '—'}`,
        });
      } else {
        const order = await api.createOrder(payload);
        toast({
          title: 'Order Placed!',
          description: `Unit: PKR ${order.unit_price?.toLocaleString() ?? '—'} | Total: PKR ${order.total_price?.toLocaleString() ?? '—'} | Your pizza is on the way!`,
        });
      }
      setQuantity('1');
      setPizzaSize('');
      onSuccess?.();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Could not place order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const qty = parseInt(quantity) || 0;
  const selectedPrice = pizzaSize ? UNIT_PRICES[pizzaSize as PizzaSize] : 0;
  const previewTotal = selectedPrice * qty;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label>Pizza Size</Label>
        <Select value={pizzaSize} onValueChange={(v) => setPizzaSize(v as PizzaSize)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a size" />
          </SelectTrigger>
          <SelectContent>
            {PIZZA_SIZES.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                <span className="font-medium">{size.label}</span>
                <span className="text-muted-foreground ml-2 text-sm">— {size.description}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setQuantity(String(Math.max(1, parseInt(quantity) - 1)))}
            disabled={parseInt(quantity) <= 1 || loading}
          >
            -
          </Button>
          <input
            id="quantity"
            type="number"
            min="1"
            max="99"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-20 text-center text-lg font-semibold border rounded-md h-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={loading}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setQuantity(String(parseInt(quantity) + 1))}
            disabled={parseInt(quantity) >= 99 || loading}
          >
            +
          </Button>
        </div>
      </div>

      {pizzaSize && qty > 0 && (
        <div className="rounded-lg bg-orange-50 border border-orange-200 p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Unit Price</span>
            <span className="font-semibold">PKR {selectedPrice.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Quantity</span>
            <span className="font-semibold">×{qty}</span>
          </div>
          <div className="border-t border-orange-200 pt-2 flex items-center justify-between">
            <span className="font-semibold text-foreground">Total Price</span>
            <span className="text-lg font-bold text-orange-700">PKR {previewTotal.toLocaleString()}</span>
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold"
        disabled={!isValid || loading}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Plus className="w-4 h-4 mr-2" />
        )}
        {editOrder ? 'Update Order' : 'Place Order'}
      </Button>
    </form>
  );
}