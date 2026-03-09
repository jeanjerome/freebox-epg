import { useState, useEffect } from 'react';
import { getProgramDetails, imageUrl } from '../api/freebox';
import { getMovieRatings, isFilmProgram } from '../api/ratings';

function formatTime(epoch) {
  return new Date(epoch * 1000).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}`;
  return `${m} min`;
}


function RatingBadge({ icon, value, label, color }) {
  if (!value) return null;
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${color}`}>
      <span className="text-base">{icon}</span>
      <div>
        <p className="text-white text-sm font-bold leading-none">{value}</p>
        <p className="text-gray-400 text-[10px] leading-none mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function ProgramDetail({ program, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState(null);

  useEffect(() => {
    if (!program) return;
    setLoading(true);
    setError(null);
    setRatings(null);
    getProgramDetails(program.id)
      .then((res) => {
        setDetails(res);
        if (isFilmProgram(res)) {
          getMovieRatings(res.title)
            .then(setRatings)
            .catch(() => {});
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [program]);

  if (!program) return null;

  const data = details || program;
  const poster = ratings?.tmdbPoster || null;
  const backdrop = ratings?.tmdbBackdrop || null;
  const freeboxImage = imageUrl(data.picture_big || data.picture);
  const topImage = backdrop || (!poster ? freeboxImage : null);
  const displayYear = ratings?.tmdbYear || ratings?.omdbYear || null;
  const hasFreeboxCast = Array.isArray(data.cast) && data.cast.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-gray-900 rounded-xl w-full max-h-[90vh] shadow-2xl ${poster ? 'max-w-5xl flex overflow-hidden' : 'max-w-2xl overflow-y-auto'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {poster && (
          <div className="flex-shrink-0 bg-black/40 rounded-l-xl overflow-hidden relative">
            <img
              src={poster}
              alt={data.title}
              className="h-full w-auto object-contain"
            />
            <img
              src="/tmdb-logo.svg"
              alt="TMDb"
              className="absolute bottom-2 right-2 w-14 drop-shadow-lg"
            />
          </div>
        )}

        <div className={poster ? 'flex-1 min-w-0 overflow-y-auto' : ''}>
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className={!poster && topImage ? 'flex items-start gap-4' : ''}>
                {!poster && topImage && (
                  <div className="relative flex-shrink-0">
                    <img
                      src={topImage}
                      alt={data.title}
                      className="w-28 object-contain rounded"
                    />
                    {backdrop && (
                      <img
                        src="/tmdb-logo.svg"
                        alt="TMDb"
                        className="absolute bottom-1 right-1 w-10 drop-shadow-lg"
                      />
                    )}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white">{data.title}</h2>
                  {data.sub_title && (
                    <p className="text-gray-400 mt-1">{data.sub_title}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                      {formatTime(data.date)} - {formatTime(data.date + data.duration)}
                    </span>
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                      {formatDuration(data.duration)}
                    </span>
                    {(data.category_name || data.category) && (
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                        {data.category_name || data.category}
                      </span>
                    )}
                    {displayYear && (
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                        {displayYear}
                      </span>
                    )}
                    {data.parental_rating != null && data.parental_rating > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        data.parental_rating >= 16 ? 'bg-red-700 text-white' :
                        data.parental_rating >= 12 ? 'bg-orange-600 text-white' :
                        data.parental_rating >= 10 ? 'bg-yellow-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        -{data.parental_rating}
                      </span>
                    )}
                    {(data.season_number || data.episode_number) && (
                      <span className="text-xs bg-purple-800 text-purple-200 px-2 py-0.5 rounded">
                        {data.season_number ? `S${String(data.season_number).padStart(2, '0')}` : ''}
                        {data.episode_number ? `E${String(data.episode_number).padStart(2, '0')}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl leading-none flex-shrink-0 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {ratings && (
              <div className="flex flex-wrap gap-3 mt-4">
                <RatingBadge
                  icon="⭐"
                  value={ratings.tmdbRating ? `${parseFloat(ratings.tmdbRating).toFixed(1)}/10` : null}
                  label={ratings.tmdbVotes ? `TMDb (${ratings.tmdbVotes.toLocaleString('fr-FR')} votes)` : 'TMDb'}
                  color="bg-yellow-900/40"
                />
                <RatingBadge
                  icon="🎬"
                  value={ratings.imdbRating ? `${ratings.imdbRating}/10` : null}
                  label={ratings.imdbVotes ? `IMDb (${ratings.imdbVotes} votes)` : 'IMDb'}
                  color="bg-amber-900/40"
                />
                {ratings.rottenTomatoes && (
                  <RatingBadge
                    icon="🍅"
                    value={ratings.rottenTomatoes}
                    label="Rotten Tomatoes"
                    color="bg-red-900/40"
                  />
                )}
                <RatingBadge
                  icon="🏆"
                  value={ratings.metascore ? `${ratings.metascore}/100` : null}
                  label="Metascore"
                  color="bg-blue-900/40"
                />
                {ratings.imdbId && (
                  <a
                    href={`https://www.imdb.com/title/${ratings.imdbId}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold transition-colors"
                  >
                    IMDb ↗
                  </a>
                )}
              </div>
            )}

            {loading && (
              <p className="text-gray-400 mt-4">Chargement des détails...</p>
            )}
            {error && (
              <p className="text-red-400 mt-4">Erreur : {error}</p>
            )}

            {data.desc && (
              <p className="text-gray-300 mt-4 leading-relaxed">{data.desc}</p>
            )}

            {ratings?.awards && (
              <p className="mt-3 text-sm text-yellow-500/90 italic">🏅 {ratings.awards}</p>
            )}

            {hasFreeboxCast ? (
              <div className="mt-4">
                <h3 className="text-white font-semibold mb-2">Casting</h3>
                <div className="space-y-1">
                  {Object.entries(
                    data.cast.reduce((acc, person) => {
                      const job = person.job || 'Autre';
                      if (!acc[job]) acc[job] = [];
                      acc[job].push(`${person.first_name} ${person.last_name}`);
                      return acc;
                    }, {})
                  ).map(([job, names]) => (
                    <div key={job} className="text-sm">
                      <span className="text-gray-400">{job} : </span>
                      <span className="text-gray-300">{names.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (ratings?.omdbDirector || ratings?.omdbActors) && (
              <div className="mt-4">
                <h3 className="text-white font-semibold mb-2">Casting</h3>
                <div className="space-y-1">
                  {ratings.omdbDirector && (
                    <div className="text-sm">
                      <span className="text-gray-400">Réalisateur : </span>
                      <span className="text-gray-300">{ratings.omdbDirector}</span>
                    </div>
                  )}
                  {ratings.omdbActors && (
                    <div className="text-sm">
                      <span className="text-gray-400">Acteurs : </span>
                      <span className="text-gray-300">{ratings.omdbActors}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
