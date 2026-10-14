// src/components/EventCardSkeleton.tsx
export default function EventCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm animate-pulse">
      <div className="h-48 bg-slate-200" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="h-3 bg-slate-200 rounded w-5/6" />
        <div className="h-3 bg-slate-200 rounded w-2/3" />
        <div className="h-3 bg-slate-200 rounded w-1/4 mt-2" />
      </div>
    </div>
  );
}
