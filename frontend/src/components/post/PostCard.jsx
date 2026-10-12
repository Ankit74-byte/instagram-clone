function Sidebar({ activeTab, onNavigate, onLogout, currentUser }) {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'search', label: 'Search' },
    { id: 'create', label: 'Create Post' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <aside className="sidebar">
      <div className="brand-mark">little<span>social</span></div>

      <nav className="nav-list">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-user">
        <img src={currentUser?.avatar} alt={currentUser?.username} />
        <div>
          <strong>{currentUser?.username}</strong>
          <small>{currentUser?.fullName}</small>
        </div>
      </div>

      <button className="logout-button" onClick={onLogout}>Logout</button>
    </aside>
  );
}

export default Sidebar;
