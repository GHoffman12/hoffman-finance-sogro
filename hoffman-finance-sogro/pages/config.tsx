import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';

export default function Config() {
  const router = useRouter();
  const [salary, setSalary] = useState('');
  const [avgDobra, setAvgDobra] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [yearMonth, setYearMonth] = useState('');

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
      const now = new Date();
      const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setYearMonth(ym);
      // Fetch existing settings
      const { data: settingsData, error: settingsErr } = await supabase
        .from('settings_month')
        .select('*')
        .eq('year_month', ym)
        .limit(1);
      if (settingsErr) console.error(settingsErr);
      const existing = settingsData?.[0];
      if (existing) {
        setSalary(existing.salary_monthly?.toString() || '');
        setAvgDobra(existing.avg_dobra_value?.toString() || '');
      }
      setLoading(false);
    };
    init();
  }, [router]);

  const handleSave = async () => {
    setError('');
    setMessage('');
    if (!salary || !avgDobra) {
      setError('Preencha salário e valor médio da dobra');
      return;
    }
    const salaryNum = parseFloat(salary.replace(',', '.'));
    const avgNum = parseFloat(avgDobra.replace(',', '.'));
    const { error } = await supabase.from('settings_month').upsert({
      user_owner: userId,
      year_month: yearMonth,
      salary_monthly: salaryNum,
      avg_dobra_value: avgNum,
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Configurações salvas');
    }
  };

  const handleCopyFromPrevious = async () => {
    if (!yearMonth) return;
    const [year, month] = yearMonth.split('-').map((n) => parseInt(n, 10));
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }
    const prevYm = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
    const { data: prevData, error: prevErr } = await supabase
      .from('settings_month')
      .select('*')
      .eq('year_month', prevYm)
      .eq('user_owner', userId)
      .limit(1);
    if (prevErr) {
      setError(prevErr.message);
      return;
    }
    const prev = prevData?.[0];
    if (prev) {
      setSalary(prev.salary_monthly?.toString() || '');
      setAvgDobra(prev.avg_dobra_value?.toString() || '');
      setMessage('Configuração copiada do mês anterior');
    } else {
      setError('Não há configuração do mês anterior');
    }
  };

  if (loading) return <Layout>Carregando...</Layout>;
  return (
    <Layout title="Configurar Mês">
      <h1 className="text-xl font-bold mb-4 text-center">Configurações do Mês</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {message && <p className="text-green-600 mb-2">{message}</p>}
      <label className="block mb-2 text-sm">Salário mensal (R$)</label>
      <input
        type="number"
        step="0.01"
        className="w-full p-2 border rounded mb-3"
        value={salary}
        onChange={(e) => setSalary(e.target.value)}
      />
      <label className="block mb-2 text-sm">Valor médio de 1 dobra (R$)</label>
      <input
        type="number"
        step="0.01"
        className="w-full p-2 border rounded mb-3"
        value={avgDobra}
        onChange={(e) => setAvgDobra(e.target.value)}
      />
      <button onClick={handleSave} className="w-full py-2 bg-blue-600 text-white rounded mb-2">
        Salvar
      </button>
      <button onClick={handleCopyFromPrevious} className="w-full py-2 bg-gray-300 text-gray-800 rounded mb-2">
        Copiar do mês anterior
      </button>
      <button onClick={() => router.push('/panel')} className="w-full py-2 bg-gray-300 text-gray-800 rounded">
        Voltar
      </button>
    </Layout>
  );
}