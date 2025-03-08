import React from 'react';
import Donate from './pages/Donate.tsx';
import Login from '@/components/login.tsx';
import { cn } from '@/lib/utils.ts';
import { Link, Route, Routes } from 'react-router-dom';
import { useApp } from '@/context/app.context.tsx';

function App() {
  const { suiAddress } = useApp();

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className={cn('text-xl sm:text-2xl font-bold text-cyan-400', suiAddress ? 'hidden sm:block' : '')}>
              <Link to={'/'}>
                <em>
                  donations.<span className="text-blue-500">fun</span>
                </em>
              </Link>
            </h1>

            <Login />
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-12 px-2 sm:px-0">
          <Routes>
            <Route path="*" element={<Donate />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;
