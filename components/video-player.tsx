"use client"

import { useRef, useState, useEffect } from "react"
import { PlayIcon, PauseIcon, SpeakerHighIcon, SpeakerXIcon, ArrowsOutIcon, UsersIcon, GearSixIcon, CheckIcon, SidebarSimpleIcon, FlaskIcon } from "@phosphor-icons/react"
import type { DonationEvent } from "@/lib/festival-data"
import { DonationAlert } from "@/components/donation-alert"
import { FloatingGifts, type FloatingGift } from "@/components/floating-gifts"

type VideoPlayerProps = {
  viewers: number
  alert: DonationEvent | null
  alertPinned?: boolean
  floatingGifts: FloatingGift[]
  chatVisible: boolean
  onToggleChat: () => void
  testPanelVisible?: boolean
  onToggleTestPanel?: () => void
}

// Bundled sample video used as a stand-in for the live stream feed.
const STREAM_SRC = "/sample-stream.mp4"

const QUALITY_OPTIONS = [
  { id: "auto", label: "Αυτόματη" },
  { id: "1080p", label: "1080p" },
  { id: "720p", label: "720p" },
  { id: "480p", label: "480p" },
  { id: "360p", label: "360p" },
] as const

type Quality = (typeof QUALITY_OPTIONS)[number]["id"]

// Only one demo video file is bundled, so there's no real multi-bitrate
// source to switch between. Lower "qualities" simulate the visual effect of
// a reduced resolution/bitrate via a CSS filter on the same source.
const QUALITY_FILTER: Record<Quality, string> = {
  auto: "none",
  "1080p": "none",
  "720p": "blur(0.3px)",
  "480p": "blur(0.7px) saturate(0.92)",
  "360p": "blur(1.2px) saturate(0.82)",
}

export function VideoPlayer({ viewers, alert, alertPinned, floatingGifts, chatVisible, onToggleChat, testPanelVisible, onToggleTestPanel }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(true)
  const [volume, setVolume] = useState(1)
  const [quality, setQuality] = useState<Quality>("auto")
  const [qualityOpen, setQualityOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // If the video is already ready (e.g. cached), hide the spinner immediately
  useEffect(() => {
    const video = videoRef.current
    if (video && video.readyState >= 2) setLoading(false)
  }, [])

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current
    if (!video) return
    const value = Number(e.target.value)
    video.volume = value
    video.muted = value === 0
  }

  function toggleFullscreen() {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      el.requestFullscreen().catch(() => {})
    }
  }

  return (
    <div ref={containerRef} className="player">
      <video
        ref={videoRef}
        src={STREAM_SRC}
        className="player__video"
        style={{ filter: QUALITY_FILTER[quality] }}
        autoPlay
        muted
        loop
        playsInline
        onLoadedData={() => setLoading(false)}
        onError={() => setLoading(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onVolumeChange={(e) => {
          setMuted(e.currentTarget.muted)
          setVolume(e.currentTarget.volume)
        }}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="player__loading">
          <span className="player__spinner" aria-label="Φόρτωση..." />
        </div>
      )}

      {/* Warm cinematic vignette */}
      <div className="player__vignette" />

      {/* Floating gift icons */}
      <FloatingGifts gifts={floatingGifts} />

      {/* Donation alert */}
      <div className="player__alert-wrap">
        <DonationAlert alert={alert} pinned={alertPinned} />
      </div>

      {/* Top bar: LIVE + viewers */}
      <div className="player__topbar">
        <div className="player__live-badge">
          <span className="player__live-dot">
            <span className="player__live-dot-ping" />
            <span className="player__live-dot-core" />
          </span>
          <span className="player__live-label">Ζωντανά</span>
        </div>
        <div className="player__viewers">
          <UsersIcon />
          {viewers.toLocaleString()}
        </div>
      </div>

      {/* Center play/pause (visible on hover / when paused) */}
      {!playing && (
        <button type="button" onClick={togglePlay} aria-label="Αναπαραγωγή μετάδοσης" className="player__play-overlay">
          <span className="player__play-button">
            <PlayIcon className="player__play-icon" weight="fill" />
          </span>
        </button>
      )}

      {/* Control bar */}
      <div className="player__controls">

        <div className="player__control-row">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Παύση" : "Αναπαραγωγή"}
            title={playing ? "Pause" : "Play"}
            className="player__control-btn"
          >
            {playing ? <PauseIcon weight="fill" /> : <PlayIcon weight="fill" />}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Κατάργηση σίγασης" : "Σίγαση"}
            title={muted ? "Unmute" : "Mute"}
            className="player__control-btn"
          >
            {muted ? <SpeakerXIcon weight="fill" /> : <SpeakerHighIcon weight="fill" />}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            aria-label="Ένταση ήχου"
            className="player__volume"
          />

          <div className="player__spacer">
              <button
                type="button"
                onClick={onToggleChat}
                aria-label={chatVisible ? "Απόκρυψη chat" : "Εμφάνιση chat"}
                aria-pressed={chatVisible}
                title={chatVisible ? "Hide chat" : "Show chat"}
                className={`player__control-btn player__control-btn--chat-toggle${chatVisible ? "" : " player__control-btn--inactive"}`}
              >
                <SidebarSimpleIcon />
              </button>
              {onToggleTestPanel && (
                <button
                  type="button"
                  onClick={onToggleTestPanel}
                  aria-pressed={testPanelVisible}
                  title={testPanelVisible ? "Hide testing tools" : "Show testing tools"}
                  className={`player__control-btn${testPanelVisible ? "" : " player__control-btn--inactive"}`}
                >
                  <FlaskIcon />
                </button>
              )}
              <button
                type="button"
                onClick={() => setQualityOpen((open) => !open)}
                aria-label="Ποιότητα βίντεο"
                aria-haspopup="true"
                aria-expanded={qualityOpen}
                title="Video quality"
                className="player__control-btn"
              >
                <GearSixIcon />
              </button>
              {qualityOpen && (
                <div className="player__quality-menu" role="menu">
                  {QUALITY_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      role="menuitemradio"
                      aria-checked={quality === option.id}
                      className={`player__quality-option${quality === option.id ? " player__quality-option--active" : ""}`}
                      onClick={() => {
                        setQuality(option.id)
                        setQualityOpen(false)
                      }}
                    >
                      {option.label}
                      {quality === option.id && <CheckIcon />}
                    </button>
                  ))}
                </div>
              )}

            <button type="button" onClick={toggleFullscreen} aria-label="Πλήρης οθόνη" title="Fullscreen" className="player__control-btn">
              <ArrowsOutIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
