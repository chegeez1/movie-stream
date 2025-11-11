import React, { useState } from 'react'
import { Info, Users, Download, Film } from 'lucide-react'
import '../../styles/components/movie-tabs.css'

const MovieTabs = ({ 
  tabs = [],
  defaultTab = 'info'
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab)

  const defaultTabs = [
    {
      id: 'info',
      label: 'Information',
      icon: Info,
      content: tabs.find(t => t.id === 'info')?.content
    },
    {
      id: 'cast',
      label: 'Cast & Crew',
      icon: Users,
      content: tabs.find(t => t.id === 'cast')?.content
    },
    {
      id: 'download',
      label: 'Download',
      icon: Download,
      content: tabs.find(t => t.id === 'download')?.content
    },
    {
      id: 'similar',
      label: 'Similar Movies',
      icon: Film,
      content: tabs.find(t => t.id === 'similar')?.content
    }
  ].filter(tab => tab.content)

  if (defaultTabs.length === 0) return null

  return (
    <div className="movie-tabs">
      {/* Tab Headers */}
      <div className="tabs-header">
        {defaultTabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tabs-content">
        {defaultTabs.map(tab => (
          <div
            key={tab.id}
            className={`tab-panel ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MovieTabs
