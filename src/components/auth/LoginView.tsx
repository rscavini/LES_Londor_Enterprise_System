import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

export const LoginView: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            console.error("Login error:", err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Credenciales incorrectas. Por favor, verifica tu email y contraseña.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Demasiados intentos fallidos. Inténtalo más tarde.');
            } else {
                setError('Error al iniciar sesión. Inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Por favor, ingresa tu correo electrónico primero.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await sendPasswordResetEmail(auth, email);
            setResetSent(true);
        } catch (err: any) {
            console.error("Reset error:", err);
            setError('Error al enviar el correo de recuperación. Verifica el email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container" style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '20px'
        }}>
            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '40px',
                textAlign: 'center'
            }}>
                <div style={{
                    marginBottom: '30px'
                }}>
                    <span style={{
                        fontFamily: 'Outfit',
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        letterSpacing: '2px'
                    }}>
                        LONDOR <span style={{ color: 'var(--accent)' }}>LES</span>
                    </span>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '14px' }}>
                        Enterprise Resource Planning
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'var(--primary-light)'
                        }}>
                            Correo Electrónico
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)'
                            }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-control"
                                placeholder="ejemplo@londor.com"
                                style={{ paddingLeft: '40px' }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'var(--primary-light)'
                        }}>
                            Contraseña
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)'
                            }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-control"
                                placeholder="••••••••"
                                style={{ paddingLeft: '40px' }}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            backgroundColor: 'rgba(220, 53, 69, 0.1)',
                            color: 'var(--error)',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '13px'
                        }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {resetSent && (
                        <div style={{
                            backgroundColor: 'rgba(40, 167, 69, 0.1)',
                            color: 'var(--success)',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '13px'
                        }}>
                            Se ha enviado un correo para restablecer tu contraseña.
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{
                            width: '100%',
                            justifyContent: 'center',
                            height: '48px',
                            fontSize: '15px',
                            fontWeight: 600
                        }}
                    >
                        {loading ? (
                            <div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                        ) : (
                            <>
                                Acceder al Sistema
                                <LogIn size={18} />
                            </>
                        )}
                    </button>
                    <style>{`
                        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    `}</style>
                    <div style={{ marginTop: '16px', textAlign: 'right' }}>
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent)',
                                fontSize: '13px',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                </form>

                <div style={{ marginTop: '30px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    © {new Date().getFullYear()} Londor Enterprise System. Todos los derechos reservados.
                </div>
            </div>
        </div>
    );
};
