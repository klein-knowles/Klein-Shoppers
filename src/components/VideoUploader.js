import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const VideoUploader = ({ onUploadSuccess, productId, category }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [uploadType, setUploadType] = useState('upload'); // 'upload' or 'embed'
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);
  const { token } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (100MB)
      if (file.size > 100 * 1024 * 1024) {
        setMessage('File too large. Maximum size is 100MB.');
        return;
      }
      setSelectedFile(file);
      setMessage('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setProgress(0);
    setMessage('');

    try {
      if (uploadType === 'upload' && !selectedFile) {
        setMessage('Please select a video file.');
        setIsUploading(false);
        return;
      }

      if (uploadType === 'embed' && !embedUrl) {
        setMessage('Please enter an embed URL.');
        setIsUploading(false);
        return;
      }

      let endpoint = '/api/videos';
      let formData = new FormData();

      if (uploadType === 'upload') {
        endpoint = '/api/videos/upload';
        formData.append('video', selectedFile);
        formData.append('title', title || selectedFile.name);
        formData.append('description', description);
        if (productId) formData.append('productId', productId);
        if (category) formData.append('category', category);

        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        };

        const response = await axios.post(endpoint, formData, config);
        handleSuccess(response.data);
      } else {
        // Embed video
        endpoint = '/api/videos/embed';
        const data = {
          title,
          description,
          embedUrl,
          category: category || 'product',
          productId: productId || null
        };

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        const response = await axios.post(endpoint, data, config);
        handleSuccess(response.data);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleSuccess = (data) => {
    setMessage('✅ Video uploaded successfully!');
    setTitle('');
    setDescription('');
    setSelectedFile(null);
    setEmbedUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onUploadSuccess) {
      onUploadSuccess(data.video);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Upload Video</h2>

      <form onSubmit={handleUpload} className="space-y-4">
        {/* Upload Type Toggle */}
        <div className="flex gap-4 mb-4">
          <button
            type="button"
            onClick={() => setUploadType('upload')}
            className={`flex-1 py-2 px-4 rounded-lg transition ${
              uploadType === 'upload'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            📁 Upload File
          </button>
          <button
            type="button"
            onClick={() => setUploadType('embed')}
            className={`flex-1 py-2 px-4 rounded-lg transition ${
              uploadType === 'embed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🔗 Embed URL
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="block text-gray-300 mb-2">Video Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:border-blue-500"
            placeholder="My Awesome Video"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-300 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:border-blue-500"
            rows="3"
            placeholder="Tell us about this video..."
          />
        </div>

        {/* Upload or Embed */}
        {uploadType === 'upload' ? (
          <div>
            <label className="block text-gray-300 mb-2">Select Video File *</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*"
              className="w-full bg-gray-800 text-gray-300 rounded-lg px-4 py-2 border border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              required={uploadType === 'upload'}
            />
            <p className="text-gray-500 text-sm mt-1">Max file size: 100MB. Supported: MP4, WebM, MOV</p>
          </div>
        ) : (
          <div>
            <label className="block text-gray-300 mb-2">Embed URL *</label>
            <input
              type="url"
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="https://www.youtube.com/watch?v=..."
              required={uploadType === 'embed'}
            />
            <p className="text-gray-500 text-sm mt-1">Supports YouTube and Vimeo links</p>
          </div>
        )}

        {/* Progress Bar */}
        {isUploading && (
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
            <p className="text-gray-400 text-sm mt-1">{progress}% uploaded</p>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-lg ${message.includes('✅') ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
            {message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : uploadType === 'upload' ? 'Upload Video' : 'Embed Video'}
        </button>
      </form>
    </div>
  );
};

export default VideoUploader;