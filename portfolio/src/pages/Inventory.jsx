import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { inventoryAPI, centerAPI } from '../api/api';

const CATEGORIES = ['Food', 'Medicine', 'Clothing', 'Shelter', 'Equipment', 'Water', 'Other'];
const empty = { itemName: '', category: 'Food', quantity: 0, unit: 'units', minimumThreshold: 10, reliefCenterId: '' };

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [filter, setFilter] = useState({ category: '', centerId: '', search: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      const [iRes, cRes] = await Promise.all([inventoryAPI.getAll(), centerAPI.getAll()]);
      setItems(iRes.data.data);
      setCenters(cRes.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setError(''); setModal(true); };
  const openEdit = (item) => { setEditing(item._id); setForm({ itemName: item.itemName, category: item.category, quantity: item.quantity, unit: item.unit, minimumThreshold: item.minimumThreshold, reliefCenterId: item.reliefCenterId?._id || item.reliefCenterId }); setError(''); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editing) await inventoryAPI.update(editing, form);
      else await inventoryAPI.create(form);
      setModal(false); setSuccess(editing ? 'Item updated!' : 'Item added!');
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch (err) { setError(err.response?.data?.message || 'Error saving item'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    await inventoryAPI.delete(id); load();
  };

  const filtered = items.filter(i => {
    if (filter.category && i.category !== filter.category) return false;
    if (filter.centerId && i.reliefCenterId?._id !== filter.centerId) return false;
    if (filter.search && !i.itemName.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📦 Inventory</h1>
          <p className="page-subtitle">{items.length} items across all centers</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Item</button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="filters-bar">
          <input type="text" placeholder="Search items..." value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} />
          <select value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={filter.centerId} onChange={e => setFilter({ ...filter, centerId: e.target.value })}>
            <option value="">All Centers</option>
            {centers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Min Threshold</th>
                <th>Relief Center</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No inventory items found</td></tr>
              ) : filtered.map(item => (
                <tr key={item._id}>
                  <td><strong>{item.itemName}</strong></td>
                  <td>{item.category}</td>
                  <td>
                    <span style={{ color: item.quantity <= item.minimumThreshold ? 'var(--red)' : 'var(--text-primary)', fontWeight: 600 }}>
                      {item.quantity} {item.unit}
                    </span>
                  </td>
                  <td>{item.minimumThreshold} {item.unit}</td>
                  <td>{item.reliefCenterId?.name || '—'}</td>
                  <td>
                    {item.quantity === 0
                      ? <span className="badge badge-unavailable">Out of Stock</span>
                      : item.quantity <= item.minimumThreshold
                        ? <span className="badge badge-pending">Low Stock</span>
                        : <span className="badge badge-available">In Stock</span>
                    }
                  </td>
                  <td>
                    <div className="btn-group">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Inventory Item' : 'Add Inventory Item'}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Item Name</label>
            <input type="text" placeholder="e.g. Rice Bags" value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Unit</label>
              <input type="text" placeholder="units / kg / liters" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} required />
            </div>
            <div className="form-group">
              <label>Min Threshold</label>
              <input type="number" min="0" value={form.minimumThreshold} onChange={e => setForm({ ...form, minimumThreshold: Number(e.target.value) })} />
            </div>
          </div>
          <div className="form-group">
            <label>Relief Center</label>
            <select value={form.reliefCenterId} onChange={e => setForm({ ...form, reliefCenterId: e.target.value })} required>
              <option value="">Select center...</option>
              {centers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add Item'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
