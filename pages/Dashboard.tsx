
import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TransactionType } from '../types';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../constants';

const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
};

export default function Dashboard() {
    const { state } = useApp();
    const { transactions, accounts } = state;

    const defaultCurrency = accounts[0]?.currency || 'USD';

    const { totalIncome, totalExpense, totalBalance } = useMemo(() => {
        let income = 0;
        let expense = 0;
        transactions.forEach(t => {
            if (t.type === TransactionType.INCOME) {
                income += t.amount;
            } else {
                expense += t.amount;
            }
        });
        const initialBalances = accounts.reduce((sum, acc) => sum + acc.initialBalance, 0);
        return { totalIncome: income, totalExpense: expense, totalBalance: initialBalances + income - expense };
    }, [transactions, accounts]);

    const expenseByCategory = useMemo(() => {
        const categoryMap: { [key: string]: number } = {};
        transactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .forEach(t => {
                categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
            });
        return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    }, [transactions]);
    
    const monthlyData = useMemo(() => {
        const data: { [key: string]: { income: number, expense: number } } = {};
        transactions.forEach(t => {
            const month = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' });
            if (!data[month]) data[month] = { income: 0, expense: 0 };
            if (t.type === TransactionType.INCOME) data[month].income += t.amount;
            else data[month].expense += t.amount;
        });
        return Object.entries(data).map(([name, values]) => ({ name, ...values })).reverse();
    }, [transactions]);


    if (accounts.length === 0) {
        return (
            <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-2 text-slate-700 dark:text-slate-300">Welcome to Finance Tracker!</h2>
                <p className="text-slate-500 dark:text-slate-400">Please add an account to get started.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Balance</h3>
                    <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">{formatCurrency(totalBalance, defaultCurrency)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Income</h3>
                    <p className="mt-1 text-3xl font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalIncome, defaultCurrency)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expense</h3>
                    <p className="mt-1 text-3xl font-semibold text-rose-600 dark:text-rose-400">{formatCurrency(totalExpense, defaultCurrency)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Expense by Category</h3>
                    {expenseByCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                    {expenseByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value, defaultCurrency)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="text-center text-slate-500 dark:text-slate-400 py-10">No expense data available.</p>}
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Monthly Overview</h3>
                     {monthlyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value: number) => formatCurrency(value, defaultCurrency).replace(defaultCurrency, '')} />
                                <Tooltip formatter={(value: number) => formatCurrency(value, defaultCurrency)} />
                                <Legend />
                                <Bar dataKey="income" fill="#34d399" name="Income" />
                                <Bar dataKey="expense" fill="#f43f5e" name="Expense" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-center text-slate-500 dark:text-slate-400 py-10">No transaction data available.</p>}
                </div>
            </div>
        </div>
    );
}
