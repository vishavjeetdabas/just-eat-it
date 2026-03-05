import { useState } from 'react';
import { supabase } from '../lib/supabase';
import './Login.css';

export default function Login() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMsg(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMsg('Registration successful! Check your email or confirm login.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-header animate-in">
                <div className="login-logo-wrap">
                    <img src="/logo.png" alt="Just Eat It" className="login-logo" />
                </div>
                <h1 className="text-title" style={{ marginTop: 24, textAlign: 'center' }}>Just Eat It</h1>
                <p className="text-caption" style={{ textAlign: 'center', marginTop: 8 }}>Your premium meal tracker</p>
            </div>

            <div className="login-card glass-card animate-in animate-delay-1">
                <h2 className="text-headline" style={{ marginBottom: 20, textAlign: 'center' }}>
                    {isSignUp ? 'Create an Account' : 'Welcome Back'}
                </h2>

                {error && <div className="login-alert error">{error}</div>}
                {msg && <div className="login-alert success">{msg}</div>}

                <form onSubmit={handleAuth} className="login-form">
                    <div className="input-group">
                        <label className="text-micro">Email Address</label>
                        <input
                            type="email"
                            className="login-input"
                            placeholder="apple@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group" style={{ marginTop: 16 }}>
                        <label className="text-micro">Password</label>
                        <input
                            type="password"
                            className="login-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary login-btn"
                        disabled={loading}
                        style={{ marginTop: 28, width: '100%' }}
                    >
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <div className="login-footer">
                    <p className="text-caption">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    </p>
                    <button
                        type="button"
                        className="btn-link"
                        onClick={() => { setIsSignUp(!isSignUp); setError(null); setMsg(null); }}
                    >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    );
}
