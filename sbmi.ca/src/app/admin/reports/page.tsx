export default function AdminReportsPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 min-w-0 bg-[#D4A43A]" />
        <span className="text-xs tracking-[0.2em] text-[#D4A43A] uppercase font-medium shrink-0">
          Reports
        </span>
      </div>
      <h1 className="text-2xl font-display font-semibold text-[#1B5E3B] mb-4">
        Reports
      </h1>
      <div className="sbmi-card p-6">
        <p className="text-[#3D5A4A]">
          Financial and membership reports — coming soon.
        </p>
      </div>
    </div>
  );
}
