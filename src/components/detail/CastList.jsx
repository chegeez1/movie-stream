import React from 'react'
import { User } from 'lucide-react'
import '../../styles/components/cast-list.css'

const CastList = ({ cast = [] }) => {
  if (!cast || cast.length === 0) {
    return (
      <div className="cast-list">
        <h2 className="section-title">Cast</h2>
        <div className="no-cast">
          <User size={48} className="no-cast-icon" />
          <p>No cast information available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="cast-list">
      <h2 className="section-title">Cast & Crew</h2>
      
      <div className="cast-grid">
        {cast.map(person => (
          <div key={person.staffId} className="cast-member">
            <div className="cast-avatar">
              <img 
                src={person.avatarUrl} 
                alt={person.name}
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="avatar-fallback">
                <User size={24} />
              </div>
            </div>
            
            <div className="cast-info">
              <h4 className="cast-name">{person.name}</h4>
              {person.character && (
                <p className="cast-character">{person.character}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CastList
