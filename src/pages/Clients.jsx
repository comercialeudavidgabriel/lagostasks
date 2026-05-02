import { useState } from 'react';
import { Plus, Search, Trash2, X } from 'lucide-react';
import { useClients } from '../hooks/useClients';
import { useAuth } from '../AuthContext';
import { MOMENTOS, PLANOS, SITUACOES } from '../constants';
import './Clients.css';

function situacaoMeta(id) {
  return SITUACOES.find(s => s.id === id);
}

export function Clients() {
  const { isAdmin } = useAuth();
  const { clients, loading, error, createClient, updateClient, deleteClient } = useClients();
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);

  const filtered = clients.filter(c => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || String(c.code).includes(q);
  });

  const selected = clients.find(c => c.id === selectedId) || null;

  return (
    <div className="clients-page">
      <div className="clients-list-pane">
        <div className="clients-toolbar">
          <div className="clients-search">
            <Search size={16} />
            <input
              placeholder="Buscar por código ou nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {isAdmin && (
            <button className="btn-primary" onClick={() => setCreating(true)}>
              <Plus size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Novo
            </button>
          )}
        </div>

        {loading && <div className="clients-empty">Carregando...</div>}
        {error && <div className="clients-empty">Erro: {error.message}</div>}
        {!loading && filtered.length === 0 && (
          <div className="clients-empty">Nenhum cliente encontrado.</div>
        )}

        <div className="clients-list">
          {filtered.map(c => {
            const s = situacaoMeta(c.situacao);
            return (
              <button
                key={c.id}
                className={`client-row ${selectedId === c.id ? 'active' : ''}`}
                onClick={() => setSelectedId(c.id)}
              >
                <div className="client-row-main">
                  <span className="client-code">{c.code}</span>
                  <span className="client-name">{c.name}</span>
                </div>
                {s && (
                  <span className="situacao-pill" style={{ background: s.color + '22', color: s.color }}>
                    {s.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <ClientDetail
          key={selected.id}
          client={selected}
          isAdmin={isAdmin}
          onUpdate={(patch) => updateClient(selected.id, patch)}
          onDelete={async () => {
            if (window.confirm(`Excluir cliente "${selected.name}"?`)) {
              await deleteClient(selected.id);
              setSelectedId(null);
            }
          }}
          onClose={() => setSelectedId(null)}
        />
      )}
      {!selected && (
        <div className="clients-detail-empty">
          Selecione um cliente à esquerda para ver os detalhes.
        </div>
      )}

      {creating && (
        <NewClientModal
          existingCodes={clients.map(c => c.code)}
          onCancel={() => setCreating(false)}
          onCreate={async (data) => {
            await createClient(data);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="detail-field">
      <label className="detail-field-label">{label}</label>
      {children}
    </div>
  );
}

function ClientDetail({ client, isAdmin, onUpdate, onDelete, onClose }) {
  const ro = !isAdmin;

  const update = (patch) => {
    if (!isAdmin) return;
    onUpdate(patch);
  };

  const updNumber = (key) => (e) => {
    const v = e.target.value;
    update({ [key]: v === '' ? null : Number(v) });
  };
  const upd = (key) => (e) => update({ [key]: e.target.value || null });

  return (
    <div className="client-detail">
      <div className="detail-header">
        <div>
          <div className="client-detail-code">{client.code}</div>
          <input
            className="client-detail-name"
            value={client.name}
            onChange={(e) => update({ name: e.target.value })}
            disabled={ro}
          />
        </div>
        <button className="btn-icon" onClick={onClose}><X size={18} /></button>
      </div>

      <div className="detail-body" style={{ overflowY: 'auto' }}>
        <section className="detail-section">
          <h3 className="detail-section-title">Área Operacional</h3>
          <div className="detail-grid">
            <Field label="Drive">
              <input className="detail-input" value={client.drive_link || ''} onChange={upd('drive_link')} disabled={ro} placeholder="https://drive.google.com/..." />
            </Field>
            <Field label="Acessos">
              <textarea className="detail-textarea" value={client.acessos || ''} onChange={upd('acessos')} disabled={ro} placeholder="Credenciais, links e observações" />
            </Field>
            <Field label="Formulário">
              <input className="detail-input" value={client.formulario || ''} onChange={upd('formulario')} disabled={ro} placeholder="Link ou status do formulário" />
            </Field>
            <Field label="Onboarding">
              <textarea className="detail-textarea" value={client.onboarding || ''} onChange={upd('onboarding')} disabled={ro} />
            </Field>
            <Field label="Estratégia">
              <textarea className="detail-textarea" value={client.estrategia || ''} onChange={upd('estrategia')} disabled={ro} />
            </Field>
            <Field label="Momento da operação">
              <select className="detail-select" value={client.momento || ''} onChange={upd('momento')} disabled={ro}>
                <option value="">—</option>
                {MOMENTOS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </Field>
            <Field label="CRM (incluso no plano?)">
              <label className="checkbox-row">
                <input type="checkbox" checked={!!client.has_crm} onChange={(e) => update({ has_crm: e.target.checked })} disabled={ro} />
                <span>Sim, este cliente tem CRM no plano</span>
              </label>
              {client.has_crm && (
                <textarea className="detail-textarea" placeholder="Notas do CRM" value={client.crm_notes || ''} onChange={upd('crm_notes')} disabled={ro} style={{ marginTop: 8 }} />
              )}
            </Field>
          </div>
        </section>

        <section className="detail-section">
          <h3 className="detail-section-title">Área Comercial</h3>
          <div className="detail-grid">
            <Field label="Produto / Serviço">
              <textarea className="detail-textarea" value={client.produto || ''} onChange={upd('produto')} disabled={ro} />
            </Field>
            <Field label="Valor de pagamento (R$)">
              <input type="number" step="0.01" className="detail-input" value={client.valor_pagamento ?? ''} onChange={updNumber('valor_pagamento')} disabled={ro} />
            </Field>
            <Field label="Plano">
              <select className="detail-select" value={client.plano || ''} onChange={upd('plano')} disabled={ro}>
                <option value="">—</option>
                {PLANOS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </Field>
            <Field label="Entregáveis">
              <textarea className="detail-textarea" value={client.entregaveis || ''} onChange={upd('entregaveis')} disabled={ro} />
            </Field>
            <Field label="Contrato">
              <input className="detail-input" value={client.contrato_link || ''} onChange={upd('contrato_link')} disabled={ro} placeholder="Link do contrato" />
            </Field>
            <Field label="Dia de pagamento">
              <input type="number" min={1} max={31} className="detail-input" value={client.dia_pagamento ?? ''} onChange={updNumber('dia_pagamento')} disabled={ro} placeholder="1-31" />
            </Field>
            <Field label="Início do contrato">
              <input type="date" className="detail-input" value={client.data_inicio || ''} onChange={upd('data_inicio')} disabled={ro} />
            </Field>
            <Field label="Situação">
              <select className="detail-select" value={client.situacao || ''} onChange={upd('situacao')} disabled={ro}>
                <option value="">—</option>
                {SITUACOES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
          </div>
        </section>

        {!isAdmin && (
          <div className="readonly-note">
            🔒 Você está visualizando em modo leitura. Apenas administradores podem editar clientes.
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="detail-footer">
          <button className="btn-danger" onClick={onDelete}>
            <Trash2 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Excluir
          </button>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            Alterações são salvas automaticamente
          </span>
        </div>
      )}
    </div>
  );
}

function NewClientModal({ existingCodes, onCancel, onCreate }) {
  const nextCode = existingCodes.length ? Math.max(...existingCodes) + 1 : 100;
  const [code, setCode] = useState(nextCode);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (existingCodes.includes(Number(code))) {
      setError('Código já em uso. Escolha outro.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onCreate({ code: Number(code), name: name.trim() });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <h2>Novo cliente</h2>
          <button type="button" className="btn-icon" onClick={onCancel}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="field-row">
            <Field label="Código">
              <input type="number" className="detail-input" value={code} onChange={(e) => setCode(e.target.value)} required />
            </Field>
            <Field label="Nome">
              <input className="detail-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Cliente cliente" required autoFocus />
            </Field>
          </div>
          {error && <div className="login-error">{error}</div>}
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            Os demais campos podem ser preenchidos depois, no detalhe do cliente.
          </p>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Criando...' : 'Criar'}</button>
        </div>
      </form>
    </div>
  );
}
