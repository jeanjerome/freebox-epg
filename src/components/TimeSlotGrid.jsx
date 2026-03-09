import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { TNT_CHANNELS } from '../config/channels';
import ChannelRow from './ChannelRow';

const WINDOW_HOURS = 3;
const WINDOW_SECONDS = WINDOW_HOURS * 3600;
const CHANNEL_COL_WIDTH = 128;

function formatHour(epoch) {
  return new Date(epoch * 1000).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TimeRuler({ windowStart, windowEnd, pxPerMinute }) {
  const marks = [];
  const startDate = new Date(windowStart * 1000);
  startDate.setMinutes(0, 0, 0);
  let t = Math.floor(startDate.getTime() / 1000);
  if (t < windowStart) t += 1800;

  while (t <= windowEnd) {
    const offset = ((t - windowStart) / 60) * pxPerMinute;
    const isHour = new Date(t * 1000).getMinutes() === 0;
    marks.push(
      <div
        key={t}
        className="absolute top-0 bottom-0"
        style={{ left: `${offset}px` }}
      >
        <div className={`h-full ${isHour ? 'border-l border-gray-700' : 'border-l border-gray-800'}`} />
        <span className={`absolute top-0 text-xs -translate-x-1/2 ${isHour ? 'text-gray-300' : 'text-gray-500'}`}>
          {formatHour(t)}
        </span>
      </div>
    );
    t += 1800;
  }

  return (
    <div className="relative h-6 bg-gray-900 border-b border-gray-700 w-full">
      {marks}
    </div>
  );
}

function NowMarker({ windowStart, pxPerMinute }) {
  const now = Math.floor(Date.now() / 1000);
  if (now < windowStart || now > windowStart + WINDOW_SECONDS) return null;
  const offset = ((now - windowStart) / 60) * pxPerMinute;
  return (
    <div
      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
      style={{ left: `${offset}px` }}
    />
  );
}

export default function TimeSlotGrid({ epgData, channelsData, ratingsMap, onProgramClick, currentEpoch }) {
  const containerRef = useRef(null);
  const [pxPerMinute, setPxPerMinute] = useState(0);

  const measure = useCallback(() => {
    if (containerRef.current) {
      const available = containerRef.current.clientWidth - CHANNEL_COL_WIDTH;
      setPxPerMinute(available / (WINDOW_SECONDS / 60));
    }
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const windowStart = useMemo(() => {
    const d = new Date(currentEpoch * 1000);
    d.setMinutes(0, 0, 0);
    return Math.floor(d.getTime() / 1000);
  }, [currentEpoch]);

  const windowEnd = windowStart + WINDOW_SECONDS;

  if (pxPerMinute <= 0) {
    return <div ref={containerRef} className="w-full h-20" />;
  }

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex sticky top-[52px] z-10 bg-gray-900">
        <div className="flex-shrink-0 bg-gray-900 border-r border-gray-800" style={{ width: `${CHANNEL_COL_WIDTH}px` }} />
        <div className="relative flex-1">
          <TimeRuler windowStart={windowStart} windowEnd={windowEnd} pxPerMinute={pxPerMinute} />
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-0 bottom-0" style={{ left: `${CHANNEL_COL_WIDTH}px`, right: 0 }}>
          <NowMarker windowStart={windowStart} pxPerMinute={pxPerMinute} />
        </div>

        {TNT_CHANNELS.map((channel) => {
          const programs = epgData[channel.uuid] || {};
          const programList = Object.values(programs);
          const channelInfo = channelsData?.[channel.uuid];

          return (
            <ChannelRow
              key={channel.uuid}
              channel={channel}
              channelInfo={channelInfo}
              programs={programList}
              windowStart={windowStart}
              windowEnd={windowEnd}
              pxPerMinute={pxPerMinute}
              channelColWidth={CHANNEL_COL_WIDTH}
              ratingsMap={ratingsMap}
              onProgramClick={onProgramClick}
            />
          );
        })}
      </div>
    </div>
  );
}
