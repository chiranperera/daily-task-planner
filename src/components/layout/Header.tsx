export function Header() {
  return (
    <header className="bg-primary text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <h1 className="text-lg font-bold tracking-tight">Grocery Tracker</h1>
      </div>
    </header>
  );
}
