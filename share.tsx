import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';

interface Viewer {
  id: string;
  display_name: string | null;
  email: string | null;
}

export default function Share() {
  const router = useRouter();
  const [adminId, setAdminId] = useState('');
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      const userId = session.user.id;
      setAdminId(userId);
      // Fetch linked viewers
      const { data: links, error: linkErr } = await supabase
        .from('family_links')
        .select('viewer_id, profiles!viewer_id(id, display_name)')
        .eq('admin_id', userId);
      if (linkErr) {
        console.error(linkErr);
      }
      const list: Viewer[] = [];
      if (links) {
        for (const link of links) {
          const profile = (link as any).profiles;
          list.push({ id: profile.id, display_name: profile.display_name, email: null });
        }
      }
      setViewers(list);
      setLoading(false);
    };
    init();
  }, [router]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(adminId);
      alert('Código copiado!');
    } catch (e) {
      alert('Não foi possível copiar. Copie manualmente.');
    }
  };

  if (loading) return <Layout>Carregando...</Layout>;
  return (
    <Layout title="Compartilhar">
      <h1 className="text-xl font-bold mb-4 text-center">Compartilhar com Sogro</h1>
      <p className="mb-2">Para vincular um visualizador à sua conta, envie o código abaixo ao sogro:</p>
      <div className="flex items-center mb-3">
        <input
          type="text"
          readOnly
          value={adminId}
          className="flex-1 p-2 border rounded-l"
        />
        <button onClick={copyCode} className="px-4 bg-blue-600 text-white rounded-r">
          Copiar
        </button>
      </div>
      <p className="text-sm mb-4">
        O sogro deve criar uma conta de visualizador e inserir este código na página de
        vinculação.
      </p>
      <h2 className="text-lg font-semibold mb-2">Visualizadores vinculados</h2>
      {viewers.length === 0 ? (
        <p>Nenhum visualizador vinculado ainda.</p>
      ) : (
        <ul className="space-y-2">
          {viewers.map((viewer) => (
            <li
              key={viewer.id}
              className="bg-white p-2 border rounded flex justify-between items-center"
            >
              <span>{viewer.display_name || viewer.id}</span>
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={() => router.push('/panel')}
        className="w-full py-2 bg-gray-300 text-gray-800 rounded mt-4"
      >
        Voltar
      </button>
    </Layout>
  );
}