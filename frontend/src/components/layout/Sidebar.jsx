import { useState } from 'react';

const defaultValues = {
  fullName: '',
  username: '',
  email: '',
  password: '',
};

function AuthForm({ mode, onSwitchMode, onSubmit, error }) {
  const [form, setForm] = useState(defaultValues);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-header">
        <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
        <p>{mode === 'login' ? 'Sign in to continue' : 'Join your community'}</p>
      </div>

      {mode === 'signup' && (
        <>
          <label>
            Full name
            <input name="fullName" value={form.fullName} onChange={handleChange} required />
          </label>
          <label>
            Username
            <input name="username" value={form.username} onChange={handleChange} required />
          </label>
        </>
      )}

      <label>
        Email
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
      </label>

      <label>
        Password
        <input type="password" name="password" value={form.password} onChange={handleChange} minLength="6" required />
      </label>

      {error && <div className="form-error">{error}</div>}

      <button type="submit" className="primary-button" disabled={loading}>
        {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Sign Up'}
      </button>

      <button type="button" className="text-button" onClick={() => onSwitchMode(mode === 'login' ? 'signup' : 'login')}>
        {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
      </button>
    </form>
  );
}

export default AuthForm;
