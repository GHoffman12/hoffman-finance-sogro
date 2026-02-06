import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';

enum Tab {
  Incomes = 'Entradas',
  Expenses = 'Saídas',
  Debts = 'Dívidas',
}

export default function Launch() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Incomes);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Forms state
  const [incomeDate, setIncomeDate] = useState('');
  const [incomeSource, setIncomeSource] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');

  const [expenseDate, setExpenseDate] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  const [debtCreditor, setDebtCreditor] = useState('');
  const [debtType, setDebtType] = useState('');
  const [debtTotal, setDebtTotal] = useState('');
  const [debtInstallment, setDebtInstallment] = useState('');
  const [debtDueDay, setDebtDueDay] = useState('');
  const [debtStatus, setDebtStatus] = useState('Ativa');

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      setUserId(session.user.id);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleAddIncome = async () => {
    if (!incomeDate || !incomeSource || !incomeAmount) {
      setError('Preencha todos os campos de entrada');
      return;
    }
    setError('');
    const { error } = await supabase.from('incomes').insert({
      user_owner: userId,
      date: incomeDate,
      source: incomeSource,
      amount: parseFloat(incomeAmount.replace(',', '.')),
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Entrada lançada com sucesso!');
      setIncomeDate('');
      setIncomeSource('');
      setIncomeAmount('');
    }
  };

  const handleAddExpense = async () => {
    if (!expenseDate || !expenseDescription || !expenseAmount) {
      setError('Preencha todos os campos de saída');
      return;
    }
    setError('');
    const { error } = await supabase.from('expenses').insert({
      user_owner: userId,
      date: expenseDate,
      description: expenseDescription,
      amount: parseFloat(expenseAmount.replace(',', '.')),
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Saída lançada com sucesso!');
      setExpenseDate('');
      setExpenseDescription('');
      setExpenseAmount('');
    }
  };

  const handleAddDebt = async () => {
    if (!debtCreditor || !debtInstallment || !debtDueDay) {
      setError('Preencha os campos obrigatórios da dívida');
      return;
    }
    setError('');
    const { error } = await supabase.from('debts').insert({
      user_owner: userId,
      creditor: debtCreditor,
      type: debtType || null,
      total_amount: debtTotal ? parseFloat(debtTotal.replace(',', '.')) : null,
      monthly_installment: parseFloat(debtInstallment.replace(',', '.')),
      due_day: parseInt(debtDueDay, 10),
      status: debtStatus,
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Dívida cadastrada com sucesso!');
      setDebtCreditor('');
      setDebtType('');
      setDebtTotal('');
      setDebtInstallment('');
      setDebtDueDay('');
      setDebtStatus('Ativa');
    }
  };

  if (loading) return <Layout>Carregando...</Layout>;

  return (
    <Layout title="Lançar">
      <h1 className="text-xl font-bold mb-4 text-center">Lançamentos</h1>
      <div className="flex mb-4">
        {Object.values(Tab).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {message && <p className="text-green-600 mb-2">{message}</p>}
      {activeTab === Tab.Incomes && (
        <div className="space-y-3">
          <label className="block text-sm">Data</label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={incomeDate}
            onChange={(e) => setIncomeDate(e.target.value)}
          />
          <label className="block text-sm">Origem</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Ex: Salário, Dobra sábado"
            value={incomeSource}
            onChange={(e) => setIncomeSource(e.target.value)}
          />
          <label className="block text-sm">Valor</label>
          <input
            type="number"
            step="0.01"
            className="w-full p-2 border rounded"
            value={incomeAmount}
            onChange={(e) => setIncomeAmount(e.target.value)}
          />
          <button onClick={handleAddIncome} className="w-full py-2 bg-blue-600 text-white rounded">
            Lançar Entrada
          </button>
        </div>
      )}
      {activeTab === Tab.Expenses && (
        <div className="space-y-3">
          <label className="block text-sm">Data</label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
          />
          <label className="block text-sm">Descrição</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Ex: Mercado, Gasolina"
            value={expenseDescription}
            onChange={(e) => setExpenseDescription(e.target.value)}
          />
          <label className="block text-sm">Valor</label>
          <input
            type="number"
            step="0.01"
            className="w-full p-2 border rounded"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
          />
          <button onClick={handleAddExpense} className="w-full py-2 bg-blue-600 text-white rounded">
            Lançar Saída
          </button>
        </div>
      )}
      {activeTab === Tab.Debts && (
        <div className="space-y-3">
          <label className="block text-sm">Credor</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={debtCreditor}
            onChange={(e) => setDebtCreditor(e.target.value)}
          />
          <label className="block text-sm">Tipo</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Ex: Empréstimo, Cartão"
            value={debtType}
            onChange={(e) => setDebtType(e.target.value)}
          />
          <label className="block text-sm">Valor total (opcional)</label>
          <input
            type="number"
            step="0.01"
            className="w-full p-2 border rounded"
            value={debtTotal}
            onChange={(e) => setDebtTotal(e.target.value)}
          />
          <label className="block text-sm">Parcela mensal</label>
          <input
            type="number"
            step="0.01"
            className="w-full p-2 border rounded"
            value={debtInstallment}
            onChange={(e) => setDebtInstallment(e.target.value)}
          />
          <label className="block text-sm">Dia de vencimento</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={debtDueDay}
            onChange={(e) => setDebtDueDay(e.target.value)}
          />
          <label className="block text-sm">Status</label>
          <select
            className="w-full p-2 border rounded"
            value={debtStatus}
            onChange={(e) => setDebtStatus(e.target.value)}
          >
            <option value="Ativa">Ativa</option>
            <option value="Negociada">Negociada</option>
            <option value="Quitada">Quitada</option>
          </select>
          <button onClick={handleAddDebt} className="w-full py-2 bg-blue-600 text-white rounded">
            Cadastrar Dívida
          </button>
        </div>
      )}
      <button
        onClick={() => router.push('/panel')}
        className="w-full mt-4 py-2 bg-gray-300 text-gray-800 rounded"
      >
        Voltar
      </button>
    </Layout>
  );
}