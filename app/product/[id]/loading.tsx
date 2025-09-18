export default function ProductLoading() {
  return (
    <div className="grid md:grid-cols-2 gap-10 animate-pulse">
      <div className="aspect-video rounded-lg bg-neutral-800" />
      <div className="space-y-4">
        <div className="h-8 w-2/3 bg-neutral-800 rounded" />
        <div className="h-6 w-24 bg-neutral-800 rounded" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-neutral-800 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
