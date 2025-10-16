
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Account, AppActionType, TransactionType } from '../types';
import Modal from '../components/Modal';
import { CURRENCIES } from '../constants';

const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
};

function AccountForm({ account, onSave, onCancel }: { account?: Account, onSave: (a: Account) => void, onCancel: () => void }) {
    const [name, setName] = useState(account?.name || '');
    const [initialBalance, setInitialBalance] = useState(account?.initialBalance.toString() || '0');
    const [currency, setCurrency] = useState(account?.currency || 'USD');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newAccount: Account = {
            id: account?.id || crypto.randomUUID(),
            name,
            initialBalance: parseFloat(initialBalance),
            currency,
        };
        onSave(newAccount);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Account Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Initial Balance</label>
                <input type="number" value={initialBalance} onChange={e => setInitialBalance(e.target.value)} required step="0.01" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Currency</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium border border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Save</button>
            </div>
        </form>
    );
}

export default function Accounts() {
    const { state, dispatch } = useApp();
    const { accounts, transactions } = state;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | undefined>(undefined);

    const accountBalances = useMemo(() => {
        const balances = new Map<string, number>();
        accounts.forEach(acc => {
            let balance = acc.initialBalance;
            transactions.forEach(t => {
                if (t.accountId === acc.id) {
                    balance += t.type === TransactionType.INCOME ? t.amount : -t.amount;
                }
            });
            balances.set(acc.id, balance);
        });
        return balances;
    }, [accounts, transactions]);

    const handleSave = (account: Account) => {
        if (editingAccount) {
            dispatch({ type: AppActionType.UPDATE_ACCOUNT, payload: account });
        } else {
            dispatch({ type: AppActionType.ADD_ACCOUNT, payload: account });
        }
        setIsModalOpen(false);
        setEditingAccount(undefined);
    };

    const openAddModal = () => {
        setEditingAccount(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (account: Account) => {
        setEditingAccount(account);
        setIsModalOpen(true);
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this account? All associated transactions will also be deleted.')) {
            dispatch({ type: AppActionType.DELETE_ACCOUNT, payload: { id } });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Accounts</h1>
                <button onClick={openAddModal} className="px-4 py-2 rounded-md font-medium text-white bg-sky-600 hover:bg-sky-700">
                    Add Account
                </button>
            </div>
            
            {accounts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accounts.map(acc => (
                        <div key={acc.id} className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{acc.name}</h2>
                                <p className="text-3xl font-semibold text-sky-600 dark:text-sky-400 my-4">
                                    {formatCurrency(accountBalances.get(acc.id) || 0, acc.currency)}
                                </p>
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                                <button onClick={() => openEditModal(acc)} className="text-slate-400 hover:text-sky-600"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
                                <button onClick={() => handleDelete(acc.id)} className="text-slate-400 hover:text-rose-600"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow">
                    <p className="text-slate-500 dark:text-slate-400">No accounts yet. Add one to get started!</p>
                </div>
            )}
            
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingAccount(undefined); }} title={editingAccount ? 'Edit Account' : 'Add Account'}>
                <AccountForm account={editingAccount} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingAccount(undefined); }} />
            </Modal>
        </div>
    );
}
