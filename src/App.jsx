import { useState, useEffect, useCallback } from 'react';
import { getChannels, getEpgByTime } from './api/freebox';
import { getMovieRatings, isFilmProgram } from './api/ratings';
import { cleanExpiredCache } from './api/cache';
import TimeSlotNav from './components/TimeSlotNav';
import TimeSlotGrid from './components/TimeSlotGrid';
import ProgramDetail from './components/ProgramDetail';

export default function App() {
  const [currentEpoch, setCurrentEpoch] = useState(
    Math.floor(Date.now() / 1000)
  );
  const [epgData, setEpgData] = useState({});
  const [channelsData, setChannelsData] = useState({});
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [ratingsMap, setRatingsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getChannels()
      .then(setChannelsData)
      .catch((err) => console.warn('Could not load channels:', err.message));
  }, []);

  useEffect(() => {
    cleanExpiredCache();
    setLoading(true);
    setError(null);

    const windowStart = new Date(currentEpoch * 1000);
    windowStart.setMinutes(0, 0, 0);
    const start = Math.floor(windowStart.getTime() / 1000);

    const fetches = [];
    for (let i = 0; i < 3; i++) {
      fetches.push(getEpgByTime(start + i * 3600));
    }

    Promise.all(fetches)
      .then((results) => {
        const merged = {};
        for (const result of results) {
          for (const [channelId, programs] of Object.entries(result)) {
            if (!merged[channelId]) merged[channelId] = {};
            Object.assign(merged[channelId], programs);
          }
        }
        setEpgData(merged);

        const films = [];
        for (const programs of Object.values(merged)) {
          for (const prog of Object.values(programs)) {
            if (isFilmProgram(prog)) {
              films.push(prog);
            }
          }
        }

        const uniqueFilms = [...new Map(films.map((f) => [f.title, f])).values()];

        for (const film of uniqueFilms) {
          getMovieRatings(film.title)
            .then((r) => {
              if (r.tmdbRating || r.imdbRating) {
                setRatingsMap((prev) => ({ ...prev, [film.title]: r }));
              }
            })
            .catch(() => {});
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [currentEpoch]);

  const handleProgramClick = useCallback((program) => {
    setSelectedProgram(program);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedProgram(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 px-4 py-3 border-b border-gray-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
          <span className="text-blue-500">Guide TV</span>
        </h1>
      </header>

      <TimeSlotNav currentEpoch={currentEpoch} onSelectEpoch={setCurrentEpoch} />

      <main>
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            <span className="ml-3 text-gray-400">Chargement des programmes...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 text-lg">Erreur de chargement</p>
            <p className="text-gray-500 mt-2">{error}</p>
            <p className="text-gray-600 mt-4 text-sm">
              Vérifiez que vous êtes connecté au réseau Freebox.
            </p>
            <button
              onClick={() => setCurrentEpoch(Math.floor(Date.now() / 1000))}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white cursor-pointer"
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && (
          <TimeSlotGrid
            epgData={epgData}
            channelsData={channelsData}
            ratingsMap={ratingsMap}
            onProgramClick={handleProgramClick}
            currentEpoch={currentEpoch}
          />
        )}
      </main>

      {selectedProgram && (
        <ProgramDetail program={selectedProgram} onClose={handleCloseDetail} />
      )}
    </div>
  );
}
