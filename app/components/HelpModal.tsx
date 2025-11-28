import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-blue-400">How to Play</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 text-slate-300 leading-relaxed">
                    <div className="space-y-2">
                        <p>
                            <strong className="text-white">Spyfall </strong> is a social deduction game where one player is the spy and doesn’t know the location. Everyone else sees the location and has a role. The spy’s goal is to figure out the location without being caught; non-spies try to identify the spy.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">1. Join a Game</h3>
                        <p>Enter a display name and join a lobby or create one.</p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">2. Setup</h3>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            <li>Each round, deal one card to each player: one spy, everyone else a location + role.</li>
                            <li>Agree on round duration (e.g., 6–8 minutes depending on players).</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">3. Game Flow</h3>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            <li>Players take turns asking each other subtle questions about the location.</li>
                            <li>Non-spies give hints to prove they know the location.</li>
                            <li>The spy listens carefully to gather clues.</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">4. Spy’s Guesses</h3>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            <li>The spy can stop the round and guess the location.</li>
                            <li>If correct, the spy wins; if wrong, non-spies win.</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">5. Optional Spy Voting</h3>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            <li>Players can vote to expose the spy during or at the end of a round.</li>
                            <li>Correctly identifying the spy ends the round with a non-spy win.</li>
                        </ul>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg space-y-2">
                        <h3 className="text-lg font-semibold text-blue-300">Tips</h3>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            <li>Ask questions carefully to avoid revealing too much.</li>
                            <li>Watch for vague or suspicious answers—they might be the spy.</li>
                        </ul>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-800 flex justify-end">
                    <Button onClick={onClose} variant="secondary">Close</Button>
                </div>
            </div>
        </div>,
        document.body
    );
}
