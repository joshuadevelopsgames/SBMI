export default function AdminReportsPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px w-8 bg-[#C9A227]" />
        <span className="text-xs tracking-[0.2em] text-[#C9A227] uppercase font-medium">
          Reports
        </span>
      </div>
      <h1 className="text-2xl font-serif font-light text-[#1B4332] mb-4">
        Reports
      </h1>
      <div className="sbmi-card rounded-none p-6">
        <p className="text-[#3D5A4C]">
          Financial and membership reports — coming soon.
        </p>
      </div>
    </div>
  );
}
