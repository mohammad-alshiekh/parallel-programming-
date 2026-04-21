'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore, useAuthStore } from '@/lib/store';
import { ordersAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function Cart() {
  const { items, removeItem, clearCart, getTotalPrice } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (items.length === 0) {
      setError('Cart is empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const response = await ordersAPI.create(orderItems);
      clearCart();
      router.push(`/orders/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Shopping Cart</h1>

        {error && <div className="bg-red-50 text-red-800 p-3 rounded mb-4 border border-red-200">{error}</div>}

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-700 mb-4">Your cart is empty</p>
            <Link href="/products" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 inline-block">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {items.map((item) => (
                <div key={item.productId} className="bg-white p-4 rounded-lg shadow-lg mb-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">Product ID: {item.productId}</p>
                    <p className="text-gray-700">Quantity: {item.quantity}</p>
                    <p className="text-indigo-600 font-bold">${item.price * item.quantity}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg h-fit">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Order Summary</h2>
              <div className="border-t pt-4">
                <div className="flex justify-between mb-4">
                  <span>Subtotal:</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span>Shipping:</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t pt-4 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 mt-4 font-bold"
              >
                {loading ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
