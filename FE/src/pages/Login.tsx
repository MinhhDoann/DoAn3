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

                    <button type="submit" className="btn btn-jbl btn-full">
                        Đăng Nhập
                    </button>
                </form>

                <div className="login-footer">
                    <p>© 2026 JBL Store Administration</p>
                </div>
            </div>
        </div>
    );
}
