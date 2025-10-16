
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction, TransactionType, AppActionType } from '../types';
import Modal from '../components/Modal';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants';

const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
};

function TransactionForm({ transaction, onSave, onCancel }: { transaction?: Transaction, onSave: (t: Transaction) => void, onCancel: () => void }) {
    const { state } = useApp();
    const { accounts } = state;
    const [type, setType] = useState<TransactionType>(transaction?.type || TransactionType.EXPENSE);
    const [amount, setAmount] = useState<string>(transaction?.amount.toString() || '');
    const [category, setCategory] = useState<string>(transaction?.category || '');
    const [date, setDate] = useState<string>(transaction?.date ? new Date(transaction.date).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10));
    const [description, setDescription] = useState<string>(transaction?.description || '');
    const [accountId, setAccountId] = useState<string>(transaction?.accountId || (accounts.length > 0 ? accounts[0].id : ''));

    const categories = type === TransactionType.INCOME ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newTransaction: Transaction = {
            id: transaction?.id || crypto.randomUUID(),
            type,
            amount: parseFloat(amount),
            category: category || categories[0],
            date: new Date(date).toISOString(),
            description,
            accountId,
        };
        onSave(newTransaction);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Account</label>
                <select value={accountId} onChange={e => setAccountId(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
                <select value={type} onChange={e => setType(e.target.value as TransactionType)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    <option value={TransactionType.EXPENSE}>Expense</option>
                    <option value={TransactionType.INCOME}>Income</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required step="0.01" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium border border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Save</button>
            </div>
        </form>
    );
}

export default function Transactions() {
    const { state, dispatch } = useApp();
    const { transactions, accounts } = state;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
    
    const accountMap = useMemo(() => new Map(accounts.map(acc => [acc.id, acc])), [accounts]);
    
    const sortedTransactions = useMemo(() => 
        [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
        [transactions]
    );

    const handleSave = (transaction: Transaction) => {
        if (editingTransaction) {
            dispatch({ type: AppActionType.UPDATE_TRANSACTION, payload: transaction });
        } else {
            dispatch({ type: AppActionType.ADD_TRANSACTION, payload: transaction });
        }
        setIsModalOpen(false);
        setEditingTransaction(undefined);
    };
    
    const openAddModal = () => {
        setEditingTransaction(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            dispatch({ type: AppActionType.DELETE_TRANSACTION, payload: { id } });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Transactions</h1>
                <button onClick={openAddModal} disabled={accounts.length === 0} className="px-4 py-2 rounded-md font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 disabled:cursor-not-allowed">
                    Add Transaction
                </button>
            </div>
            
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden">
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                    {sortedTransactions.length > 0 ? sortedTransactions.map(t => {
                        const account = accountMap.get(t.accountId);
                        const isIncome = t.type === TransactionType.INCOME;
                        return (
                            <li key={t.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${isIncome ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-rose-100 dark:bg-rose-900'}`}>
                                        {isIncome ? <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg> 
                                                  : <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"/></svg>}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">{t.description || t.category}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleDateString()} &bull; {account?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                                    <p className={`font-semibold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {isIncome ? '+' : '-'}{formatCurrency(t.amount, account?.currency || 'USD')}
                                    </p>
                                    <button onClick={() => openEditModal(t)} className="text-slate-400 hover:text-sky-600"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
                                    <button onClick={() => handleDelete(t.id)} className="text-slate-400 hover:text-rose-600"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></button>
                                </div>
                            </li>
                        );
                    }) : (
                        <p className="p-6 text-center text-slate-500 dark:text-slate-400">No transactions yet.</p>
                    )}
                </ul>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTransaction(undefined); }} title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}>
                <TransactionForm transaction={editingTransaction} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingTransaction(undefined); }} />
            </Modal>
        </div>
    );
}
