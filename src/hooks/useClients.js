import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase';

export function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('clients')
      .select('*')
      .order('code');
    if (err) {
      setError(err);
      setLoading(false);
      return;
    }
    setClients(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, [fetchAll]);

  const createClient = async ({ code, name }) => {
    const { error: err } = await supabase
      .from('clients')
      .insert({ code, name });
    if (err) throw err;
    await fetchAll();
  };

  const updateClient = async (id, patch) => {
    const { error: err } = await supabase.from('clients').update(patch).eq('id', id);
    if (err) throw err;
    setClients(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)));
  };

  const deleteClient = async (id) => {
    const { error: err } = await supabase.from('clients').delete().eq('id', id);
    if (err) throw err;
    setClients(prev => prev.filter(c => c.id !== id));
  };

  return { clients, loading, error, refetch: fetchAll, createClient, updateClient, deleteClient };
}
