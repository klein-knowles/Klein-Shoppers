import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import axios from 'axios';

const VideoManager = () => {
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Load videos when page opens
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await axios.get('/api/videos');
      setVideos(response.data.videos);
      if (response.data.videos.length > 0) {
        setSelectedVideo(response.data.videos[0]);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('title', title);
      formData.append('description', description);

      await axios.post('/api/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('✅ Video uploaded successfully!');
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      fetchVideos(); // Refresh list
    } catch (error) {
      setMessage('❌ Upload failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmbed = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await axios.post('/api/videos/embed', {
        title,
        description,
        embedUrl
      });

      setMessage('✅ Video embedded successfully!');
      setTitle('');
      setDescription('');
      setEmbedUrl('');
      fetchVideos();
    } catch (error) {
      setMessage('❌ Embed failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', color: 'white' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>🎬 Video Manager</h1>

      {/* Upload Form */}
      <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '15px' }}>Upload New Video</h2>
        
        <form onSubmit={handleUpload}>
          <input
            type="text"
            placeholder="Video Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #333', background: '#2a2a2a', color: 'white' }}
            required
          />
          
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #333', background: '#2a2a2a', color: 'white' }}
            rows="3"
          />
          
          <input
            type="file"
            onChange={handleFileChange}
            accept="video/*"
            style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#2a2a2a', color: 'white' }}
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            style={{ background: '#0066ff', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            {loading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>

        <hr style={{ margin: '20px 0', borderColor: '#333' }} />

        <h2 style={{ marginBottom: '15px' }}>OR Embed YouTube/Vimeo</h2>
        <form onSubmit={handleEmbed}>
          <input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #333', background: '#2a2a2a', color: 'white' }}
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            style={{ background: '#00cc66', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            {loading ? 'Embedding...' : 'Embed Video'}
          </button>
        </form>

        {message && <p style={{ marginTop: '15px', color: message.includes('✅') ? '#00cc66' : '#ff4444' }}>{message}</p>}
      </div>

      {/* Video Player */}
      {selectedVideo && (
        <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
          <h2 style={{ marginBottom: '15px' }}>🎥 Now Playing</h2>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <ReactPlayer
              url={selectedVideo.videoType === 'upload' 
                ? `http://localhost:5000${selectedVideo.videoUrl}`
                : selectedVideo.embedUrl
              }
              controls
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
          </div>
          <h3 style={{ marginTop: '15px' }}>{selectedVideo.title}</h3>
          <p style={{ color: '#aaa' }}>{selectedVideo.description}</p>
        </div>
      )}

      {/* Video List */}
      <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '10px' }}>
        <h2 style={{ marginBottom: '15px' }}>📹 All Videos ({videos.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
          {videos.map((video) => (
            <div
              key={video._id}
              onClick={() => setSelectedVideo(video)}
              style={{
                background: '#2a2a2a',
                padding: '10px',
                borderRadius: '8px',
                cursor: 'pointer',
                border: selectedVideo?._id === video._id ? '2px solid #0066ff' : '2px solid transparent'
              }}
            >
              <div style={{ background: '#1a1a1a', aspectRatio: '16/9', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
                ▶️
              </div>
              <p style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '14px' }}>{video.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoManager;