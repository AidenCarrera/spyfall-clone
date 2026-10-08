import { useState } from "react";
import { Check, MapPinned } from "lucide-react";
import { Button } from "./Button";
import { Modal, ModalHeader } from "./Modal";
import { DEFAULT_LOCATION_NAMES, LOCATION_SETS } from "@/lib/locations";
import { cn } from "@/lib/ui";

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
  return (
    <Modal
      isOpen={isOpen}
      onClose={contentProps.onClose}
      ariaLabelledBy="locations-modal-title"
      className="max-w-5xl"
      backdropClassName="bg-ink-950/85"
    >
      <EditLocationsModalContent {...contentProps} />
    </Modal>
  );
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
    <>
      <ModalHeader
        id="locations-modal-title"
        title="Edit Locations"
        icon={<MapPinned />}
        onClose={onClose}
        closeLabel="Close location editor"
      />

      <div className="flex-1 space-y-8 overflow-y-auto overscroll-contain px-4 pb-6 sm:px-6">
        {Object.entries(LOCATION_SETS).map(([setKey, locations]) => {
          const selectedCount = locations.filter((l) =>
            localSelected.has(l.location),
          ).length;

          return (
            <div key={setKey} className="space-y-3">
              <div className="sticky top-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] bg-ink-900/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
                <div className="flex items-center gap-3">
                  <h3 className="font-display text-xl font-bold uppercase tracking-[0.05em] text-brass-300">
                    {setKey.replace(/([A-Z])/g, " $1").trim()}
                  </h3>
                  <span className="rounded-full border border-white/10 bg-ink-800 px-2.5 py-0.5 font-mono text-xs tabular-nums text-ink-300">
                    {selectedCount} / {locations.length}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectAllSet(setKey)}
                    className="rounded-lg border border-brass-400/25 bg-brass-400/10 px-3 py-1.5 text-xs font-semibold text-brass-300 transition-colors hover:border-brass-400/50 hover:bg-brass-400/20"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClearSet(setKey)}
                    className="rounded-lg border border-crimson-400/25 bg-crimson-500/10 px-3 py-1.5 text-xs font-semibold text-crimson-300 transition-colors hover:border-crimson-400/50 hover:bg-crimson-500/20"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                {[...locations]
                  .sort((a, b) => a.location.localeCompare(b.location))
                  .map((loc) => {
                    const isSelected = localSelected.has(loc.location);
                    return (
                      <button
                        type="button"
                        key={loc.location}
                        aria-pressed={isSelected}
                        onClick={() => handleToggleLocation(loc.location)}
                        className={cn(
                          "group flex min-h-12 items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97]",
                          isSelected
                            ? "border-brass-400/45 bg-brass-400/[0.09] text-paper-50 shadow-[inset_0_0_0_1px_rgb(245_195_91/0.08)]"
                            : "border-white/[0.07] bg-ink-800/60 text-ink-300 hover:border-white/15 hover:bg-ink-800 hover:text-ink-100",
                        )}
                      >
                        <span className="leading-tight">{loc.location}</span>
                        <span
                          aria-hidden="true"
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-md border transition-all duration-150",
                            isSelected
                              ? "scale-100 border-brass-400 bg-brass-400 text-ink-950"
                              : "scale-90 border-ink-500 bg-transparent text-transparent group-hover:border-ink-400",
                          )}
                        >
                          <Check className="size-3.5" strokeWidth={3.5} />
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/[0.07] bg-ink-950/40 p-4">
        {localSelected.size === 0 && (
          <p role="alert" className="mr-auto text-sm text-crimson-300">
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
    </>
  );
}
