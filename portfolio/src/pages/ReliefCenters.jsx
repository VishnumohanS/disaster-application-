import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { centerAPI } from '../api/api';

const empty = { name: '', address: '', contactNumber: '', managerName: '', capacity: 100, currentOccupancy: 0, status: 'active', location: { lat: 20.5937, lng: 78.9629 } };

export default function ReliefCenters() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      const res = await centerAPI.getAll();
      setCenters(res.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setError(''); setModal(true); };
  const openEdit = (c) => {
    setEditing(c._id);
    setForm({ name: c.name, address: c.address, contactNumber: c.contactNumber, managerName: c.managerName || '', capacity: c.capacity, currentOccupancy: c.currentOccupancy, status: c.status, location: c.location });
    setError(''); setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editing) await centerAPI.update(editing, form);
      else await centerAPI.create(form);
      setModal(false); setSuccess(editing ? 'Center updated!' : 'Center created!');
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch (err) { setError(err.response?.data?.message || 'Error saving center'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this relief center?')) return;
    await centerAPI.delete(id); load();
  };

  const getCapacityColor = (occ, cap) => {
    const pct = cap > 0 ? (occ / cap) * 100 : 0;
    if (pct >= 90) return 'var(--red)';
    if (pct >= 70) return 'var(--yellow)';
    return 'var(--green)';
  };

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🏢 Relief Centers</h1>
          <p className="page-subtitle">{centers.filter(c => c.status === 'active').length} active centers</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Center</button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      {centers.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🏢</div><p>No relief centers added yet</p></div>
      ) : (
        <div className="centers-grid">
          {centers.map(c => {
            const pct = c.capacity > 0 ? Math.min((c.currentOccupancy / c.capacity) * 100, 100) : 0;
            return (
              <div key={c._id} className="center-card">
                <div className="center-card-header">
                  <div>
                    <div className="center-name">{c.name}</div>
                  </div>
                  <span className={`badge badge-${c.status}`}>{c.status}</span>
                </div>
                <div className="center-meta">
                  <div>📍 {c.address}</div>
                  <div>📞 {c.contactNumber}</div>
                  {c.managerName && <div>👤 {c.managerName}</div>}
                  <div>🌐 {c.location?.lat?.toFixed(4)}, {c.location?.lng?.toFixed(4)}</div>
                </div>
                <div className="capacity-bar-wrap">
                  <div className="capacity-label">
                    <span>Occupancy</span>
                    <span>{c.currentOccupancy} / {c.capacity}</span>
                  </div>
                  <div className="capacity-bar">
                    <div className="capacity-fill" style={{ width: `${pct}%`, background: getCapacityColor(c.currentOccupancy, c.capacity) }} />
                  </div>
                </div>
                <div className="btn-group" style={{ marginTop: 12 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Relief Center' : 'Add Relief Center'}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Center Name</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Contact Number</label>
              <input type="tel" value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Manager Name</label>
              <input type="text" value={form.managerName} onChange={e => setForm({ ...form, managerName: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Capacity</label>
              <input type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} required />
            </div>
            <div className="form-group">
              <label>Current Occupancy</label>
              <input type="number" min="0" value={form.currentOccupancy} onChange={e => setForm({ ...form, currentOccupancy: Number(e.target.value) })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Pin Number</label>
              <input type="number" step="any" value={form.location.lat} onChange={e => setForm({ ...form, location: { ...form.location, lat: Number(e.target.value) } })} required />
            </div>
           
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="full">Full</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create Center'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
