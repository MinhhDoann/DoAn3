import React, { useState } from 'react';

interface LoginProps {
    onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'doan3' && password === '1') {
            onLogin();
        } else {
            setError('Tài khoản hoặc mật khẩu không đúng!');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="header-logo" style={{ fontSize: '48px', marginBottom: '10px' }}>JBL STORE</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Hệ Thống Quản Lý Cửa Hàng</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tài khoản</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nhập tài khoản"
                            className="login-input"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu"
                            className="login-input"
                        />
                    </div>

                    {error && <p className="login-error">{error}</p>}

                    <button type="submit" className="btn btn-jbl" style={{ width: '100%', padding: '12px', fontSize: '16px', marginTop: '20px' }}>
                        Đăng Nhập
                    </button>
                </form>

                <div className="login-footer">
                    <p>© 2026 JBL Store Administration</p>
                </div>
            </div>

            <style>{`
                .login-page {
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                }
                .login-card {
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    width: 100%;
                    max-width: 400px;
                    text-align: center;
                }
                .login-header {
                    margin-bottom: 30px;
                }
                .form-group {
                    text-align: left;
                    margin-bottom: 20px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    font-size: 14px;
                    color: var(--text-main);
                }
                .login-input {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    font-size: 15px;
                    outline: none;
                    transition: all 0.2s;
                }
                .login-input:focus {
                    border-color: var(--accent);
                    box-shadow: 0 0 0 4px rgba(255, 102, 0, 0.1);
                }
                .login-error {
                    color: #ef4444;
                    font-size: 14px;
                    margin-top: 10px;
                }
                .login-footer {
                    margin-top: 30px;
                    font-size: 12px;
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    );
}
