import React from 'react'
import { X, Play, Volume2, VolumeX, Maximize } from 'lucide-react'
import { useVideoPlayer } from '../../hooks/useVideoPlayer'
import Modal from '../common/Modal'
import '../../styles/components/trailer-player.css'

const TrailerPlayer = ({ 
  isOpen, 
  onClose, 
  videoUrl,
  title = "Movie Trailer"
}) => {
  const {
    videoRef,
    isPlaying,
    progress,
    volume,
    isMuted,
    playbackRate,
    togglePlay,
    handleTimeUpdate,
    handleSeek,
    toggleMute,
    changeVolume,
    changePlaybackRate,
    toggleFullscreen
  } = useVideoPlayer()

  if (!isOpen || !videoUrl) return null

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="large"
      closeOnOverlayClick={true}
    >
      <div className="trailer-player">
        <div className="player-header">
          <h3>{title}</h3>
          <button 
            className="close-player"
            onClick={onClose}
            aria-label="Close trailer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="video-container">
          <video
            ref={videoRef}
            src={videoUrl}
            className="trailer-video"
            onTimeUpdate={handleTimeUpdate}
            onClick={togglePlay}
          />
          
          {/* Custom Controls */}
          <div className="video-controls">
            {/* Progress Bar */}
            <div className="progress-bar-container">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="progress-bar"
                aria-label="Video progress"
              />
            </div>

            {/* Control Buttons */}
            <div className="control-buttons">
              <div className="left-controls">
                <button 
                  className="control-btn"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  <Play 
                    size={20} 
                    fill="currentColor" 
                    style={{ 
                      transform: isPlaying ? 'none' : 'translateX(1px)' 
                    }} 
                  />
                </button>

                <button 
                  className="control-btn"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => changeVolume(parseFloat(e.target.value))}
                  className="volume-slider"
                  aria-label="Volume"
                />

                <span className="time-display">
                  {videoRef.current ? 
                    `${Math.floor(videoRef.current.currentTime / 60)}:${Math.floor(videoRef.current.currentTime % 60).toString().padStart(2, '0')} / 
                     ${Math.floor(videoRef.current.duration / 60)}:${Math.floor(videoRef.current.duration % 60).toString().padStart(2, '0')}`
                    : '0:00 / 0:00'
                  }
                </span>
              </div>

              <div className="right-controls">
                <select
                  value={playbackRate}
                  onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                  className="playback-rate"
                  aria-label="Playback speed"
                >
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">Normal</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>

                <button 
                  className="control-btn"
                  onClick={toggleFullscreen}
                  aria-label="Fullscreen"
                >
                  <Maximize size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default TrailerPlayer
