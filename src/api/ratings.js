import { cacheGet, cacheSet } from './cache';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;

async function searchTmdb(title, year) {
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    query: title,
    language: 'fr-FR',
  });
  if (year) params.set('year', year);

  const res = await fetch(`https://api.themoviedb.org/3/search/movie?${params}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.results || data.results.length === 0) return null;

  const movie = data.results[0];
  return {
    tmdbRating: movie.vote_average,
    tmdbVotes: movie.vote_count,
    tmdbId: movie.id,
    tmdbPoster: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null,
    tmdbBackdrop: movie.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
      : null,
    tmdbYear: movie.release_date ? parseInt(movie.release_date.substring(0, 4), 10) || null : null,
  };
}

async function searchOmdb(title, year) {
  const params = new URLSearchParams({
    apikey: OMDB_API_KEY,
    t: title,
    type: 'movie',
  });
  if (year) params.set('y', year);

  const res = await fetch(`https://www.omdbapi.com/?${params}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.Response === 'False') return null;

  return {
    imdbRating: data.imdbRating !== 'N/A' ? data.imdbRating : null,
    imdbVotes: data.imdbVotes !== 'N/A' ? data.imdbVotes : null,
    rottenTomatoes: data.Ratings?.find((r) => r.Source === 'Rotten Tomatoes')?.Value || null,
    metascore: data.Metascore !== 'N/A' ? data.Metascore : null,
    awards: data.Awards !== 'N/A' ? data.Awards : null,
    imdbId: data.imdbID || null,
    omdbDirector: data.Director !== 'N/A' ? data.Director : null,
    omdbActors: data.Actors !== 'N/A' ? data.Actors : null,
    omdbYear: data.Year !== 'N/A' ? data.Year : null,
  };
}

const FILM_CATEGORIES = ['film', 'téléfilm', 'long métrage', 'court métrage'];

export function isFilmProgram(program) {
  const cat = (program.category_name || '').toLowerCase();
  return FILM_CATEGORIES.some((f) => cat.includes(f));
}

export function averageRating(ratings) {
  if (!ratings) return null;
  const values = [];
  if (ratings.tmdbRating) values.push(ratings.tmdbRating);
  if (ratings.imdbRating) values.push(parseFloat(ratings.imdbRating));
  if (ratings.rottenTomatoes) {
    const pct = parseFloat(ratings.rottenTomatoes);
    if (!isNaN(pct)) values.push(pct / 10);
  }
  if (ratings.metascore) {
    const ms = parseFloat(ratings.metascore);
    if (!isNaN(ms)) values.push(ms / 10);
  }
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export async function getMovieRatings(title, year) {
  const key = `ratings:${title}:${year || ''}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const [tmdb, omdb] = await Promise.allSettled([
    searchTmdb(title, year),
    searchOmdb(title, year),
  ]);

  const tmdbData = tmdb.status === 'fulfilled' && tmdb.value ? tmdb.value : {};
  const omdbData = omdb.status === 'fulfilled' && omdb.value ? omdb.value : {};
  const result = { ...tmdbData, ...omdbData };

  const bothResolved = tmdb.status === 'fulfilled' && omdb.status === 'fulfilled';
  if ((result.tmdbRating || result.imdbRating) && bothResolved) {
    cacheSet(key, result, Date.now() / 1000);
  }

  return result;
}
