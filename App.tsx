
import React from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Accounts from './pages/Accounts';

const ICONS = {
  DASHBOARD: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>,
  TRANSACTIONS: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="m19 12-7 7-7-7"/></svg>,
  ACCOUNTS: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>,
};

function Header() {
    const navItems = [
        { path: '/', name: 'Dashboard', icon: ICONS.DASHBOARD },
        { path: '/transactions', name: 'Transactions', icon: ICONS.TRANSACTIONS },
        { path: '/accounts', name: 'Accounts', icon: ICONS.ACCOUNTS },
    ];
    
    return (
        <header className="bg-white dark:bg-slate-800 shadow-md">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <span className="font-bold text-xl text-sky-600 dark:text-sky-400">FinanceTracker</span>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                                            isActive
                                                ? 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300'
                                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                                        }`
                                    }
                                >
                                  {item.icon}
                                  {item.name}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}

function BottomNav() {
    const location = useLocation();
    const navItems = [
        { path: '/', name: 'Dashboard', icon: ICONS.DASHBOARD },
        { path: '/transactions', name: 'Transactions', icon: ICONS.TRANSACTIONS },
        { path: '/accounts', name: 'Accounts', icon: ICONS.ACCOUNTS },
    ];
    
    return (
        <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `inline-flex flex-col items-center justify-center px-5 hover:bg-slate-50 dark:hover:bg-slate-700 group ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        {React.cloneElement(item.icon, { className: 'w-6 h-6 mb-1' })}
                        <span className="text-xs">{item.name}</span>
                    </NavLink>
                ))}
            </div>
        </div>
    );
}


export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col text-slate-800 dark:text-slate-200">
          <Header />
          <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 mb-16 md:mb-0">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/accounts" element={<Accounts />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </HashRouter>
    </AppProvider>
  );
}
