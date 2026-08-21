import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const referralData = {
        ...req.body,
        created_at: req.body.created_at || new Date().toISOString(),
        status: req.body.status || 'Dispatched'
      };

      const { data, error } = await supabase
        .from('referrals')
        .insert(referralData)
        .select()
        .single();

      if (error) throw error;

      // Optionally increment ER occupancy or update hospital status
      if (req.body.assigned_hospital_id) {
        const { data: hosp } = await supabase
          .from('hospitals')
          .select('icu_beds_available, er_capacity_pct')
          .eq('id', req.body.assigned_hospital_id)
          .single();

        if (hosp) {
          const newIcu = Math.max(0, (hosp.icu_beds_available || 1) - 1);
          const newErPct = Math.min(100, (hosp.er_capacity_pct || 70) + 3);
          await supabase
            .from('hospitals')
            .update({ icu_beds_available: newIcu, er_capacity_pct: newErPct })
            .eq('id', req.body.assigned_hospital_id);
        }
      }

      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, status } = req.body;
      if (!id || !status) return res.status(400).json({ error: 'id and status required' });

      const { data, error } = await supabase
        .from('referrals')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('referrals').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API referrals error:', err);
    res.status(500).json({ error: err.message });
  }
}
