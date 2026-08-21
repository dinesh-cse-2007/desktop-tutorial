import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { specialty, status, city } = req.query || {};
      let query = supabase.from('hospitals').select('*').order('id', { ascending: true });

      if (city) query = query.eq('city', city);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;

      let result = data;
      if (specialty) {
        result = data.filter(h => Array.isArray(h.specialties) && h.specialties.includes(specialty));
      }

      return res.status(200).json(result);
    }

    if (req.method === 'POST') {
      const hospitalData = req.body;
      const { data, error } = await supabase
        .from('hospitals')
        .insert(hospitalData)
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'Hospital ID required' });

      const { data, error } = await supabase
        .from('hospitals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('hospitals').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API hospitals error:', err);
    res.status(500).json({ error: err.message });
  }
}
