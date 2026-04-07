import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { dispatchAPI, inventoryAPI, volunteerAPI } from '../api/api';

const COLORS = ['#1f6feb', '#3fb950', '#f85149', '#d29922', '#8b5cf6'];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [dispatchData, setDispatchData] = useState([]);
  const [inventoryStats, setInventoryStats] = useState([]);
  const [volunteerStats, setVolunteerStats] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [dList, iStats, vStats] = await Promise.all([
          dispatchAPI.getAll({ limit: 100 }),
          inventoryAPI.getStats(),
          volunteerAPI.getStats()
        ]);

        // 1. Process real dispatch data for the trend chart
        const dispatches = dList.data.data || [];
        const trendMap = {};
        
        // Initialize last 7 days with zero to ensure a continuous line even if no data
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          trendMap[dateStr] = 0;
        }

        dispatches.forEach(d => {
          const date = new Date(d.dispatchedAt || d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (trendMap.hasOwnProperty(date)) {
            trendMap[date]++;
          }
        });
        
        const trendData = Object.keys(trendMap).map(k => ({ date: k, count: trendMap[k] }));
        setDispatchData(trendData);

        // 2. Process real inventory distribution
        const catStats = iStats.data.data?.byCategory || [];
        setInventoryStats(catStats.map(c => ({ name: c._id || 'Uncategorized', qty: c.totalQuantity || 0 })));
        
        // 3. Process real volunteer status
        const vData = vStats.data.data || {};
        setVolunteerStats([
          { name: 'Available', value: vData.available || 0 },
          { name: 'Deployed', value: vData.deployed || 0 },
          { name: 'Unavailable', value: vData.unavailable || 0 },
        ]);

      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="page-subtitle">Historical data and operational insights</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">📈 Dispatch Trend (Last 7 Days)</div>
          {dispatchData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dispatchData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1f6feb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1f6feb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#30363d" />
                <XAxis dataKey="date" stroke="#8b949e" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#8b949e" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, fontSize: 12 }}
                  itemStyle={{ color: '#c9d1d9' }}
                />
                <Area type="monotone" dataKey="count" stroke="#1f6feb" fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No dispatch data available</p></div>}
        </div>

        <div className="card">
          <div className="card-title">📦 Inventory Distribution</div>
          {inventoryStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={inventoryStats} dataKey="qty" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                  {inventoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#e2e6ecff', border: '1px solid #30363d', borderRadius: 6, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#8b949e', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No inventory data available</p></div>}
        </div>
        
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-title">🙋 Volunteer Availability</div>
          {volunteerStats.some(v => v.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={volunteerStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#30363d" />
                <XAxis dataKey="name" stroke="#8b949e" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#8b949e" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                   cursor={{fill: 'rgba(238, 226, 226, 0.05)'}}
                   contentStyle={{ background: '#202123ff', border: '1px solid #30363d', borderRadius: 6, fontSize: 12 }} 
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {volunteerStats.map((entry, index) => (
                    <Cell key={`cell-v-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No volunteer data available</p></div>}
        </div>
      </div>
    </div>
  );
}
