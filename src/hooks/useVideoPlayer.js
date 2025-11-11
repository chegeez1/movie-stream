import { useState, useRef, useCallback } from 'react'

export const useVideoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const videoRef = useRef(null)

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return

    const currentTime = videoRef.current.currentTime
    const duration = videoRef.current.duration
    setProgress((currentTime / duration) * 100)
  }, [])

  const handleSeek = useCallback((newProgress) => {
    if (!videoRef.current) return

    const duration = videoRef.current.duration
    videoRef.current.currentTime = (newProgress / 100) * duration
    setProgress(newProgress)
  }, [])

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return

    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }, [isMuted])

  const changeVolume = useCallback((newVolume) => {
    if (!videoRef.current) return

    videoRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }, [])

  const changePlaybackRate = useCallback((rate) => {
    if (!videoRef.current) return

    videoRef.current.playbackRate = rate
    setPlaybackRate(rate)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return

    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }, [])

  return {
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
  }
}
