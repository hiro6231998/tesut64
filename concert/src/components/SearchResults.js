import React from 'react';
import './SearchResults.css';

const SearchResults = ({ searchTerm, results, onSelectConcert }) => {
  return (
    <div className="search-results-container">
      <h2>「{searchTerm}」の検索結果</h2>
      
      {results.length === 0 ? (
        <div className="no-results">
          <p>お探しの条件に一致するコンサートが見つかりませんでした。</p>
          <p>別のキーワードで検索するか、日付範囲を広げてお試しください。</p>
        </div>
      ) : (
        <div className="search-results">
          <p className="results-count">{results.length}件のコンサートが見つかりました</p>
          
          <div className="concert-results">
            {results.map(concert => (
              <div 
                key={concert.id} 
                className="concert-result-card"
                onClick={() => onSelectConcert(concert)}
              >
                <div className="concert-image">
                  {concert.image ? (
                    <img src={concert.image} alt={concert.title} />
                  ) : (
                    <div className="placeholder-image"></div>
                  )}
                </div>
                <div className="concert-info">
                  <h3>{concert.title}</h3>
                  <p className="concert-date">{concert.date} {concert.time}</p>
                  <p className="concert-venue">{concert.venue}</p>
                  <p className="price-range">¥{concert.minPrice.toLocaleString()} 〜 ¥{concert.maxPrice.toLocaleString()}</p>
                  {concert.availableSeats > 0 ? (
                    <div className="availability available">チケット残りわずか</div>
                  ) : (
                    <div className="availability sold-out">完売</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults; 