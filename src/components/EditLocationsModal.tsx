import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import { X, Check } from "lucide-react";

interface EditLocationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameData: Record<string, { location: string; roles: string[] }[]>;
  selectedLocations: string[];
  onUpdate: (newSelectedLocations: string[]) => void;
}

export function EditLocationsModal({
  isOpen,
  onClose,
  gameData,
  selectedLocations,
  onUpdate,
}: EditLocationsModalProps) {
  const [localSelected, setLocalSelected] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      // If selectedLocations is empty (e.g. first load), default to all Spyfall 1
      if (!selectedLocations || selectedLocations.length === 0) {
        const spyfall1Locations =
          gameData.spyfall1?.map((l) => l.location) || [];
        setLocalSelected(spyfall1Locations);
      } else {
        setLocalSelected(selectedLocations);
      }
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleLocation = (location: string) => {
    setLocalSelected((prev) => {
      if (prev.includes(location)) {
        return prev.filter((l) => l !== location);
      } else {
        return [...prev, location];
      }
    });
  };

  const handleSelectAllSet = (setKey: string) => {
    const setLocations = gameData[setKey]?.map((l) => l.location) || [];
    setLocalSelected((prev) => {
      const newSet = new Set(prev);
      setLocations.forEach((l) => newSet.add(l));
      return Array.from(newSet);
    });
  };

  const handleClearSet = (setKey: string) => {
    const setLocations = gameData[setKey]?.map((l) => l.location) || [];
    setLocalSelected((prev) => prev.filter((l) => !setLocations.includes(l)));
  };

  const handleSave = () => {
    onUpdate(localSelected);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Edit Locations</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-8">
          {Object.entries(gameData).map(([setKey, locations]) => {
            const setLocationNames = locations.map((l) => l.location);
            const selectedCount = setLocationNames.filter((l) =>
              localSelected.includes(l)
            ).length;

            return (
              <div key={setKey} className="space-y-3">
                <div className="flex items-center justify-between sticky top-0 bg-slate-900/95 py-3 z-10 border-b border-slate-800 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-blue-400 capitalize">
                      {setKey.replace(/([A-Z])/g, " $1").trim()}
                    </h3>
                    <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded-full border border-slate-700">
                      {selectedCount} / {locations.length}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSelectAllSet(setKey)}
                      className="text-xs font-medium text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded bg-blue-900/10 hover:bg-blue-900/20 transition-colors border border-blue-500/20"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => handleClearSet(setKey)}
                      className="text-xs font-medium text-red-400 hover:text-red-300 px-3 py-1.5 rounded bg-red-900/10 hover:bg-red-900/20 transition-colors border border-red-500/20"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {locations
                    .sort((a, b) => a.location.localeCompare(b.location))
                    .map((loc) => {
                      const isSelected = localSelected.includes(loc.location);
                      return (
                        <button
                          key={loc.location}
                          onClick={() => handleToggleLocation(loc.location)}
                          className={`flex items-start justify-between p-2 sm:p-3 rounded-lg text-xs sm:text-sm text-left transition-all border group ${
                            isSelected
                              ? "bg-blue-900/20 border-blue-500/30 text-blue-100 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                              : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600"
                          }`}
                        >
                          <span className="mr-2 font-medium leading-tight">
                            {loc.location}
                          </span>
                          <div
                            className={`shrink-0 mt-0.5 transition-opacity ${
                              isSelected
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-20"
                            }`}
                          >
                            <Check
                              className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                isSelected ? "text-blue-400" : "text-slate-500"
                              }`}
                            />
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-700 flex justify-end gap-3 bg-slate-900 rounded-b-xl">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes ({localSelected.length})
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
