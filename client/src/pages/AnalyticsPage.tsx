import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-dark-800/70 border border-white/10 p-6">
        <p className="text-sm text-dark-400 uppercase tracking-[0.18em]">Analytics</p>
        <h1 className="text-3xl font-semibold text-white">Insights & performance</h1>
        <p className="mt-3 text-sm text-dark-300">View ongoing market signals, portfolio metrics, and trade analytics in one place.</p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
