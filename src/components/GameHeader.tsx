interface GameHeaderProps {
  onLeave: () => void;
  onHelp: () => void;
  className?: string;
}

export function GameHeader({
  onLeave,
  onHelp,
  className = "",
}: GameHeaderProps) {
  return (
    <header className={`flex items-center justify-between ${className}`}>
      <button type="button" onClick={onLeave} aria-label="Leave game">
        <span className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500 tracking-tighter cursor-pointer animate-moving-gradient">
          SPYFALL
        </span>
      </button>
      <button
        type="button"
        onClick={onHelp}
        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition-colors"
      >
        Help
      </button>
    </header>
  );
}
