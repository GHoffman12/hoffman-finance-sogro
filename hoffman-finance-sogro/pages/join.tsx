import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';

export default function Join() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [viewerId, setViewerId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      setViewerId(session.user.id);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleJoin = async () => {
    setError('');
    setMessage('');
    if (!code) {
      setError('Insira o código da família');
      return;
    }
    const { error } = await supabase.from('family_links').insert({
      admin_id: code,
      viewer_id: viewerId,
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Vinculado com sucesso!');
      router.push('/panel');
    }
  };

  if (loading) return <Layout>Carregando...</Layout>;
  return (
    <Layout title="Vincular Família">
      <h1 className="text-xl font-bold mb-4 text-center">Entrar na família</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {message && <p className="text-green-600 mb-2">{message}</p>}
      <label className="block mb-2 text-sm">Código da família (admin)</label>
      <input
        type="text"
        className="w-full p-2 border rounded mb-3"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Cole aqui o código..."
      />
      <button onClick={handleJoin} className="w-full py-2 bg-blue-600 text-white rounded mb-2">
        Entrar
      </button>
      <button onClick={() => router.push('/panel')} className="w-full py-2 bg-gray-300 text-gray-800 rounded">
        Cancelar
      </button>
    </Layout>
  );
}