import { forwardRef } from 'react';
import { formatPrice } from '@/lib/data';

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  size: string | null;
  color: string | null;
  price: number;
}

interface Order {
  id: string;
  order_number: string | null;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string | null;
  payment_method: string;
  notes: string | null;
  created_at: string;
  order_items: OrderItem[];
}

interface CustomerInfo {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
}

interface OrderInvoiceProps {
  order: Order;
  customer?: CustomerInfo | null;
}

const OrderInvoice = forwardRef<HTMLDivElement, OrderInvoiceProps>(
  ({ order, customer }, ref) => {
    const subtotal = order.order_items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = 0; // Free shipping or calculate as needed

    return (
      <div
        ref={ref}
        className="bg-white text-black p-8 min-w-[600px] font-sans"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gen-zee.store</h1>
            <p className="text-gray-500 text-sm mt-1">Premium Fashion & Lifestyle</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold text-gray-800">INVOICE</h2>
            <p className="text-sm text-gray-600 mt-1">
              #{order.order_number || order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Customer & Shipping Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Bill To
            </h3>
            <p className="font-medium">{customer?.full_name || 'Customer'}</p>
            {customer?.email && (
              <p className="text-sm text-gray-600">{customer.email}</p>
            )}
            {customer?.phone && (
              <p className="text-sm text-gray-600">{customer.phone}</p>
            )}
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Ship To
            </h3>
            <p className="font-medium">{order.shipping_city}</p>
            <p className="text-sm text-gray-600">{order.shipping_address}</p>
            {order.shipping_postal_code && (
              <p className="text-sm text-gray-600">{order.shipping_postal_code}</p>
            )}
          </div>
        </div>

        {/* Order Details */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">
                Item
              </th>
              <th className="text-center py-3 text-xs font-semibold text-gray-500 uppercase">
                Qty
              </th>
              <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase">
                Price
              </th>
              <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-4">
                  <p className="font-medium text-sm">{item.product_name}</p>
                  <p className="text-xs text-gray-500">
                    {[item.size, item.color].filter(Boolean).join(' / ')}
                  </p>
                </td>
                <td className="py-4 text-center text-sm">{item.quantity}</td>
                <td className="py-4 text-right text-sm">
                  {formatPrice(item.price)}
                </td>
                <td className="py-4 text-right text-sm font-medium">
                  {formatPrice(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-600">Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-gray-200 font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(Number(order.total_amount))}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Payment Method</span>
            <span className="font-medium capitalize">{order.payment_method}</span>
          </div>
          {order.notes &&
            (order.payment_method === 'bkash' ||
              order.payment_method === 'nagad') && (
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">Transaction ID</span>
                <span className="font-mono">
                  {order.notes.match(/TxID:\s*([^,]+)/)?.[1]?.trim() || 'N/A'}
                </span>
              </div>
            )}
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-600">Order Status</span>
            <span className="font-medium capitalize">{order.status}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-6">
          <p className="font-medium mb-1">Thank you for shopping with Gen-zee.store!</p>
          <p>For any queries, contact us at support@gen-zee.store</p>
          <p className="mt-2">This is a computer-generated invoice.</p>
        </div>
      </div>
    );
  }
);

OrderInvoice.displayName = 'OrderInvoice';

export default OrderInvoice;
