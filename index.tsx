import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [role, setRole] = useState<'admin' | 'viewer'>('admin');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignIn = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      // Redirect to panel
      router.push('/panel');
    }
  };

  const handleSignUp = async () => {
    setError('');
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) {
      setError(error?.message || 'Erro ao cadastrar');
      return;
    }
    // Insert profile row
    const { error: profErr } = await supabase.from('profiles').insert({
      id: data.user.id,
      role,
      display_name: displayName || null,
    });
    if (profErr) {
      setError(profErr.message);
      return;
    }
    // If viewer, redirect to join page to link with admin
    if (role === 'viewer') {
      router.push('/join');
    } else {
      router.push('/panel');
    }
  };

  return (
    <Layout title="Login">
      <h1 className="text-2xl font-bold mb-4 text-center">Hoffman Finance</h1>
      <div className="bg-white shadow-md rounded-md p-4">
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <label className="block mb-2 text-sm font-medium">Email</label>
        <input
          className="w-full mb-3 p-2 border rounded"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="block mb-2 text-sm font-medium">Senha</label>
        <input
          className="w-full mb-3 p-2 border rounded"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {isSigningUp && (
          <>
            <label className="block mb-2 text-sm font-medium">Nome a exibir</label>
            <input
              className="w-full mb-3 p-2 border rounded"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <label className="block mb-2 text-sm font-medium">Tipo de conta</label>
            <select
              className="w-full mb-3 p-2 border rounded"
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'viewer')}
            >
              <option value="admin">Administrador</option>
              <option value="viewer">Visualizador</option>
            </select>
          </>
        )}
        {!isSigningUp ? (
          <>
            <button
              onClick={handleSignIn}
              className="w-full bg-blue-600 text-white py-2 rounded mb-2"
            >
              Entrar
            </button>
            <button
              onClick={() => setIsSigningUp(true)}
              className="w-full bg-gray-200 text-gray-800 py-2 rounded"
            >
              Criar conta
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleSignUp}
              className="w-full bg-green-600 text-white py-2 rounded mb-2"
            >
              Cadastrar
            </button>
            <button
              onClick={() => setIsSigningUp(false)}
              className="w-full bg-gray-200 text-gray-800 py-2 rounded"
            >
              Voltar
            </button>
          </>
        )}
      </div>
    </Layout>
  );
}