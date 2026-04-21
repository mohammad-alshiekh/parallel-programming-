'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { useEffect } from 'react';

export default function Home() {
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      // Token exists but user not loaded
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            E-Commerce
          </Link>
          <div className="flex gap-4">
            {user ? (
              <>
                <span className="text-gray-700">{user.email}</span>
                <Link href="/orders" className="text-indigo-600 hover:text-indigo-800">
                  My Orders
                </Link>
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/';
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-indigo-600 hover:text-indigo-800">
                  Login
                </Link>
                <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          High-Performance E-Commerce System
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Built with NestJS & Next.js
        </p>
        {user ? (
          <Link href="/products" className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-indigo-700 inline-block">
            Browse Products
          </Link>
        ) : (
          <Link href="/register" className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-indigo-700 inline-block">
            Get Started
          </Link>
        )}
      </div>

      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-blue-900 mb-2">Concurrent Data Protection</h3>
              <p className="text-gray-700">
                Optimistic locking prevents race conditions
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-900 mb-2">Resource Management</h3>
              <p className="text-gray-700">
                Thread pool pattern limits concurrent operations
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-purple-900 mb-2">Async Queues</h3>
              <p className="text-gray-700">
                Background tasks without blocking requests
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>E-Commerce System © 2024</p>
        </div>
      </footer>
    </div>
  );
}
