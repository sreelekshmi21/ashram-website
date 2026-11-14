"use client";

import { useEffect, useState, useRef } from "react";
import { useScrollReveal } from "@/lib/animations";
import { videos as staticVideos } from "@/lib/constants";
import { type PublishedVideo } from "@/lib/data";
import { VIDEO_CATEGORIES } from "@/lib/videoConfig";

const fallbackVideos: PublishedVideo[] = staticVideos.map((v) => ({
  id: v.id,
  title: v.title,
  description: "Experience the profound teachings, meditation retreats, and heritage of Santhigiri Ashram.",
  category: "Spiritual Discourses",
  streamUrl: "",
  thumbnailUrl: null,
  durationSeconds: null,
  formattedDuration: v.duration,
  gradient: v.gradient,
  displayOrder: parseInt(v.id, 10) || 0,
  createdAt: new Date().toISOString(),
}));

export default function VideoGallery() {
  const [videoList, setVideoList] = useState<PublishedVideo[]>(fallbackVideos);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeVideo, setActiveVideo] = useState<PublishedVideo | null>(null);
  const [loading, setLoading] = useState(false);
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);

  useScrollReveal([loading, selectedCategory, videoList.length]);

  useEffect(() => {
    async function loadVideos() {
      try {
        setLoading(true);
        const url = selectedCategory === "All" ? "/api/videos" : `/api/videos?category=${encodeURIComponent(selectedCategory)}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setVideoList(json.data);
        } else if (selectedCategory === "All") {
          setVideoList(fallbackVideos);
        } else {
          setVideoList([]);
        }
      } catch (err) {
        console.warn("[VideoGallery] Failed to fetch dynamic videos, using static list:", err);
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, [selectedCategory]);

  const categories = ["All", ...VIDEO_CATEGORIES];

  const handleOpenPlayer = (video: PublishedVideo) => {
    setActiveVideo(video);
  };

  const handleClosePlayer = () => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.pause();
    }
    setActiveVideo(null);
  };

  return (
    <section id="video-gallery" className="section-padding bg-ivory relative">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="text-center mb-12 reveal">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-saffron" />
            <span className="text-saffron text-sm font-semibold tracking-[0.2em] uppercase">
              Watch & Learn
            </span>
            <span className="h-px w-8 bg-saffron" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-dark mb-4">
            Video Gallery
          </h2>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto">
            Explore our collection of spiritual discourses, meditation guides, and documentary films.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-forest text-white shadow-md scale-105"
                    : "bg-white text-forest-dark border border-gold-light/40 hover:bg-gold-light/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Video cards */}
        {videoList.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-2xl border border-gold-light/30">
            <p className="text-warm-gray text-lg">No videos available in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videoList.map((video, index) => (
              <div
                key={video.id}
                className="reveal group bg-white rounded-2xl overflow-hidden border border-gold-light/20 shadow-sm card-hover flex flex-col cursor-pointer"
                style={{ transitionDelay: `${index * 80}ms` }}
                onClick={() => handleOpenPlayer(video)}
              >
                {/* Video thumbnail */}
                <div
                  className="relative aspect-video overflow-hidden bg-forest-dark"
                  style={{ background: video.gradient }}
                >
                  {video.thumbnailUrl && (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  )}

                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors">
                    <button
                      aria-label={`Play ${video.title}`}
                      className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center group-hover:bg-saffron group-hover:scale-110 transition-all duration-300 shadow-xl"
                    >
                      <svg
                        className="w-7 h-7 text-white ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>

                  {/* Duration badge */}
                  {video.formattedDuration && (
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                      {video.formattedDuration}
                    </div>
                  )}

                  {/* Category badge */}
                  <div className="absolute top-3 left-3 bg-forest-dark/80 backdrop-blur-sm text-gold-light text-xs font-medium px-2.5 py-1 rounded-md">
                    {video.category}
                  </div>
                </div>

                {/* Video info */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-forest-dark group-hover:text-saffron transition-colors duration-300 leading-snug line-clamp-2">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-warm-gray text-sm mt-2 line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Responsive Video Player Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6"
          onClick={handleClosePlayer}
          role="dialog"
          aria-modal="true"
          aria-labelledby="video-modal-title"
        >
          <div
            className="relative w-full max-w-4xl bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 bg-stone-950/80 border-b border-white/10">
              <h3 id="video-modal-title" className="font-heading text-lg font-bold text-white truncate pr-4">
                {activeVideo.title}
              </h3>
              <button
                onClick={handleClosePlayer}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-xl"
                aria-label="Close video player"
              >
                ✕
              </button>
            </div>

            {/* Video player element */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {activeVideo.streamUrl ? (
                <video
                  ref={videoPlayerRef}
                  src={activeVideo.streamUrl}
                  poster={activeVideo.thumbnailUrl || undefined}
                  controls
                  autoPlay={false}
                  playsInline
                  controlsList="nodownload"
                  className="w-full h-full"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-saffron/20 text-saffron flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-white text-lg font-semibold mb-1">Archived Video Presentation</h4>
                  <p className="text-stone-400 text-sm max-w-md mx-auto">
                    This video presentation is currently part of the ashram spiritual archives. Use the admin panel to upload high-definition MP4/WebM content directly to MinIO.
                  </p>
                </div>
              )}
            </div>

            {/* Modal description footer */}
            {activeVideo.description && (
              <div className="p-6 bg-stone-950/60 max-h-36 overflow-y-auto">
                <span className="text-xs font-semibold uppercase tracking-wider text-saffron block mb-1">
                  {activeVideo.category}
                </span>
                <p className="text-stone-300 text-sm leading-relaxed">
                  {activeVideo.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
