import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import api from '../lib/api'

const DataContext = createContext(null)

export function DataProvider({ children }) {
    const { user: authUser } = useAuth()
    const [projects, setProjects] = useState([])
    const [tasks, setTasks] = useState([])
    const [materials, setMaterials] = useState([])
    const [budgets, setBudgets] = useState([])
    const [users, setUsers] = useState([])
    const [loaded, setLoaded] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedProjectId, setSelectedProjectId] = useState(() => {
        return localStorage.getItem('cmts_selected_project_id') || ''
    })

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const results = await Promise.allSettled([
                api.getAll('projects'),
                api.getAll('tasks'),
                api.getAll('materials'),
                api.getAll('budgets'),
                api.getAll('users')
            ])

            const projectsData = results[0].status === 'fulfilled' ? results[0].value : []
            const tasksData = results[1].status === 'fulfilled' ? results[1].value : []
            const materialsData = results[2].status === 'fulfilled' ? results[2].value : []
            const budgetsData = results[3].status === 'fulfilled' ? results[3].value : []
            const usersData = results[4].status === 'fulfilled' ? results[4].value : []

            // Log any failed requests
            results.forEach((r, i) => {
                if (r.status === 'rejected') {
                    const names = ['projects', 'tasks', 'materials', 'budgets', 'users']
                    console.error(`Failed to load ${names[i]}:`, r.reason)
                }
            })

            setProjects(projectsData)
            setTasks(tasksData)
            setMaterials(materialsData)
            setBudgets(budgetsData)
            setUsers(usersData)

            // Validate selected project using functional update to avoid stale closure
            setSelectedProjectId(prev => {
                if (prev && !projectsData.find(p => p.id === prev)) {
                    localStorage.removeItem('cmts_selected_project_id')
                    return ''
                } else if (!prev && projectsData.length > 0) {
                    localStorage.setItem('cmts_selected_project_id', projectsData[0].id)
                    return projectsData[0].id
                }
                return prev
            })

            setLoaded(true)
        } catch (err) {
            console.error('Error loading data from Firestore:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    // Load data when user logs in; clear data when user logs out
    useEffect(() => {
        if (authUser) {
            loadData()
        } else {
            // Reset all state on logout
            setProjects([])
            setTasks([])
            setMaterials([])
            setBudgets([])
            setUsers([])
            setLoaded(false)
            setLoading(false)
            setError(null)
        }
    }, [authUser?.id, loadData])

    // ==================
    // Project Actions
    // ==================
    const addProject = useCallback(async (project) => {
        try {
            const newProject = await api.create('projects', project)
            setProjects(prev => [...prev, newProject])
            return newProject
        } catch (err) {
            console.error('Error adding project:', err)
            throw err
        }
    }, [])

    const updateProject = useCallback(async (project) => {
        try {
            const { id, ...data } = project
            const updatedProject = await api.update('projects', id, data)
            setProjects(prev => prev.map(p => p.id === id ? updatedProject : p))
            return updatedProject
        } catch (err) {
            console.error('Error updating project:', err)
            throw err
        }
    }, [])

    const deleteProject = useCallback(async (id) => {
        try {
            await api.remove('projects', id)
            setProjects(prev => prev.filter(p => p.id !== id))
            // Reload data to clear orphan tasks/materials/budgets
            await loadData()
        } catch (err) {
            console.error('Error deleting project:', err)
            throw err
        }
    }, [loadData])

    const handleSetSelectedProject = useCallback((id) => {
        setSelectedProjectId(id)
        if (id) {
            localStorage.setItem('cmts_selected_project_id', id)
        } else {
            localStorage.removeItem('cmts_selected_project_id')
        }
    }, [])

    const joinProject = useCallback(async (id) => {
        try {
            const result = await api.joinProject(id)
            // Immediately add the joined project to local state if returned
            if (result.project) {
                setProjects(prev => {
                    // Avoid duplicates
                    if (prev.find(p => p.id === result.project.id)) return prev
                    return [result.project, ...prev]
                })
            }
            // Also reload all data to get tasks/materials/budgets for the new project
            await loadData()
        } catch (err) {
            console.error('Error joining project:', err)
            throw err
        }
    }, [loadData])

    // ==================
    // Task Actions
    // ==================
    const addTask = useCallback(async (task) => {
        try {
            const newTask = await api.create('tasks', task)
            setTasks(prev => [...prev, newTask])
            return newTask
        } catch (err) {
            console.error('Error adding task:', err)
            throw err
        }
    }, [])

    const updateTask = useCallback(async (task) => {
        try {
            const { id, ...data } = task
            const updatedTask = await api.update('tasks', id, data)
            setTasks(prev => prev.map(t => t.id === id ? updatedTask : t))
            return updatedTask
        } catch (err) {
            console.error('Error updating task:', err)
            throw err
        }
    }, [])

    const deleteTask = useCallback(async (id) => {
        try {
            await api.remove('tasks', id)
            setTasks(prev => prev.filter(t => t.id !== id))
        } catch (err) {
            console.error('Error deleting task:', err)
            throw err
        }
    }, [])

    // ==================
    // Material Actions
    // ==================
    const addMaterial = useCallback(async (material) => {
        try {
            const newMaterial = await api.create('materials', material)
            setMaterials(prev => [...prev, newMaterial])
            // Reload data to get updated budget entries
            await loadData()
            return newMaterial
        } catch (err) {
            console.error('Error adding material:', err)
            throw err
        }
    }, [loadData])

    const updateMaterial = useCallback(async (material) => {
        try {
            const { id, ...data } = material
            data.lastUpdated = new Date().toISOString()
            const updatedMaterial = await api.update('materials', id, data)
            setMaterials(prev => prev.map(m => m.id === id ? updatedMaterial : m))
            // Reload data to get updated budget entries
            await loadData()
            return updatedMaterial
        } catch (err) {
            console.error('Error updating material:', err)
            throw err
        }
    }, [loadData])

    const deleteMaterial = useCallback(async (id) => {
        try {
            await api.remove('materials', id)
            setMaterials(prev => prev.filter(m => m.id !== id))
            // Reload data to get updated budget entries
            await loadData()
        } catch (err) {
            console.error('Error deleting material:', err)
            throw err
        }
    }, [loadData])

    // ==================
    // Budget (Expense) Actions
    // ==================
    const addExpense = useCallback(async (expense) => {
        try {
            const newExpense = await api.create('budgets', expense)
            setBudgets(prev => [...prev, newExpense])
            return newExpense
        } catch (err) {
            console.error('Error adding expense:', err)
            throw err
        }
    }, [])

    const updateExpense = useCallback(async (expense) => {
        try {
            const { id, ...data } = expense
            const updatedExpense = await api.update('budgets', id, data)
            setBudgets(prev => prev.map(b => b.id === id ? updatedExpense : b))
            return updatedExpense
        } catch (err) {
            console.error('Error updating expense:', err)
            throw err
        }
    }, [])

    const deleteExpense = useCallback(async (id) => {
        try {
            await api.remove('budgets', id)
            setBudgets(prev => prev.filter(b => b.id !== id))
        } catch (err) {
            console.error('Error deleting expense:', err)
            throw err
        }
    }, [])

    // ==================
    // User Actions
    // ==================
    const updateUser = useCallback(async (user) => {
        try {
            const { id, ...data } = user
            const updatedUser = await api.update('users', id, data)
            setUsers(prev => prev.map(u => u.id === id ? updatedUser : u))
            return updatedUser
        } catch (err) {
            console.error('Error updating user:', err)
            throw err
        }
    }, [])

    const deleteUser = useCallback(async (id) => {
        try {
            await api.remove('users', id)
            setUsers(prev => prev.filter(u => u.id !== id))
        } catch (err) {
            console.error('Error deleting user:', err)
            throw err
        }
    }, [])

    // ==================
    // Computed Values
    // ==================
    const getProjectById = useCallback((id) => projects.find(p => p.id === id), [projects])
    const getTasksByProject = useCallback((projectId) => tasks.filter(t => t.projectId === projectId), [tasks])
    const getMaterialsByProject = useCallback((projectId) => materials.filter(m => m.projectId === projectId), [materials])
    const getBudgetByProject = useCallback((projectId) => budgets.filter(b => b.projectId === projectId), [budgets])

    const getTotalBudget = useCallback(() => projects.reduce((sum, p) => sum + (p.budget || 0), 0), [projects])
    const getTotalExpenses = useCallback(() => budgets.reduce((sum, b) => sum + (b.amount || 0), 0), [budgets])

    const getLowStockMaterials = useCallback(() => materials.filter(m => m.quantity <= m.minStock), [materials])

    return (
        <DataContext.Provider value={{
            projects,
            tasks,
            materials,
            budgets,
            users,
            loaded,
            loading,
            error,
            addProject,
            updateProject,
            deleteProject,
            joinProject,
            selectedProjectId,
            setSelectedProjectId: handleSetSelectedProject,
            selectedProject: projects.find(p => p.id === selectedProjectId),
            addTask,
            updateTask,
            deleteTask,
            addMaterial,
            updateMaterial,
            deleteMaterial,
            addExpense,
            updateExpense,
            deleteExpense,
            updateUser,
            deleteUser,
            getProjectById,
            getTasksByProject,
            getMaterialsByProject,
            getBudgetByProject,
            getTotalBudget,
            getTotalExpenses,
            getLowStockMaterials
        }}>
            {children}
        </DataContext.Provider>
    )
}

export function useData() {
    const context = useContext(DataContext)
    if (!context) {
        throw new Error('useData must be used within a DataProvider')
    }
    return context
}
