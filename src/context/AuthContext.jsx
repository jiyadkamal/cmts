import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Demo users with different roles
const DEMO_USERS = {
    admin: {
        id: 1,
        username: 'admin',
        password: 'admin123',
        name: 'John Administrator',
        email: 'admin@cmts.com',
        role: 'Admin',
        avatar: 'JA'
    },
    engineer: {
        id: 2,
        username: 'engineer',
        password: 'eng123',
        name: 'Sarah Engineer',
        email: 'sarah@cmts.com',
        role: 'Engineer',
        avatar: 'SE'
    },
    contractor: {
        id: 3,
        username: 'contractor',
        password: 'con123',
        name: 'Mike Contractor',
        email: 'mike@cmts.com',
        role: 'Contractor',
        avatar: 'MC'
    },
    client: {
        id: 4,
        username: 'client',
        password: 'client123',
        name: 'Emily Client',
        email: 'emily@cmts.com',
        role: 'Client',
        avatar: 'EC'
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check for saved session
        const savedUser = localStorage.getItem('cmts_user')
        if (savedUser) {
            setUser(JSON.parse(savedUser))
        }
        setLoading(false)
    }, [])

    const login = (username, password) => {
        const foundUser = Object.values(DEMO_USERS).find(
            u => u.username === username && u.password === password
        )

        if (foundUser) {
            const { password: _, ...userWithoutPassword } = foundUser
            setUser(userWithoutPassword)
            localStorage.setItem('cmts_user', JSON.stringify(userWithoutPassword))
            return { success: true }
        }

        return { success: false, error: 'Invalid username or password' }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('cmts_user')
    }

    const hasPermission = (permission) => {
        if (!user) return false

        const permissions = {
            Admin: ['manage_users', 'create_projects', 'view_projects', 'create_tasks', 'assign_tasks', 'update_tasks', 'manage_materials', 'view_budget', 'edit_budget'],
            Engineer: ['create_projects', 'view_projects', 'create_tasks', 'assign_tasks', 'update_tasks', 'manage_materials', 'view_budget'],
            Contractor: ['view_projects', 'update_tasks', 'manage_materials'],
            Client: ['view_projects', 'view_budget']
        }

        return permissions[user.role]?.includes(permission) || false
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, hasPermission, DEMO_USERS }}>
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
