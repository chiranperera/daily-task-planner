export function Header() {
  return (
    <header className="bg-white border-b border-neutral-200 px-5 py-4 sticky top-0 z-30">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <h1 className="text-[15px] font-semibold tracking-tight text-neutral-900">
          Grocery Tracker
        </h1>
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400">
          Inventory
        </span>
      </div>
    </header>
  );
}
