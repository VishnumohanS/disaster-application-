import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { volunteerAPI, centerAPI } from '../api/api';

const SKILLS = ['Medical', 'Rescue', 'Logistics', 'Communication', 'Engineering', 'Cooking', 'First Aid', 'Driving'];
const empty = { name: '', email: '', phone: '', skills: [], availabilityStatus: 'available' };

export default function Volunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [dispatchModal, setDispatchModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [dispatchTarget, setDispatchTarget] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [form, setForm] = useState(empty);
  const [filter, setFilter] = useState({ status: '', skill: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      const [vRes, cRes] = await Promise.all([volunteerAPI.getAll(), centerAPI.getAll()]);
      setVolunteers(vRes.data.data);
      setCenters(cRes.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setError(''); setModal(true); };
  const openEdit = (v) => { 
    setEditing(v._id); 
    setForm({ 
      name: v.name, 
      email: v.email, 
      phone: v.phone, 
      skills: v.skills,
      availabilityStatus: v.availabilityStatus 
    }); 
    setError(''); 
    setModal(true); 
  };
  const openDispatch = (v) => { setDispatchTarget(v); setSelectedCenter(''); setDispatchModal(true); };

  const toggleSkill = (skill) => {
    setForm(f => ({ ...f, skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editing) await volunteerAPI.update(editing, form);
      else await volunteerAPI.register(form);
      setModal(false); setSuccess(editing ? 'Volunteer updated!' : 'Volunteer registered!');
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch (err) { setError(err.response?.data?.message || 'Error saving volunteer'); }
  };

  const handleDispatch = async () => {
    if (!selectedCenter) return;
    try {
      await volunteerAPI.dispatch(dispatchTarget._id, selectedCenter);
      setDispatchModal(false); setSuccess('Volunteer dispatched!');
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch (err) { alert(err.response?.data?.message || 'Dispatch failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this volunteer?')) return;
    await volunteerAPI.delete(id); load();
  };

  const filtered = volunteers.filter(v => {
    if (filter.status && v.availabilityStatus !== filter.status) return false;
    if (filter.skill && !v.skills.includes(filter.skill)) return false;
    return true;
  });

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🙋 Volunteers</h1>
          <p className="page-subtitle">{volunteers.length} total volunteers registered</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Register Volunteer</button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      <div className="filters-bar">
        <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="deployed">Deployed</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <select value={filter.skill} onChange={e => setFilter({ ...filter, skill: e.target.value })}>
          <option value="">All Skills</option>
          {SKILLS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🙋</div><p>No volunteers found</p></div>
      ) : (
        <div className="volunteer-grid">
          {filtered.map(v => (
            <div key={v._id} className="vol-card">
              <div className="vol-card-header">
                <div>
                  <div className="vol-name">{v.name}</div>
                  <div className="vol-email">{v.email}</div>
                  <div className="vol-phone">📞 {v.phone}</div>
                </div>
                <span className={`badge badge-${v.availabilityStatus}`}>{v.availabilityStatus}</span>
              </div>
              {v.assignedCenterId && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>📍 {v.assignedCenterId.name}</div>
              )}
              <div className="vol-skills">
                {v.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
              </div>
              <div className="vol-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(v)}>Edit</button>
                {v.availabilityStatus === 'available' && (
                  <button className="btn btn-success btn-sm" onClick={() => openDispatch(v)}>Dispatch</button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Volunteer' : 'Register Volunteer'}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Availability Status</label>
            <select 
              value={form.availabilityStatus} 
              onChange={e => setForm({ ...form, availabilityStatus: e.target.value })}
              className="form-control"
              style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '6px' }}
            >
              <option value="available">Available (Ready for Dispatch)</option>
              <option value="unavailable">Not Available</option>
              <option value="deployed">Deployed (On Mission)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Skills (select multiple)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {SKILLS.map(s => (
                <button key={s} type="button"
                  onClick={() => toggleSkill(s)}
                  style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                    background: form.skills.includes(s) ? 'var(--blue)' : 'transparent',
                    color: form.skills.includes(s) ? '#fff' : 'var(--text-secondary)',
                    border: `1px solid ${form.skills.includes(s) ? 'var(--blue)' : 'var(--border)'}`,
                  }}>{s}</button>
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Register'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={dispatchModal} onClose={() => setDispatchModal(false)} title={`Dispatch ${dispatchTarget?.name}`}>
        <div className="form-group">
          <label>Select Relief Center</label>
          <select value={selectedCenter} onChange={e => setSelectedCenter(e.target.value)}>
            <option value="">Choose center...</option>
            {centers.filter(c => c.status === 'active').map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setDispatchModal(false)}>Cancel</button>
          <button className="btn btn-success" onClick={handleDispatch} disabled={!selectedCenter}>Dispatch</button>
        </div>
      </Modal>
    </div>
  );
}
