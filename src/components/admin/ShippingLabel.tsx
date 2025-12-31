import { forwardRef } from 'react';
import { Package, MapPin, Phone, User } from 'lucide-react';

interface ShippingLabelProps {
  order: {
    id: string;
    order_number: string | null;
    shipping_address: string;
    shipping_city: string;
    shipping_postal_code: string | null;
    created_at: string;
    order_items: { product_name: string; quantity: number }[];
  };
  customer?: {
    full_name?: string | null;
    phone?: string | null;
  } | null;
}

const ShippingLabel = forwardRef<HTMLDivElement, ShippingLabelProps>(
  ({ order, customer }, ref) => {
    const totalItems = order.order_items.reduce((sum, item) => sum + item.quantity, 0);

    return (
      <div
        ref={ref}
        className="bg-white text-black p-6 w-[400px] font-sans border-2 border-black"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Gen-zee.store</h1>
          <p className="text-xs text-gray-600 mt-1">SHIPPING LABEL</p>
        </div>

        {/* Order Info */}
        <div className="bg-gray-100 p-3 rounded mb-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-600">ORDER ID</span>
            <span className="font-mono font-bold text-lg">
              {order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">Date</span>
            <span className="text-sm">
              {new Date(order.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* From Address */}
        <div className="mb-4 pb-4 border-b border-dashed border-gray-300">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">From</p>
          <p className="font-bold">Gen-zee.store Warehouse</p>
          <p className="text-sm text-gray-600">Dhaka, Bangladesh</p>
        </div>

        {/* To Address */}
        <div className="mb-4 pb-4 border-b border-dashed border-gray-300">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Ship To</p>
          <div className="flex items-start gap-2 mb-2">
            <User size={16} className="text-gray-400 mt-0.5" />
            <p className="font-bold text-lg">{customer?.full_name || 'Customer'}</p>
          </div>
          <div className="flex items-start gap-2 mb-2">
            <MapPin size={16} className="text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium">{order.shipping_city}</p>
              <p className="text-sm text-gray-600">{order.shipping_address}</p>
              {order.shipping_postal_code && (
                <p className="text-sm text-gray-600">{order.shipping_postal_code}</p>
              )}
            </div>
          </div>
          {customer?.phone && (
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-gray-400" />
              <p className="font-mono">{customer.phone}</p>
            </div>
          )}
        </div>

        {/* Package Info */}
        <div className="bg-black text-white p-3 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={20} />
              <span className="font-semibold">Contents</span>
            </div>
            <span className="bg-white text-black px-2 py-1 rounded text-sm font-bold">
              {totalItems} item{totalItems > 1 ? 's' : ''}
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-300">
            {order.order_items.slice(0, 3).map((item, i) => (
              <p key={i} className="truncate">
                {item.quantity}x {item.product_name}
              </p>
            ))}
            {order.order_items.length > 3 && (
              <p>+{order.order_items.length - 3} more items</p>
            )}
          </div>
        </div>

        {/* Barcode Placeholder */}
        <div className="mt-4 text-center">
          <div className="inline-flex flex-col items-center gap-1 bg-gray-100 px-4 py-2 rounded">
            <div className="flex gap-0.5">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-black"
                  style={{
                    width: Math.random() > 0.5 ? 2 : 1,
                    height: 40,
                  }}
                />
              ))}
            </div>
            <span className="font-mono text-xs">
              {order.order_number || order.id.slice(0, 12).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Handle Instructions */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p className="font-medium">HANDLE WITH CARE</p>
        </div>
      </div>
    );
  }
);

ShippingLabel.displayName = 'ShippingLabel';

export default ShippingLabel;
