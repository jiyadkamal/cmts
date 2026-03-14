import { createContext, useContext, useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check for existing token and validate it
        const token = localStorage.getItem('cmts_token')
        if (token) {
            verifyToken(token)
        } else {
            setLoading(false)
        }
    }, [])

    const verifyToken = async (token) => {
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
                const userData = await response.json()
                setUser(userData)
            } else {
                // Token invalid or expired
                localStorage.removeItem('cmts_token')
                localStorage.removeItem('cmts_user')
            }
        } catch (err) {
            console.error('Token verification failed:', err)
            localStorage.removeItem('cmts_token')
            localStorage.removeItem('cmts_user')
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (!response.ok) {
                return { success: false, error: data.error }
            }

            localStorage.setItem('cmts_token', data.token)
            localStorage.setItem('cmts_user', JSON.stringify(data.user))
            setUser(data.user)
            return { success: true }
        } catch (err) {
            return { success: false, error: 'Network error. Make sure the server is running.' }
        }
    }

    const register = async ({ name, email, password, role, department, phone }) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role, department, phone })
            })

            const data = await response.json()

            if (!response.ok) {
                return { success: false, error: data.error }
            }

            localStorage.setItem('cmts_token', data.token)
            localStorage.setItem('cmts_user', JSON.stringify(data.user))
            setUser(data.user)
            return { success: true }
        } catch (err) {
            return { success: false, error: 'Network error. Make sure the server is running.' }
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('cmts_token')
        localStorage.removeItem('cmts_user')
    }

    const hasPermission = (permission) => {
        if (!user) return false

        const permissions = {
            Admin: ['manage_users', 'create_projects', 'view_projects', 'create_tasks', 'assign_tasks', 'update_tasks', 'manage_materials', 'view_budget', 'edit_budget'],
            Engineer: ['view_projects', 'create_tasks', 'assign_tasks', 'update_tasks', 'manage_materials', 'view_budget'],
            Contractor: ['create_projects', 'view_projects', 'create_tasks', 'assign_tasks', 'update_tasks', 'manage_materials', 'view_budget', 'edit_budget'],
            Client: ['view_projects', 'view_budget']
        }

        return permissions[user.role]?.includes(permission) || false
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, hasPermission }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
