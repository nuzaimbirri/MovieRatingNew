import { useQuery } from "@tanstack/react-query";
import MovieCard from "../../components/MovieCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PropTypes from "prop-types";
import "./Watchlist.css";

const Watchlist = ({ userId }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["watchlist", userId],
    queryFn: async () => {
      const res = await fetch("/api/watchlist", { credentials: "include" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch watchlist");
      }
      const data = await res.json();
      return data.watchlist;
    },
    enabled: !!userId,
  });

  if (isLoading) return <LoadingSpinner size="md" />;
  if (error) return <div className="text-red-500">{error.message}</div>;
  if (!data || data.length === 0)
    return <div className="empty-watchlist">Belum ada film di watchlist</div>;

  return (
    <section className="watchlist-section">
      <h2 className="watchlist-title">My Watchlist</h2>
      <div className="watchlist-grid">
        {data.map((movie) => (
          <MovieCard key={movie._id} movie={movie} isWatchlistView={true} />
        ))}
      </div>
    </section>
  );
};

Watchlist.propTypes = { userId: PropTypes.string };
export default Watchlist;