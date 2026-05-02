import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabase';
import './Login.css';

async function resolveEmail({ name, email }) {
  const trimmedEmail = email.trim();
  if (trimmedEmail) return trimmedEmail;

  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('Informe o nome ou o email.');
  }

  const { data, error } = await supabase.rpc('email_for_name', { p_name: trimmedName });
  if (error) {
    throw new Error('Não foi possível resolver o nome. Tente o email.');
  }
  if (!data) {
    throw new Error('Nome não encontrado. Verifique a grafia ou use o email.');
  }
  return data;
}

export function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setInfo('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        const resolved = await resolveEmail({ name, email });
        await signIn(resolved, password);
      } else {
        if (!name.trim()) throw new Error('Informe um nome.');
        if (!email.trim()) throw new Error('Informe um email.');
        const result = await signUp(name.trim(), email.trim(), password);

        if (result?.session) {
          // Tudo certo — App vai redirecionar.
          return;
        }
        if (result?.user && !result.session) {
          // "Confirm email" está ativo no Supabase. A conta foi criada, mas precisa de confirmação.
          setInfo(
            'Conta criada! Verifique a caixa de entrada do email informado para confirmar. '
            + 'Se você é o admin do Supabase, pode desativar essa exigência em Authentication → Sign In/Up → "Confirm email".'
          );
          setMode('signin');
          return;
        }
        // Caso raro (Supabase respondeu sem user e sem session) — geralmente email já em uso.
        setError('Não foi possível criar a conta. O email pode já estar em uso ou ser inválido.');
      }
    } catch (err) {
      console.error('[Login] erro:', err);
      const msg = err?.message || 'Erro ao autenticar.';
      // Mensagens mais amigáveis para erros comuns do Supabase
      if (/Email rate limit/i.test(msg)) {
        setError('Muitas tentativas. Aguarde alguns minutos e tente de novo.');
      } else if (/User already registered|already exists/i.test(msg)) {
        setError('Este email já tem conta. Use a aba "Entrar".');
      } else if (/Password should be at least/i.test(msg)) {
        setError('A senha precisa ter pelo menos 6 caracteres.');
      } else if (/Email not confirmed/i.test(msg)) {
        setError(
          'Email ainda não confirmado. Opções: (1) abra o link de confirmação que o Supabase mandou no seu email, '
          + '(2) no painel do Supabase: Authentication → Users → abra o usuário → "..." → "Confirm user", '
          + 'ou (3) desative a exigência em Authentication → Sign In/Up → desmarque "Confirm email".'
        );
      } else if (/Invalid login credentials/i.test(msg)) {
        setError('Nome/email ou senha incorretos. Se acabou de criar a conta, talvez ela ainda precise de confirmação por email.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo" />
          <h1>Tasks Lagos</h1>
          <p>Gestão de criativos da operação</p>
        </div>

        <div className="login-tabs">
          <button
            type="button"
            className={mode === 'signin' ? 'active' : ''}
            onClick={() => switchMode('signin')}
          >
            Entrar
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => switchMode('signup')}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-field">
            <span>Nome{mode === 'signin' && <em className="field-hint"> (ou preencha o email abaixo)</em>}</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={mode === 'signin' ? 'Ex: David' : 'Como devemos te chamar?'}
              required={mode === 'signup'}
              autoComplete="name"
            />
          </label>

          <label className="login-field">
            <span>Email{mode === 'signin' && <em className="field-hint"> (opcional se preencheu o nome)</em>}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@empresa.com"
              required={mode === 'signup'}
              autoComplete="email"
            />
          </label>

          <label className="login-field">
            <span>Senha</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </label>

          {error && <div className="login-error">{error}</div>}
          {info && <div className="login-info">{info}</div>}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Aguarde...' : mode === 'signin' ? 'Entrar' : 'Criar conta'}
          </button>

          <p className="login-helper">
            {mode === 'signin' ? (
              <>Não tem conta? <button type="button" onClick={() => switchMode('signup')}>Criar agora</button></>
            ) : (
              <>Já tem conta? <button type="button" onClick={() => switchMode('signin')}>Entrar</button></>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
