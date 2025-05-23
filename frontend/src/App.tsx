import React, { useState } from 'react';
import Donate from './pages/Donate.tsx';
import Login from '@/components/login.tsx';
import { cn } from '@/lib/utils.ts';
import { Link, Route, Routes } from 'react-router-dom';
import { useApp } from '@/context/app.context.tsx';
import TwitterReAuth from '@/components/socialfi/twitter-re-auth.tsx';
import TwitterVerify from '@/components/socialfi/twitter-verify.tsx';
import { MyAccount } from '@/pages/MyAccount.tsx';

function App() {
  const { suiAddress } = useApp();

  const [isOpenTwitterLinkAccount, setIsOpenTwitterLinkAccount] = useState(false);

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

            <Login setIsOpenTwitterLinkAccount={setIsOpenTwitterLinkAccount} />
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-12 px-2 sm:px-0">
          <Routes>
            <Route path="/my-account" element={<MyAccount />} />
            <Route path="*" element={<Donate />} />
          </Routes>
        </main>

        {suiAddress && (
          <Routes>
            <Route
              path="/"
              element={<TwitterReAuth isOpen={isOpenTwitterLinkAccount} setIsOpen={setIsOpenTwitterLinkAccount} />}
            />
            <Route path="/socialfi/verify-x" element={<TwitterVerify />} />
          </Routes>
        )}
      </div>
    </>
  );
}

export default App;
