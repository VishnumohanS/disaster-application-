import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { dispatchAPI, volunteerAPI, centerAPI } from '../api/api';

const TYPES = ['Medical', 'Rescue', 'Logistics', 'Supply', 'Evacuation', 'Assessment'];
const empty = { volunteerId: '', reliefCenterId: '', dispatchType: 'Medical', notes: '' };

export default function Dispatch() {
  const [dispatches, setDispatches] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      const [dRes, vRes, cRes] = await Promise.all([
        dispatchAPI.getAll(),
        volunteerAPI.getAll({ status: 'available' }),
        centerAPI.getAll(),
      ]);
      setDispatches(dRes.data.data);
      setVolunteers(vRes.data.data);
      setCenters(cRes.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      await dispatchAPI.create(form);
      setModal(false); setSuccess('Dispatch created!');
      setTimeout(() => setSuccess(''), 3000);
      setForm(empty); load();
    } catch (err) { setError(err.response?.data?.message || 'Error creating dispatch'); }
  };

  const handleStatusUpdate = async (id, status) => {
    await dispatchAPI.updateStatus(id, status); load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this dispatch?')) return;
    await dispatchAPI.delete(id); load();
  };

  const filtered = filter ? dispatches.filter(d => d.status === filter) : dispatches;

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🚚 Dispatch Operations</h1>
          <p className="page-subtitle">{dispatches.filter(d => ['pending','active'].includes(d.status)).length} active dispatches</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(empty); setError(''); setModal(true); }}>+ Create Dispatch</button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="filters-bar">
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Volunteer</th>
                <th>Relief Center</th>
                <th>Type</th>
                <th>Status</th>
                <th>Dispatched At</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No dispatches found</td></tr>
              ) : filtered.map(d => (
                <tr key={d._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{d.volunteerId?.name || '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.volunteerId?.phone}</div>
                  </td>
                  <td>{d.reliefCenterId?.name || '—'}</td>
                  <td><span className="skill-tag">{d.dispatchType}</span></td>
                  <td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
                  <td>{new Date(d.dispatchedAt).toLocaleDateString()}</td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: 160 }}>{d.notes || '—'}</td>
                  <td>
                    <div className="btn-group">
                      {d.status === 'pending' && <button className="btn btn-success btn-sm" onClick={() => handleStatusUpdate(d._id, 'active')}>Activate</button>}
                      {['pending','active'].includes(d.status) && <button className="btn btn-ghost btn-sm" onClick={() => handleStatusUpdate(d._id, 'completed')}>Complete</button>}
                      {['pending','active'].includes(d.status) && <button className="btn btn-danger btn-sm" onClick={() => handleStatusUpdate(d._id, 'cancelled')}>Cancel</button>}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d._id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Create Dispatch">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Volunteer (available only)</label>
            <select value={form.volunteerId} onChange={e => setForm({ ...form, volunteerId: e.target.value })} required>
              <option value="">Select volunteer...</option>
              {volunteers.map(v => <option key={v._id} value={v._id}>{v.name} — {v.skills.join(', ')}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Relief Center</label>
            <select value={form.reliefCenterId} onChange={e => setForm({ ...form, reliefCenterId: e.target.value })} required>
              <option value="">Select center...</option>
              {centers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Dispatch Type</label>
            <select value={form.dispatchType} onChange={e => setForm({ ...form, dispatchType: e.target.value })}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea rows={3} placeholder="Additional instructions..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Dispatch</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
