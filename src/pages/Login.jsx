import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HardHat, User, Lock, AlertCircle, Mail, Phone, UserCog } from 'lucide-react'

function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('Engineer')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    let result

    if (isRegister) {
      if (!name || !email || !password) {
        setError('Please fill in all required fields')
        setIsLoading(false)
        return
      }
      result = await register({ name, email, password, role, phone })
    } else {
      result = await login(email, password)
    }

    if (result.success) {
      navigate('/')
    } else {
      setError(result.error)
    }
    setIsLoading(false)
  }

  const toggleMode = () => {
    setIsRegister(!isRegister)
    setError('')
  }

  return (
    <div className="login-page">
      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
          position: relative;
          overflow: hidden;
        }
        
        .login-page::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 30%, rgba(249, 115, 22, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
          animation: float 20s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-5%, -5%) rotate(5deg); }
        }
        
        .login-container {
          position: relative;
          width: 100%;
          max-width: 440px;
          z-index: 1;
        }
        
        .login-card {
          background: rgba(24, 24, 27, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid var(--neutral-800);
          border-radius: var(--radius-2xl);
          padding: var(--space-10);
          box-shadow: var(--shadow-2xl);
        }
        
        .login-header {
          text-align: center;
          margin-bottom: var(--space-8);
        }
        
        .login-logo {
          width: 72px;
          height: 72px;
          background: var(--primary-gradient);
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-5);
          box-shadow: var(--shadow-glow);
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.3); }
          50% { box-shadow: 0 0 40px rgba(249, 115, 22, 0.5); }
        }
        
        .login-title {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          margin-bottom: var(--space-2);
          background: linear-gradient(135deg, var(--neutral-50) 0%, var(--neutral-300) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .login-subtitle {
          font-size: var(--font-size-sm);
          color: var(--neutral-400);
        }
        
        .login-error {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--radius-lg);
          color: var(--danger-400);
          font-size: var(--font-size-sm);
          margin-bottom: var(--space-5);
          animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .input-wrapper {
          position: relative;
          margin-bottom: var(--space-4);
        }
        
        .input-wrapper .input-icon {
          position: absolute;
          left: var(--space-4);
          top: 50%;
          transform: translateY(-50%);
          color: var(--neutral-500);
          transition: color var(--transition-fast);
        }
        
        .input-wrapper input:focus + .input-icon,
        .input-wrapper input:focus ~ .input-icon {
          color: var(--primary-400);
        }
        
        .input-wrapper input,
        .input-wrapper select {
          width: 100%;
          padding: var(--space-4);
          padding-left: calc(var(--space-4) + 20px + var(--space-3));
          font-size: var(--font-size-base);
          background: var(--neutral-900);
          border: 1px solid var(--neutral-700);
          border-radius: var(--radius-lg);
          color: var(--neutral-100);
          outline: none;
          transition: all var(--transition-fast);
        }
        
        .input-wrapper select {
          cursor: pointer;
          appearance: none;
        }
        
        .input-wrapper input:focus,
        .input-wrapper select:focus {
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }
        
        .input-wrapper input::placeholder {
          color: var(--neutral-500);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }

        @media (max-width: 480px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
        
        .login-submit {
          width: 100%;
          padding: var(--space-4);
          font-size: var(--font-size-base);
          font-weight: 600;
          background: var(--primary-gradient);
          color: white;
          border: none;
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-base);
          box-shadow: var(--shadow-md), 0 0 20px rgba(249, 115, 22, 0.2);
          margin-top: var(--space-2);
        }
        
        .login-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg), var(--shadow-glow);
        }
        
        .login-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .login-footer {
          text-align: center;
          margin-top: var(--space-6);
          padding-top: var(--space-6);
          border-top: 1px solid var(--neutral-800);
        }
        
        .login-footer p {
          font-size: var(--font-size-sm);
          color: var(--neutral-400);
        }

        .login-footer .toggle-link {
          color: var(--primary-400);
          cursor: pointer;
          font-weight: 500;
          transition: color var(--transition-fast);
        }

        .login-footer .toggle-link:hover {
          color: var(--primary-300);
        }

        .login-copyright {
          font-size: var(--font-size-xs) !important;
          color: var(--neutral-500) !important;
          margin-top: var(--space-3);
        }
      `}</style>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <HardHat size={36} color="white" />
            </div>
            <h1 className="login-title">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="login-subtitle">
              {isRegister
                ? 'Set up your CMTS account'
                : 'Sign in to your CMTS account'}
            </p>
          </div>

          {error && (
            <div className="login-error">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <User size={20} className="input-icon" style={{ left: '16px' }} />
              </div>
            )}

            <div className="input-wrapper">
              <input
                type="email"
                placeholder="Email Address *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail size={20} className="input-icon" style={{ left: '16px' }} />
            </div>

            <div className="input-wrapper">
              <input
                type="password"
                placeholder="Password *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <Lock size={20} className="input-icon" style={{ left: '16px' }} />
            </div>

            {isRegister && (
              <>
                <div className="form-row">
                  <div className="input-wrapper">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="Engineer">Engineer</option>
                      <option value="Contractor">Contractor</option>
                      <option value="Client">Client</option>
                    </select>
                    <UserCog size={20} className="input-icon" style={{ left: '16px' }} />
                  </div>

                  <div className="input-wrapper">
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <Phone size={20} className="input-icon" style={{ left: '16px' }} />
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="login-submit" disabled={isLoading}>
              {isLoading
                ? (isRegister ? 'Creating Account...' : 'Signing In...')
                : (isRegister ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="login-footer">
            <p>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <span className="toggle-link" onClick={toggleMode}>
                {isRegister ? 'Sign In' : 'Create Account'}
              </span>
            </p>
            <p className="login-copyright">© 2025 CMTS. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
