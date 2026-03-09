import { imageUrl } from '../api/freebox';
import { averageRating } from '../api/ratings';

function formatTime(epoch) {
  return new Date(epoch * 1000).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ProgressBar({ start, duration }) {
  const now = Date.now() / 1000;
  const end = start + duration;
  if (now < start) return null;
  if (now > end) return null;
  const pct = Math.min(100, ((now - start) / duration) * 100);
  return (
    <div className="w-12 h-1 bg-gray-600 rounded-full inline-block align-middle mx-1">
      <div className="h-full bg-gray-300 rounded-full" style={{ width: `${pct}%` }} />
    </div>
  );
}

function ratingColor(rating10) {
  if (rating10 >= 7) return { bg: 'bg-green-900/60', border: 'border-green-700/50', text: 'text-green-400' };
  if (rating10 >= 5) return { bg: 'bg-yellow-900/60', border: 'border-yellow-700/50', text: 'text-yellow-400' };
  return { bg: 'bg-red-900/60', border: 'border-red-700/50', text: 'text-red-400' };
}

const STAR_PATH = 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z';

function Stars({ rating10 }) {
  const rating5 = rating10 / 2;
  const full = Math.floor(rating5);
  const partial = rating5 - full;
  const empty = 5 - full - (partial > 0 ? 1 : 0);
  const colors = ratingColor(rating10);

  return (
    <div className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded border ${colors.bg} ${colors.border}`} title={`${rating10.toFixed(1)}/10`}>
      <div className="flex items-center gap-px">
        {Array.from({ length: full }, (_, i) => (
          <svg key={`f${i}`} className="w-2.5 h-2.5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path d={STAR_PATH} />
          </svg>
        ))}
        {partial > 0 && (
          <svg key="p" className="w-2.5 h-2.5" viewBox="0 0 20 20">
            <defs>
              <linearGradient id={`sg-${Math.round(partial * 100)}`}>
                <stop offset={`${partial * 100}%`} stopColor="#facc15" />
                <stop offset={`${partial * 100}%`} stopColor="#4b5563" />
              </linearGradient>
            </defs>
            <path fill={`url(#sg-${Math.round(partial * 100)})`} d={STAR_PATH} />
          </svg>
        )}
        {Array.from({ length: empty }, (_, i) => (
          <svg key={`e${i}`} className="w-2.5 h-2.5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path d={STAR_PATH} />
          </svg>
        ))}
      </div>
      <span className={`text-[10px] font-bold ${colors.text} leading-none`}>{rating10.toFixed(1)}</span>
    </div>
  );
}

export default function ProgramCard({ program, isLive, ratings, onClick, style, widthPx }) {
  const startTime = formatTime(program.date);
  const endTime = formatTime(program.date + program.duration);
  const thumbnail = imageUrl(program.picture);
  const showImage = thumbnail && widthPx > 120;
  const avg = averageRating(ratings);

  return (
    <button
      onClick={() => onClick(program)}
      style={style}
      className={`rounded-lg overflow-hidden text-left cursor-pointer transition-colors flex border-r border-gray-700 ${
        isLive
          ? 'ring-2 ring-blue-500 bg-gray-800/80 z-[1]'
          : 'bg-gray-800/50 hover:bg-gray-700/50'
      }`}
    >
      <div className="p-2 overflow-hidden flex-1 min-w-0 flex flex-col justify-center">
        {program.category_name && (
          <p className="text-gray-400 text-xs truncate">
            {program.category_name}
            {ratings?.tmdbYear || ratings?.omdbYear ? ` · ${ratings.tmdbYear || ratings.omdbYear}` : ''}
          </p>
        )}
        <p className="text-white text-sm font-bold truncate">{program.title}</p>
        <div className="text-xs text-gray-400 flex items-center mt-0.5">
          <span>{startTime}</span>
          {isLive ? (
            <ProgressBar start={program.date} duration={program.duration} />
          ) : (
            <span className="mx-1">-</span>
          )}
          <span>{endTime}</span>
        </div>
        {avg !== null && <Stars rating10={avg} />}
        {program.sub_title && !avg && (
          <p className="text-gray-500 text-xs truncate mt-0.5">{program.sub_title}</p>
        )}
      </div>
      {showImage && (
        <div className="flex-shrink-0 flex items-center justify-center p-1">
          <img
            src={thumbnail}
            alt={program.title}
            className="max-h-full max-w-full object-contain rounded"
            style={{ maxWidth: `${Math.min(widthPx * 0.4, 130)}px` }}
            loading="lazy"
          />
        </div>
      )}
    </button>
  );
}
