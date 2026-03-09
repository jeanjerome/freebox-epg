import { imageUrl } from '../api/freebox';
import ProgramCard from './ProgramCard';

export default function ChannelRow({ channel, channelInfo, programs, windowStart, windowEnd, pxPerMinute, channelColWidth, ratingsMap, onProgramClick }) {
  const now = Math.floor(Date.now() / 1000);
  const logoSrc = channelInfo?.logo_url ? imageUrl(channelInfo.logo_url) : null;

  const visible = programs
    .filter((p) => {
      const pEnd = p.date + p.duration;
      return pEnd > windowStart && p.date < windowEnd;
    })
    .sort((a, b) => a.date - b.date);

  return (
    <div className="flex border-b border-gray-800">
      <div
        className="flex-shrink-0 p-2 flex flex-col items-center justify-center bg-gray-900 border-r border-gray-800"
        style={{ width: `${channelColWidth}px` }}
      >
        {logoSrc ? (
          <img
            src={logoSrc}
            alt={channel.name}
            className="h-10 w-auto object-contain mb-1"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold mb-1">
            {channel.number}
          </div>
        )}
        <span className="text-gray-400 text-xs text-center">{channel.name}</span>
      </div>

      <div className="relative flex-1" style={{ height: '100px' }}>
        {visible.length > 0 ? (
          visible.map((prog) => {
            const clippedStart = Math.max(prog.date, windowStart);
            const clippedEnd = Math.min(prog.date + prog.duration, windowEnd);
            const left = ((clippedStart - windowStart) / 60) * pxPerMinute;
            const width = ((clippedEnd - clippedStart) / 60) * pxPerMinute;
            const isLive = now >= prog.date && now < prog.date + prog.duration;

            return (
              <ProgramCard
                key={prog.id}
                program={prog}
                isLive={isLive}
                ratings={ratingsMap?.[prog.title]}
                onClick={onProgramClick}
                widthPx={width}
                style={{ position: 'absolute', left: `${left}px`, width: `${width}px`, top: 0, bottom: 0 }}
              />
            );
          })
        ) : (
          <div className="flex items-center text-gray-500 text-sm px-4 h-full">
            Aucun programme
          </div>
        )}
      </div>
    </div>
  );
}
