import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { useMovieInfo } from '../hooks/useMovies'
import MovieHero from '../components/detail/MovieHero'
import MovieInfo from '../components/detail/MovieInfo'
import CastList from '../components/detail/CastList'
import DownloadSection from '../components/detail/DownloadSection'
import SimilarMovies from '../components/detail/SimilarMovies'
import MovieTabs from '../components/detail/MovieTabs'
import TrailerPlayer from '../components/detail/TrailerPlayer'
import DownloadModal from '../components/download/DownloadModal'
import LoadingSpinner from '../components/common/LoadingSpinner'
import PageContainer from '../components/layout/PageContainer'
import '../styles/pages/movie-detail.css'

const MovieDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { movie, loading, error } = useMovieInfo(id)
  
  const [activeTab, setActiveTab] = useState('info')
  const [showTrailer, setShowTrailer] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  const handleBack = () => {
    navigate(-1)
  }

  const handlePlayTrailer = () => {
    if (movie?.subject?.trailer) {
      setShowTrailer(true)
    }
  }

  const handleDownload = () => {
    setShowDownloadModal(true)
  }

  if (loading) {
    return (
      <div className="movie-detail-page">
        <PageContainer>
          <LoadingSpinner text="Loading movie details..." centered />
        </PageContainer>
      </div>
    )
  }

  if (error) {
    return (
      <div className="movie-detail-page">
        <PageContainer>
          <div className="error-state">
            <AlertCircle size={64} className="error-icon" />
            <h2>Movie Not Found</h2>
            <p>{error}</p>
            <button onClick={handleBack} className="btn btn-primary">
              <ArrowLeft size={16} />
              Go Back
            </button>
          </div>
        </PageContainer>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="movie-detail-page">
        <PageContainer>
          <div className="error-state">
            <h2>Movie Not Found</h2>
            <p>The movie you're looking for doesn't exist.</p>
            <button onClick={handleBack} className="btn btn-primary">
              <ArrowLeft size={16} />
              Go Back
            </button>
          </div>
        </PageContainer>
      </div>
    )
  }

  const { subject, stars = [] } = movie

  const tabContent = {
    info: <MovieInfo movie={movie} />,
    cast: <CastList cast={stars} />,
    download: (
      <DownloadSection
        movieId={id}
        movieTitle={subject.title}
        sources={movie.resource ? [] : []} // This would come from the API
        loading={false}
      />
    ),
    similar: (
      <SimilarMovies
        movies={[]} // This would be similar movies from API
        currentMovieId={id}
        title="Similar Movies"
      />
    )
  }

  return (
    <div className="movie-detail-page">
      {/* Back Button */}
      <div className="movie-detail-header">
        <PageContainer>
          <button onClick={handleBack} className="back-button">
            <ArrowLeft size={20} />
            Back
          </button>
        </PageContainer>
      </div>

      {/* Movie Hero Section */}
      <MovieHero
        movie={movie}
        onPlayTrailer={handlePlayTrailer}
        onDownload={handleDownload}
      />

      <PageContainer>
        {/* Tabbed Content */}
        <div className="movie-detail-content">
          <MovieTabs
            tabs={Object.entries(tabContent).map(([tabId, content]) => ({
              id: tabId,
              content
            }))}
            defaultTab={activeTab}
          />
        </div>
      </PageContainer>

      {/* Modals */}
      <TrailerPlayer
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        videoUrl={movie.subject.trailer?.videoAddress?.url}
        title={`${subject.title} - Trailer`}
      />

      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        movieId={id}
        movieTitle={subject.title}
        sources={[]} // This would come from API
      />
    </div>
  )
}

export default MovieDetail
