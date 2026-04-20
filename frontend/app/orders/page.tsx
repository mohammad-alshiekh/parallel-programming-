'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ordersAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  userId: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  totalAmount: number;
  status: string;
  invoiceId?: string;
  createdAt: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [user, router]);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getByUserId(user!.id);
      setOrders(response.data);
    } catch (err: any) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            E-Commerce
          </Link>
          <div className="flex gap-4">
            <Link href="/products" className="text-indigo-600 hover:text-indigo-800">
              Products
            </Link>
            <Link href="/cart" className="text-indigo-600 hover:text-indigo-800">
              Cart
            </Link>
            <Link href="/orders" className="text-indigo-600 hover:text-indigo-800">
              Orders
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-700 mb-4">No orders yet</p>
            <Link href="/products" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold">Order #{order.id.slice(0, 8)}</h2>
                    <p className="text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-4 py-2 rounded font-bold ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div className="border-t pt-4 mb-4">
                  <h3 className="font-bold mb-2">Items:</h3>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="text-gray-700 ml-4">
                      Product ID: {item.productId} x {item.quantity} @ ${item.price}
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold">Total: ${order.totalAmount}</span>
                  {order.invoiceId && (
                    <span className="text-green-600 font-bold">Invoice Generated</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
