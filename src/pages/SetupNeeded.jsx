export function SetupNeeded() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'linear-gradient(135deg, #eff6ff, #f8fafc)'
    }}>
      <div style={{
        maxWidth: 540,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
        border: '1px solid #e2e8f0',
        padding: '2rem',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
          marginBottom: '1rem'
        }} />
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Tasks Lagos — configuração necessária
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.55, marginBottom: '1.25rem' }}>
          O app não consegue se conectar ao Supabase porque as variáveis de ambiente
          <code style={cdStyle}> VITE_SUPABASE_URL </code> e
          <code style={cdStyle}> VITE_SUPABASE_ANON_KEY </code> não foram definidas no ambiente onde o app está rodando.
        </p>

        <h2 style={h2Style}>Em desenvolvimento local</h2>
        <p style={pStyle}>
          Crie um arquivo <code style={cdStyle}>.env.local</code> na raiz do projeto com:
        </p>
        <pre style={preStyle}>{`VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...`}</pre>
        <p style={pStyle}>Em seguida rode <code style={cdStyle}>npm run dev</code> de novo.</p>

        <h2 style={h2Style}>No Vercel (produção)</h2>
        <ol style={{ paddingLeft: '1.25rem', color: '#334155', fontSize: '0.9rem', lineHeight: 1.7 }}>
          <li>Acesse o projeto no painel do Vercel.</li>
          <li><strong>Settings → Environment Variables</strong>.</li>
          <li>Adicione as duas variáveis acima, marcando <em>Production, Preview e Development</em>.</li>
          <li>Volte em <strong>Deployments</strong> e clique em <strong>Redeploy</strong> no deploy mais recente.</li>
        </ol>

        <p style={{ ...pStyle, marginTop: '1.25rem', fontSize: '0.82rem' }}>
          Detalhes completos de schema, RLS e criação dos admins estão em <code style={cdStyle}>supabase/README.md</code>.
        </p>
      </div>
    </div>
  );
}

const cdStyle = {
  background: '#f1f5f9',
  padding: '0.1rem 0.35rem',
  borderRadius: 4,
  fontSize: '0.85em',
  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
};
const h2Style = { fontSize: '0.95rem', fontWeight: 600, marginTop: '1.25rem', marginBottom: '0.5rem', color: '#0f172a' };
const pStyle = { color: '#334155', fontSize: '0.88rem', marginBottom: '0.5rem', lineHeight: 1.55 };
const preStyle = {
  background: '#0f172a',
  color: '#e2e8f0',
  padding: '0.75rem 1rem',
  borderRadius: 8,
  fontSize: '0.8rem',
  overflow: 'auto',
  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
};
