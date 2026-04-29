import { useEffect } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import DisplayGames from "../components/DisplayGames";
import SearchForm from "../components/SearchForm";
import useSearch from "../hooks/useSearch";

export default function SearchResults() {
    const {
        isGameInLibrary,
        getLibraryGameIdForGame,
        registerLibraryGame,
        unregisterLibraryGame,
    } = useOutletContext();
    const [searchParams] = useSearchParams();
    const { results, search, searchLoading, searchError, searchCount } = useSearch();
    
    // Extract query parameters from URL
    const searchTerm = searchParams.get("search") || "";
    const genre = searchParams.get("genre") || "";
    const platform = searchParams.get("platform") || "";
    
    // Trigger search when URL parameters change
    useEffect(() => {
        // Only search if at least one parameter is provided
        if (searchTerm || genre || platform) {
            search(searchTerm, genre, platform);
        }
    }, [searchParams]);
    
    return (
        <div className="search-results-page pt-2 pb-8">
            <h1 className="text-4xl font-bold pb-4 text-white text-center">Search Games</h1>
            <SearchForm />
            
            <div className="mt-8">
                <DisplayGames 
                    games={results}
                    count={searchCount}
                    isLoading={searchLoading}
                    errorMessage={searchError?.message}
                    isGameInLibrary={isGameInLibrary}
                    getLibraryGameIdForGame={getLibraryGameIdForGame}
                    registerLibraryGame={registerLibraryGame}
                    unregisterLibraryGame={unregisterLibraryGame}
                />
            </div>
        </div>
    );
}