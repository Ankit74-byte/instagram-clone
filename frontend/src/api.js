import { useEffect, useMemo, useState } from 'react';
import api from './api';
import AuthForm from './components/auth/AuthForm';
import Sidebar from './components/layout/Sidebar';
import PostCard from './components/post/PostCard';
import ProfileHeader from './components/profile/ProfileHeader';

const APP_NAV = ['home', 'search', 'create', 'profile'];

const defaultFormState = { caption: '', image: null };

function App() {
  const [token, setToken] = useState(localStorage.getItem('instagram_token') || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [feed, setFeed] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatingPost, setCreatingPost] = useState(false);
  const [postForm, setPostForm] = useState(defaultFormState);

  const fetchCurrentUser = async () => {
    if (!token) return;
    try {
      const { data } = await api.get('/users/me');
      setCurrentUser(data);
    } catch (err) {
      localStorage.removeItem('instagram_token');
      setToken('');
      setCurrentUser(null);
    }
  };

  const fetchFeed = async () => {
    if (!token) return;
    try {
      const { data } = await api.get('/posts');
      setFeed(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      setLoading(true);
      if (token) {
        await fetchCurrentUser();
        await fetchFeed();
      }
      setLoading(false);
    };

    loadSession();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    localStorage.setItem('instagram_token', token);
  }, [token]);

  const handleAuthSubmit = async ({ fullName, username, email, password }) => {
    setError('');
    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/signup';
      const payload = authMode === 'login' ? { email, password } : { fullName, username, email, password };
      const { data } = await api.post(endpoint, payload);
      localStorage.setItem('instagram_token', data.token);
      setToken(data.token);
      setCurrentUser(data.user);
      setActiveTab('home');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  const handleSearch = async (value) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data } = await api.get(`/users/search/${value.trim()}`);
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (event) => {
    event.preventDefault();
    if (!postForm.caption.trim() && !postForm.image) {
      setError('Add a caption or an image to your post.');
      return;
    }

    try {
      setCreatingPost(true);
      setError('');
      const formData = new FormData();
      formData.append('caption', postForm.caption);
      if (postForm.image) formData.append('image', postForm.image);

      await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPostForm(defaultFormState);
      setActiveTab('home');
      await fetchFeed();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create post.');
    } finally {
      setCreatingPost(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await api.post(`/posts/${postId}/like`);
      setFeed((prev) => prev.map((post) => (post._id === postId ? data : post)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (postId, text) => {
    if (!text.trim()) return;
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { text });
      setFeed((prev) => prev.map((post) => (post._id === postId ? data : post)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('instagram_token');
    setToken('');
    setCurrentUser(null);
    setFeed([]);
    setSearchResults([]);
    setActiveTab('home');
  };

  const featuredProfile = useMemo(() => {
    return currentUser;
  }, [currentUser]);

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-shell">
          <div className="brand-panel">
            <h1>little<span>social</span></h1>
            <p>Share moments, connect with friends, and explore fresh stories.</p>
          </div>
          <div className="auth-card">
            <AuthForm
              mode={authMode}
              onSwitchMode={setAuthMode}
              onSubmit={handleAuthSubmit}
              error={error}
            />
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading-screen">Loading your feed...</div>;
  }

  return (
    <div className="app-shell">
      <Sidebar
        activeTab={activeTab}
        onNavigate={setActiveTab}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      <main className="main-content">
        {activeTab === 'home' && (
          <div className="feed-panel">
            <div className="topbar">
              <h2>Feed</h2>
            </div>
            <div className="posts-list">
              {feed.length === 0 ? (
                <div className="empty-state">No posts yet. Start the conversation.</div>
              ) : (
                feed.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    currentUser={currentUser}
                    onLike={handleLike}
                    onComment={handleComment}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="search-panel">
            <div className="topbar">
              <h2>Search</h2>
            </div>
            <div className="search-box">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Search by username"
              />
            </div>

            <div className="search-results">
              {searchResults.length === 0 ? (
                <div className="empty-state">Search for friends by username.</div>
              ) : (
                searchResults.map((user) => (
                  <button className="user-search-result" key={user._id} onClick={() => setActiveTab('profile')}>
                    <img src={user.avatar} alt={user.username} />
                    <div>
                      <strong>{user.username}</strong>
                      <small>{user.fullName}</small>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="composer-panel">
            <div className="topbar">
              <h2>Create Post</h2>
            </div>
            <form className="composer-form" onSubmit={handleCreatePost}>
              <textarea
                value={postForm.caption}
                onChange={(event) => setPostForm({ ...postForm, caption: event.target.value })}
                placeholder="Write a caption..."
              />
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setPostForm({ ...postForm, image: event.target.files[0] })}
              />
              {error && <div className="form-error">{error}</div>}
              <button type="submit" className="primary-button" disabled={creatingPost}>
                {creatingPost ? 'Posting...' : 'Share Post'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'profile' && featuredProfile && (
          <div className="profile-panel">
            <div className="topbar">
              <h2>Profile</h2>
            </div>
            <ProfileHeader user={featuredProfile} />
            <div className="profile-grid">
              {feed.filter((post) => post.user?._id === currentUser?._id || post.user?.username === currentUser?.username).length === 0 ? (
                <div className="empty-state">No posts yet. Share your first update.</div>
              ) : (
                feed
                  .filter((post) => post.user?._id === currentUser?._id || post.user?.username === currentUser?.username)
                  .map((post) => (
                    <div className="profile-tile" key={post._id}>
                      <img src={post.image} alt={post.caption || 'user post'} />
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
