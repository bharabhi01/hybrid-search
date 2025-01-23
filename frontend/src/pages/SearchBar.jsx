import React, { useState } from 'react';
import { search } from '../api';
import './SearchBar.css';  // We'll create this file next

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setIsLoading(true);
        try {
            const response = await search(searchTerm);
            setSearchResults(response.data.results);
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="search-wrapper">
            <form onSubmit={handleSubmit} className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Type to search..."
                    value={searchTerm}
                    onChange={handleChange}
                />
                <button
                    type="submit"
                    className="search-button"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="loading-spinner"></span>
                    ) : (
                        <span >Search</span>
                    )}
                </button>
            </form>

            {searchResults.length > 0 && (
                <div className="search-results">
                    {searchResults.map((result, index) => (
                        <div
                            key={index}
                            className="search-result-item"
                        >
                            {result.text}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchBar;