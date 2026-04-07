export default function StatCard({ title, value, icon, color, subtitle }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card-header">
        <span className="stat-icon">{icon}</span>
        <span className="stat-title">{title}</span>
      </div>
      <div className="stat-value">{value ?? '—'}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </div>
  );
}
