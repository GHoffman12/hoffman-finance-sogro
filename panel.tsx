import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';

interface Income {
  amount: number;
  source: string;
  date: string;
}
interface Expense {
  amount: number;
  description: string;
  date: string;
}
interface Debt {
  monthly_installment: number;
  status: string;
}
interface Setting {
  salary_monthly: number;
  avg_dobra_value: number;
}

export default function Panel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saldo, setSaldo] = useState(0);
  const [totalExtras, setTotalExtras] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalInstallments, setTotalInstallments] = useState(0);
  const [dobrasNecessarias, setDobrasNecessarias] = useState(0);
  const [dobrasFeitas, setDobrasFeitas] = useState(0);
  const [dobrasRestantes, setDobrasRestantes] = useState(0);
  const [salary, setSalary] = useState(0);
  const [avgDobra, setAvgDobra] = useState(0);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      // Get current year-month
      const now = new Date();
      const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      // Fetch settings
      const { data: settingsData, error: settingsErr } = await supabase
        .from('settings_month')
        .select('*')
        .eq('year_month', yearMonth)
        .limit(1);
      if (settingsErr) {
        console.error(settingsErr);
      }
      const setting: Setting | undefined = settingsData?.[0] as any;
      const salaryMonthly = setting?.salary_monthly || 0;
      const avgDobraValue = setting?.avg_dobra_value || 0;
      setSalary(salaryMonthly);
      setAvgDobra(avgDobraValue);
      // Fetch incomes for month
      const { data: incomesData, error: incomesErr } = await supabase
        .from('incomes')
        .select('*')
        .gte('date', `${yearMonth}-01`)
        .lte('date', `${yearMonth}-31`);
      if (incomesErr) console.error(incomesErr);
      const incomes = (incomesData as unknown as Income[]) || [];
      // Compute extras (treat all incomes as extras; salary is separate)
      const totalIncomes = incomes.reduce((acc, item) => acc + Number(item.amount), 0);
      setTotalExtras(totalIncomes);
      // Dobras feitas count: incomes where source includes "dobra" (case insensitive)
      const dobras = incomes.filter((inc) => inc.source.toLowerCase().includes('dobra')).length;
      setDobrasFeitas(dobras);
      // Fetch expenses
      const { data: expensesData, error: expensesErr } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', `${yearMonth}-01`)
        .lte('date', `${yearMonth}-31`);
      if (expensesErr) console.error(expensesErr);
      const expenses = (expensesData as unknown as Expense[]) || [];
      const totalExp = expenses.reduce((acc, item) => acc + Number(item.amount), 0);
      setTotalExpenses(totalExp);
      // Fetch debts
      const { data: debtsData, error: debtsErr } = await supabase
        .from('debts')
        .select('*')
        .neq('status', 'Quitada');
      if (debtsErr) console.error(debtsErr);
      const debts = (debtsData as unknown as Debt[]) || [];
      const totalInst = debts.reduce((acc, item) => acc + Number(item.monthly_installment), 0);
      setTotalInstallments(totalInst);
      // Compute saldo
      const totalIn = salaryMonthly + totalIncomes;
      const totalOut = totalExp + totalInst;
      const currentSaldo = totalIn - totalOut;
      setSaldo(currentSaldo);
      // Compute dobars needed
      let necessarias = 0;
      if (avgDobraValue && currentSaldo < 0) {
        necessarias = Math.ceil(Math.abs(currentSaldo) / avgDobraValue);
      }
      setDobrasNecessarias(necessarias);
      const restantes = Math.max(necessarias - dobras, 0);
      setDobrasRestantes(restantes);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <Layout title="Painel">
      <h1 className="text-xl font-bold mb-4 text-center">Painel Financeiro</h1>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="space-y-4">
          <Card label="Salário do mês" value={salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
          <Card label="Total extras" value={totalExtras.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
          <Card label="Total gastos" value={totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
          <Card label="Parcelas dívidas" value={totalInstallments.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
          <Card
            label="Saldo do mês"
            value={saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            highlight={saldo < 0 ? 'red' : 'green'}
          />
          <Card label="Valor médio de 1 dobra" value={avgDobra.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
          <Card label="Dobras necessárias" value={dobrasNecessarias.toString()} />
          <Card label="Dobras já feitas" value={dobrasFeitas.toString()} />
          <Card label="Dobras restantes" value={dobrasRestantes.toString()} highlight={dobrasRestantes > 0 ? 'red' : 'green'} />
          <button
            onClick={() => router.push('/launch')}
            className="w-full py-2 bg-blue-600 text-white rounded mt-4"
          >
            Lançar Entradas/Gastos
          </button>
          <button
            onClick={() => router.push('/config')}
            className="w-full py-2 bg-indigo-600 text-white rounded"
          >
            Configurar Mês
          </button>
          <button
            onClick={() => router.push('/share')}
            className="w-full py-2 bg-teal-600 text-white rounded"
          >
            Compartilhar
          </button>
          <button
            onClick={handleSignOut}
            className="w-full py-2 bg-gray-400 text-white rounded"
          >
            Sair
          </button>
        </div>
      )}
    </Layout>
  );
}

interface CardProps {
  label: string;
  value: string;
  highlight?: 'red' | 'green';
}

function Card({ label, value, highlight }: CardProps) {
  const colorClass = highlight === 'red' ? 'text-red-600' : highlight === 'green' ? 'text-green-600' : '';
  return (
    <div className="bg-white p-3 rounded shadow flex justify-between items-center">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className={`text-lg font-semibold ${colorClass}`}>{value}</span>
    </div>
  );
}