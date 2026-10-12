import { useState } from 'react';

function PostCard({ post, currentUser, onLike, onComment }) {
  const [commentText, setCommentText] = useState('');

  return (
    <article className="post-card">
      <div className="post-header">
        <div className="post-user">
          <img src={post.user?.avatar || currentUser?.avatar} alt={post.user?.username || currentUser?.username} />
          <div>
            <strong>{post.user?.username || currentUser?.username}</strong>
            <small>{new Date(post.createdAt).toLocaleString()}</small>
          </div>
        </div>
      </div>

      <img className="post-image" src={post.image} alt={post.caption || 'Post'} />

      <div className="post-actions">
        <button className={post.liked ? 'like-button liked' : 'like-button'} onClick={() => onLike(post._id)}>
          {post.liked ? '♥ Liked' : '♡ Like'}
        </button>
        <button className="comment-button">💬 {post.comments?.length || 0}</button>
      </div>

      <div className="post-content">
        <strong>{post.user?.username || currentUser?.username}</strong>
        <p>{post.caption}</p>
      </div>

      <div className="comment-list">
        {post.comments?.map((comment) => (
          <div key={comment._id || comment.text} className="comment-item">
            <strong>{comment.user?.username || 'You'}:</strong> {comment.text}
          </div>
        ))}
      </div>

      <div className="comment-box">
        <input
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          placeholder="Add a comment..."
        />
        <button onClick={() => { onComment(post._id, commentText); setCommentText(''); }}>Post</button>
      </div>
    </article>
  );
}

export default PostCard;
