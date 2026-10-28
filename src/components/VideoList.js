import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';
import { useAuth } from '../context/AuthContext';

const VideoList = ({ productId, category, limit = 12 }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchVideos();
  }, [productId, category]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      let url = `/api/videos?limit=${limit}`;
      if (productId) url += `&productId=${productId}`;
      if (category) url += `&category=${category}`;

      const response = await axios.get(url);
      setVideos(response.data.videos);
      if (response.data.videos.length > 0) {
        setSelectedVideo(response.data.videos[0]);
      }
    } catch (error) {
      setError('Failed to load videos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      await axios.delete(`/api/videos/${videoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setVideos(videos.filter(v => v._id !== videoId));
      if (selectedVideo?._id === videoId) {
        setSelectedVideo(videos.find(v => v._id !== videoId) || null);
      }
    } catch (error) {
      alert('Failed to delete video');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg animate-pulse h-48"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800 rounded-lg">
        <p className="text-gray-400 text-lg">No videos available yet</p>
        <p className="text-gray-500 text-sm mt-2">Upload your first video to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Featured/Selected Video */}
      {selectedVideo && (
        <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
          <VideoPlayer video={selectedVideo} className="w-full" />
          <div className="p-4">
            <h3 className="text-white text-xl font-bold">{selectedVideo.title}</h3>
            {selectedVideo.description && (
              <p className="text-gray-400 mt-2">{selectedVideo.description}</p>
            )}
            <p className="text-gray-500 text-sm mt-2">
              Uploaded by {selectedVideo.uploadedBy?.name || 'Unknown'} • {selectedVideo.views} views
            </p>
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((video) => (
          <div
            key={video._id}
            className={`bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition hover:scale-105 ${
              selectedVideo?._id === video._id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedVideo(video)}
          >
            <div className="relative bg-black aspect-video">
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  ▶️
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-2">
                <p className="text-white text-sm font-medium truncate">{video.title}</p>
              </div>
            </div>

            {/* Delete button (if user owns video) */}
            {token && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(video._id);
                }}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoList;