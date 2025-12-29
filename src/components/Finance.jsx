import React, { useMemo, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Wallet, PieChart, ArrowUpRight, ArrowDownRight, Target, Plus } from 'lucide-react';
import { Card, Button } from './UI';
import { FinanceChart } from './AnalyticsCharts';

export default function Finance({ entries, userSettings, onAddEntry, onOpenBudgetModal }) {
  const [view, setView] = useState('overview'); // 'overview' | 'transactions'

  // Filter Finance Entries
  const financeEntries = useMemo(() => {
    return entries.filter(e => e.type === 'finance');
  }, [entries]);

  // Calculate Metrics
  const metrics = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let totalBalance = 0;
    let monthIncome = 0;
    let monthExpense = 0;
    let spendingByCategory = {};

    financeEntries.forEach(e => {
      const amount = parseFloat(e.amount) || 0;
      const date = new Date(e.timestamp);
      
      if (e.isExpense) {
        totalBalance -= amount;
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          monthExpense += amount;
          // Category tracking
          const cat = e.category || 'Uncategorized';
          spendingByCategory[cat] = (spendingByCategory[cat] || 0) + amount;
        }
      } else {
        totalBalance += amount;
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          monthIncome += amount;
        }
      }
    });

    return { totalBalance, monthIncome, monthExpense, spendingByCategory };
  }, [financeEntries]);

  // Chart Data (Last 30 Days)
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      
      const dayEntries = financeEntries.filter(e => e.timestamp.startsWith(dateStr));
      const income = dayEntries.filter(e => !e.isExpense).reduce((acc, e) => acc + (parseFloat(e.amount)||0), 0);
      const expense = dayEntries.filter(e => e.isExpense).reduce((acc, e) => acc + (parseFloat(e.amount)||0), 0);

      days.push({ label, income, expense, date: dateStr });
    }
    return days;
  }, [financeEntries]);

  // Budget Progress
  const budget = userSettings.monthlyBudget || 2000;
  const budgetProgress = Math.min((metrics.monthExpense / budget) * 100, 100);
  const isOverBudget = metrics.monthExpense > budget;

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wallet className="text-emerald-500" />
            Financial Health
          </h2>
          <p className="text-zinc-500 text-xs">Track your wealth flow</p>
        </div>
        <Button onClick={() => onAddEntry('finance')} variant="primary" className="h-10 px-4 text-sm">
          <Plus size={16} /> Add Transaction
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Balance */}
        <Card className="bg-zinc-900 border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
          <div className="relative z-10">
            <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Total Balance</div>
            <div className={`text-3xl font-mono font-bold ${metrics.totalBalance >= 0 ? 'text-white' : 'text-red-400'}`}>
              ${metrics.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-zinc-500">
               <Wallet size={12} />
               <span>Across all logs</span>
            </div>
          </div>
        </Card>

        {/* Monthly Income */}
        <Card className="bg-zinc-900 border-zinc-800">
          <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">This Month In</div>
          <div className="text-2xl font-mono font-bold text-emerald-400 flex items-center gap-2">
            <ArrowUpRight size={20} />
            ${metrics.monthIncome.toLocaleString()}
          </div>
        </Card>

        {/* Monthly Expense */}
        <Card className="bg-zinc-900 border-zinc-800">
          <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">This Month Out</div>
          <div className="text-2xl font-mono font-bold text-rose-400 flex items-center gap-2">
            <ArrowDownRight size={20} />
            ${metrics.monthExpense.toLocaleString()}
          </div>
        </Card>
      </div>

      {/* Budget Card */}
      <Card className="relative overflow-hidden">
        <div className="flex justify-between items-end mb-2">
          <div>
            <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
              <Target size={14} /> Monthly Budget
            </div>
            <div className="text-xl font-bold text-white">
              ${metrics.monthExpense.toLocaleString()} <span className="text-zinc-500 text-sm">/ ${budget.toLocaleString()}</span>
            </div>
          </div>
          <button onClick={onOpenBudgetModal} className="text-xs text-emerald-500 hover:text-emerald-400 underline">
            Edit Goal
          </button>
        </div>
        
        <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'}`}
            style={{ width: `${budgetProgress}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-zinc-500 text-right">
          {isOverBudget ? (
            <span className="text-rose-400 font-bold">Over Budget by ${(metrics.monthExpense - budget).toLocaleString()}</span>
          ) : (
            <span>${(budget - metrics.monthExpense).toLocaleString()} remaining</span>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <Card>
           <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-zinc-400" />
              30 Day Trend
           </h3>
           <FinanceChart data={chartData} />
        </Card>

        {/* Categories */}
        <Card>
           <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <PieChart size={18} className="text-zinc-400" />
              Spending Breakdown
           </h3>
           <div className="space-y-3">
             {Object.entries(metrics.spendingByCategory)
               .sort(([,a], [,b]) => b - a)
               .slice(0, 6)
               .map(([cat, amount], i) => {
                 const pct = (amount / metrics.monthExpense) * 100;
                 return (
                   <div key={i} className="flex items-center gap-3">
                     <div className="w-24 text-xs text-zinc-400 truncate text-right font-medium">{cat}</div>
                     <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500/50 rounded-full"
                          style={{ width: `${pct}%` }}
                        ></div>
                     </div>
                     <div className="w-16 text-xs text-zinc-300 font-mono text-right">${amount.toLocaleString()}</div>
                   </div>
                 );
               })}
             {Object.keys(metrics.spendingByCategory).length === 0 && (
               <div className="text-center text-zinc-600 text-xs py-8">No expenses logged yet</div>
             )}
           </div>
        </Card>
      </div>

      {/* Recent Transactions List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white px-1">Recent Transactions</h3>
        <div className="space-y-2">
          {financeEntries.slice(0, 10).map(entry => (
            <div key={entry.id} className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-xl flex items-center justify-between hover:bg-zinc-900 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${entry.isExpense ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {entry.isExpense ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                  <div className="font-bold text-zinc-200">{entry.title}</div>
                  <div className="text-xs text-zinc-500 flex items-center gap-2">
                    <span className="capitalize bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">{entry.category}</span>
                    <span>•</span>
                    <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className={`font-mono font-bold ${entry.isExpense ? 'text-zinc-200' : 'text-emerald-400'}`}>
                {entry.isExpense ? '-' : '+'}${parseFloat(entry.amount).toFixed(2)}
              </div>
            </div>
          ))}
          {financeEntries.length === 0 && (
            <div className="text-center text-zinc-500 py-12 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
               No transactions yet. Start logging!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
