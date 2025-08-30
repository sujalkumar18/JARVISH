import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, ExternalLink, Music, Video } from "lucide-react";

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

interface YouTubeCardProps {
  searchQuery: string;
  videos: YouTubeVideo[];
  selectedVideo: YouTubeVideo;
}

export const YouTubeCard: React.FC<YouTubeCardProps> = ({ 
  searchQuery, 
  videos, 
  selectedVideo 
}) => {
  const [currentVideo, setCurrentVideo] = useState(selectedVideo);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioOnly, setIsAudioOnly] = useState(true); // Default to audio-only to avoid embedding restrictions
  const [isMuted, setIsMuted] = useState(false);
  const [embedError, setEmbedError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    
    // Send message to iframe to play/pause
    if (iframeRef.current) {
      const message = isPlaying ? '{"event":"command","func":"pauseVideo","args":""}' : '{"event":"command","func":"playVideo","args":""}';
      iframeRef.current.contentWindow?.postMessage(message, 'https://www.youtube.com');
    }
  };


  const toggleAudioMode = () => {
    setIsAudioOnly(!isAudioOnly);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    // Send message to iframe to mute/unmute
    if (iframeRef.current) {
      const message = isMuted ? '{"event":"command","func":"unMute","args":""}' : '{"event":"command","func":"mute","args":""}';
      iframeRef.current.contentWindow?.postMessage(message, 'https://www.youtube.com');
    }
  };

  const getYouTubeEmbedUrl = (videoId: string) => {
    const baseUrl = `https://www.youtube.com/embed/${videoId}`;
    const params = new URLSearchParams({
      autoplay: '0', // Don't autoplay initially
      mute: isMuted ? '1' : '0',
      controls: '1',
      rel: '0',
      modestbranding: '1',
      iv_load_policy: '3',
      enablejsapi: '1', // Enable JavaScript API
      origin: window.location.origin
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const handleVideoSelect = (video: YouTubeVideo) => {
    setCurrentVideo(video);
    setIsPlaying(false);
    setEmbedError(false);
  };

  const handleIframeError = () => {
    setEmbedError(true);
  };

  return (
    <div className="glass-card rounded-2xl shadow-xl overflow-hidden border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up">
      <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-b border-white/20 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-500 rounded-xl shadow-lg">
            <Music className="text-white h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white text-lg">YouTube Music</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Playing: {searchQuery}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleAudioMode}
            className={`p-2 rounded-lg transition-colors ${
              isAudioOnly 
                ? "bg-blue-500 text-white shadow-md" 
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
            title={isAudioOnly ? "Switch to Video Mode" : "Switch to Audio Only"}
            data-testid="button-toggle-audio-mode"
          >
            {isAudioOnly ? <Music className="h-4 w-4" /> : <Video className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Current Video Player */}
        <div className="mb-4">
          <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg">
            {isAudioOnly ? (
              // Audio-only mode with embedded player
              <div className="relative">
                {/* Hidden iframe for audio playback */}
                {!embedError ? (
                  <iframe
                    ref={iframeRef}
                    src={getYouTubeEmbedUrl(currentVideo.videoId)}
                    title={currentVideo.title}
                    className="w-full h-1 opacity-0 pointer-events-none absolute"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onError={handleIframeError}
                    data-testid="youtube-audio-player"
                  />
                ) : null}
                
                {/* Audio interface */}
                <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900 relative">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-4 mx-auto backdrop-blur-sm border border-white/20">
                      <Music className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 px-4">{currentVideo.title}</h3>
                    <p className="text-white/80 text-sm mb-4">{currentVideo.channelTitle}</p>
                    
                    {/* Audio controls */}
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <button
                        onClick={handlePlay}
                        className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 transition-all duration-200 transform hover:scale-105"
                        data-testid="button-play-pause-audio"
                      >
                        {isPlaying ? (
                          <Pause className="h-8 w-8 text-white" />
                        ) : (
                          <Play className="h-8 w-8 text-white ml-1" />
                        )}
                      </button>
                      <button
                        onClick={toggleMute}
                        className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 transition-all duration-200"
                        data-testid="button-toggle-mute-audio"
                      >
                        {isMuted ? (
                          <VolumeX className="h-6 w-6 text-white" />
                        ) : (
                          <Volume2 className="h-6 w-6 text-white" />
                        )}
                      </button>
                    </div>
                    
                    {embedError && (
                      <div className="mb-4">
                        <p className="text-yellow-300 text-sm mb-2">⚠️ This video can't be embedded</p>
                        <a
                          href={`https://www.youtube.com/watch?v=${currentVideo.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium transition-all duration-200 transform hover:scale-105"
                          data-testid="button-play-on-youtube-fallback"
                        >
                          <ExternalLink className="h-5 w-5" />
                          <span>Play on YouTube</span>
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {/* Status indicator */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-white/90 text-xs font-medium">
                        {isPlaying ? "🎵 Playing" : "⏸️ Paused"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Video mode
              <div className="aspect-video">
                <iframe
                  src={getYouTubeEmbedUrl(currentVideo.videoId)}
                  title={currentVideo.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  data-testid="youtube-player"
                />
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="mt-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-2">
              {currentVideo.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {currentVideo.channelTitle}
            </p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-500">
                {new Date(currentVideo.publishedAt).toLocaleDateString()}
              </span>
              <a
                href={`https://www.youtube.com/watch?v=${currentVideo.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-red-500 hover:text-red-600 text-sm transition-colors"
                data-testid="link-open-youtube"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open in YouTube</span>
              </a>
            </div>
          </div>
        </div>

        {/* Video Options */}
        {videos.length > 1 && (
          <div>
            <h5 className="font-medium text-gray-800 dark:text-white mb-3">Other Results:</h5>
            <div className="space-y-2">
              {videos.filter(video => video.videoId !== currentVideo.videoId).map((video) => (
                <div
                  key={video.videoId}
                  onClick={() => handleVideoSelect(video)}
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  data-testid={`video-option-${video.videoId}`}
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-16 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h6 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                      {video.title}
                    </h6>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {video.channelTitle}
                    </p>
                  </div>
                  <Play className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            🎵 Music plays directly in the app! Use the play button to start listening. 
            If a song can't be embedded, you'll see a YouTube link instead.
          </p>
        </div>
      </div>
    </div>
  );
};