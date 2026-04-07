import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import StatCard from '../components/StatCard';
import { inventoryAPI, volunteerAPI, centerAPI, dispatchAPI, zoneAPI } from '../api/api';

const COLORS = ['#1f6feb', '#3fb950', '#f85149', '#d29922', '#8b5cf6', '#e3b341', '#388bfd'];

export default function Dashboard() {
  const [stats, setStats] = useState({ centers: 0, volunteers: 0, dispatches: 0, lowStock: 0, activeZones: 0 });
  const [invStats, setInvStats] = useState([]);
  const [volStats, setVolStats] = useState([]);
  const [recentDispatches, setRecentDispatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cStats, vStats, iStats, dList, zStats] = await Promise.all([
          centerAPI.getStats(),
          volunteerAPI.getStats(),
          inventoryAPI.getStats(),
          dispatchAPI.getAll({ limit: 5 }),
          zoneAPI.getStats(),
        ]);
        setStats({
          centers: cStats.data.data.total,
          volunteers: vStats.data.data.available,
          dispatches: dList.data.data.filter(d => ['pending','active'].includes(d.status)).length,
          lowStock: iStats.data.data.lowStock,
          activeZones: zStats.data.data.active,
        });
        setInvStats(iStats.data.data.byCategory.map(c => ({ name: c._id, qty: c.totalQuantity })));
        setVolStats([
          { name: 'Available', value: vStats.data.data.available },
          { name: 'Deployed', value: vStats.data.data.deployed },
          { name: 'Unavailable', value: vStats.data.data.unavailable },
        ]);
        setRecentDispatches(dList.data.data.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Real-time overview of disaster relief operations</p>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}</span>
      </div>

      <div className="stats-grid">
        <StatCard title="Relief Centers" value={stats.centers} icon="🏢" color="blue" subtitle="Active facilities" />
        <StatCard title="Available Volunteers" value={stats.volunteers} icon="🙋" color="green" subtitle="Ready for dispatch" />
        <StatCard title="Active Dispatches" value={stats.dispatches} icon="🚚" color="yellow" subtitle="Pending & active" />
        <StatCard title="Low Stock Items" value={stats.lowStock} icon="⚠️" color="red" subtitle="Below threshold" />
        <StatCard title="Active Zones" value={stats.activeZones} icon="🔥" color="orange" subtitle="Disaster areas" />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">📦 Inventory by Category</div>
          {invStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={invStats} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, fontSize: 12 }} />
                <Bar dataKey="qty" fill="#1f6feb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><div className="empty-state-icon">📦</div><p>No inventory data yet</p></div>}
        </div>

        <div className="card">
          <div className="card-title">🙋 Volunteer Status</div>
          {volStats.some(v => v.value > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={volStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3}>
                  {volStats.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, fontSize: 12 }} />
                <Legend formatter={(v) => <span style={{ color: '#8b949e', fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><div className="empty-state-icon">🙋</div><p>No volunteer data yet</p></div>}
        </div>
      </div>

      <div className="card">
        <div className="card-title">🚚 Recent Dispatches</div>
        {recentDispatches.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Volunteer</th>
                  <th>Relief Center</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Dispatched At</th>
                </tr>
              </thead>
              <tbody>
                {recentDispatches.map(d => (
                  <tr key={d._id}>
                    <td>{d.volunteerId?.name || '—'}</td>
                    <td>{d.reliefCenterId?.name || '—'}</td>
                    <td>{d.dispatchType}</td>
                    <td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
                    <td>{new Date(d.dispatchedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="empty-state"><div className="empty-state-icon">🚚</div><p>No dispatches yet</p></div>}
      </div>
    </div>
  );
}
