import { useState } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { X, Check } from "lucide-react";
import { DEFAULT_LOCATION_NAMES, LOCATION_SETS } from "@/lib/locations";

interface EditLocationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocations: string[];
  onUpdate: (newSelectedLocations: string[]) => void;
}

export function EditLocationsModal({
  isOpen,
  ...contentProps
}: EditLocationsModalProps) {
  // Remounting on open resets any unsaved edits from the previous session.
  if (!isOpen) return null;

  return <EditLocationsModalContent {...contentProps} />;
}

type EditLocationsModalContentProps = Omit<EditLocationsModalProps, "isOpen">;

function EditLocationsModalContent({
  onClose,
  selectedLocations,
  onUpdate,
}: EditLocationsModalContentProps) {
  const [localSelected, setLocalSelected] = useState<ReadonlySet<string>>(
    () =>
      new Set(
        selectedLocations.length > 0
          ? selectedLocations
          : DEFAULT_LOCATION_NAMES,
      ),
  );

  const handleToggleLocation = (location: string) => {
    setLocalSelected((prev) => {
      const next = new Set(prev);
      if (!next.delete(location)) next.add(location);
      return next;
    });
  };

  const handleSelectAllSet = (setKey: string) => {
    setLocalSelected((prev) => {
      const next = new Set(prev);
      LOCATION_SETS[setKey]?.forEach((l) => next.add(l.location));
      return next;
    });
  };

  const handleClearSet = (setKey: string) => {
    setLocalSelected((prev) => {
      const next = new Set(prev);
      LOCATION_SETS[setKey]?.forEach((l) => next.delete(l.location));
      return next;
    });
  };

  const handleSave = () => {
    onUpdate([...localSelected]);
    onClose();
  };

  return (
    <Modal
      onClose={onClose}
      ariaLabelledBy="locations-modal-title"
      className="max-w-5xl"
      backdropClassName="bg-black/80"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 id="locations-modal-title" className="text-xl font-bold text-white">
          Edit Locations
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-label="Close location editor"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {Object.entries(LOCATION_SETS).map(([setKey, locations]) => {
          const selectedCount = locations.filter((l) =>
            localSelected.has(l.location),
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
                {[...locations]
                  .sort((a, b) => a.location.localeCompare(b.location))
                  .map((loc) => {
                    const isSelected = localSelected.has(loc.location);
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

      <div className="p-4 border-t border-slate-700 flex items-center justify-end gap-3 bg-slate-900 rounded-b-xl">
        {localSelected.size === 0 && (
          <p className="mr-auto text-sm text-red-400">
            Select at least one location.
          </p>
        )}
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={localSelected.size === 0}
        >
          Save Changes ({localSelected.size})
        </Button>
      </div>
    </Modal>
  );
}
