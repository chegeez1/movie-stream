import React from 'react'
import { Download, Clock, CheckCircle, Trash2 } from 'lucide-react'
import DownloadQueue from '../components/download/DownloadQueue'
import PageContainer from '../components/layout/PageContainer'
import Section from '../components/layout/Section'
import '../styles/pages/downloads.css'

const Downloads = () => {
  return (
    <div className="downloads-page">
      <PageContainer>
        {/* Header */}
        <Section padding="medium">
          <div className="downloads-header">
            <div className="header-content">
              <div className="header-icon">
                <Download size={40} />
              </div>
              <div className="header-text">
                <h1>Download Manager</h1>
                <p>Manage your movie downloads and track progress</p>
              </div>
            </div>

            <div className="downloads-stats">
              <div className="stat">
                <Download className="stat-icon" />
                <div>
                  <span className="stat-number">0</span>
                  <span className="stat-label">Active</span>
                </div>
              </div>
              <div className="stat">
                <Clock className="stat-icon" />
                <div>
                  <span className="stat-number">0</span>
                  <span className="stat-label">Queued</span>
                </div>
              </div>
              <div className="stat">
                <CheckCircle className="stat-icon" />
                <div>
                  <span className="stat-number">0</span>
                  <span className="stat-label">Completed</span>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Download Queue */}
        <Section padding="none">
          <DownloadQueue />
        </Section>

        {/* Quick Tips */}
        <Section padding="medium">
          <div className="downloads-tips">
            <h3>Download Tips</h3>
            <div className="tips-grid">
              <div className="tip-card">
                <Download size={24} />
                <h4>Choose Quality Wisely</h4>
                <p>Higher quality means larger file sizes. Choose based on your storage and needs.</p>
              </div>
              <div className="tip-card">
                <Clock size={24} />
                <h4>Download Queue</h4>
                <p>Multiple downloads are processed one at a time to ensure stability.</p>
              </div>
              <div className="tip-card">
                <CheckCircle size={24} />
                <h4>Completed Downloads</h4>
                <p>Access your downloaded movies from the completed section.</p>
              </div>
            </div>
          </div>
        </Section>
      </PageContainer>
    </div>
  )
}

export default Downloads
