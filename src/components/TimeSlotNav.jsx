import { useMemo } from 'react';

const SLOTS = [
  { label: 'Matin', hour: 7 },
  { label: 'Midi', hour: 12 },
  { label: 'Après-midi', hour: 14 },
  { label: 'Soirée', hour: 21 },
  { label: 'Nuit', hour: 0 },
];

function getSlotEpoch(hour, dateOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dateOffset);
  d.setHours(hour, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

function getCurrentSlotIndex() {
  const h = new Date().getHours();
  if (h >= 0 && h < 7) return 4;
  if (h < 12) return 0;
  if (h < 14) return 1;
  if (h < 21) return 2;
  return 3;
}

export default function TimeSlotNav({ currentEpoch, onSelectEpoch }) {
  const isNow = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    return Math.abs(currentEpoch - now) < 3600;
  }, [currentEpoch]);

  const activeSlotIndex = useMemo(() => {
    if (isNow) return -1;
    const d = new Date(currentEpoch * 1000);
    const h = d.getHours();
    if (h >= 0 && h < 7) return 4;
    if (h < 12) return 0;
    if (h < 14) return 1;
    if (h < 21) return 2;
    return 3;
  }, [currentEpoch, isNow]);

  const dateStr = useMemo(() => {
    return new Date(currentEpoch * 1000).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }, [currentEpoch]);

  function handleNow() {
    onSelectEpoch(Math.floor(Date.now() / 1000));
  }

  function handleSlot(index) {
    const slot = SLOTS[index];
    const currentDate = new Date(currentEpoch * 1000);
    const d = new Date(currentDate);
    d.setHours(slot.hour, 0, 0, 0);
    onSelectEpoch(Math.floor(d.getTime() / 1000));
  }

  function handleDayOffset(offset) {
    const d = new Date(currentEpoch * 1000);
    d.setDate(d.getDate() + offset);
    onSelectEpoch(Math.floor(d.getTime() / 1000));
  }

  return (
    <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-700 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDayOffset(-1)}
            className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm text-white"
          >
            ←
          </button>
          <span className="text-white font-medium capitalize text-sm min-w-[160px] text-center">
            {dateStr}
          </span>
          <button
            onClick={() => handleDayOffset(1)}
            className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm text-white"
          >
            →
          </button>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={handleNow}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isNow
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Maintenant
          </button>
          {SLOTS.map((slot, i) => (
            <button
              key={slot.label}
              onClick={() => handleSlot(i)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeSlotIndex === i
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {slot.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
