export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="text-base-content/70">Welcome back to your personal OS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card bg-base-200 shadow-sm border border-base-300 p-6">
          <h3 className="font-bold text-lg mb-2">System Status</h3>
          <div className="badge badge-success gap-2">
            Online
          </div>
        </div>
        {/* Add more widgets here */}
      </div>
    </div>
  );
}