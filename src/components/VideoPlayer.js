import React, { useRef, useState } from 'react';
import ReactPlayer from 'react-player';

const VideoPlayer = ({ video, className = '', autoPlay = false, controls = true }) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef(null);

  if (!video) return null;

  // Determine video source
  let videoUrl = '';
  if (video.videoType === 'upload') {
    videoUrl = `http://localhost:5000${video.videoUrl}`;
  } else if (video.videoType === 'embed') {
    videoUrl = video.embedUrl;
  }

  if (!videoUrl) return <p className="text-gray-400">No video source available</p>;

  // For embedded videos (YouTube, Vimeo)
  if (video.videoType === 'embed') {
    return (
      <div className={`relative w-full ${className}`} style={{ paddingBottom: '56.25%' }}>
        <ReactPlayer
          url={videoUrl}
          className="absolute top-0 left-0"
          width="100%"
          height="100%"
          controls={controls}
          playing={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          config={{
            youtube: {
              playerVars: { modestbranding: 1, rel: 0 }
            }
          }}
        />
      </div>
    );
  }

  // For uploaded videos with custom controls
  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      <video
        ref={playerRef}
        src={videoUrl}
        controls={controls}
        className="w-full h-auto"
        poster={video.thumbnail}
        onTimeUpdate={() => {
          if (playerRef.current) {
            const progress = playerRef.current.currentTime / playerRef.current.duration;
            setPlayed(progress);
          }
        }}
        onLoadedMetadata={() => {
          if (playerRef.current) {
            setDuration(playerRef.current.duration);
          }
        }}
      >
        Your browser does not support the video tag.
      </video>

      {/* Custom video info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        {video.title && (
          <h3 className="text-white text-lg font-semibold">{video.title}</h3>
        )}
        {video.views > 0 && (
          <p className="text-gray-300 text-sm">{video.views} views</p>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;