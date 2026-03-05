import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const DataContext = createContext(null)

export function DataProvider({ children }) {
    const [projects, setProjects] = useState([])
    const [tasks, setTasks] = useState([])
    const [materials, setMaterials] = useState([])
    const [budgets, setBudgets] = useState([])
    const [users, setUsers] = useState([])
    const [loaded, setLoaded] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Load all data from Supabase on mount
    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true)
                setError(null)

                const [projectsRes, tasksRes, materialsRes, budgetsRes, usersRes] = await Promise.all([
                    supabase.from('projects').select('*').order('id'),
                    supabase.from('tasks').select('*').order('id'),
                    supabase.from('materials').select('*').order('id'),
                    supabase.from('budgets').select('*').order('id'),
                    supabase.from('users').select('*').order('id')
                ])

                // Check for errors
                if (projectsRes.error) throw projectsRes.error
                if (tasksRes.error) throw tasksRes.error
                if (materialsRes.error) throw materialsRes.error
                if (budgetsRes.error) throw budgetsRes.error
                if (usersRes.error) throw usersRes.error

                // Transform snake_case to camelCase for frontend compatibility
                setProjects(projectsRes.data.map(transformProject))
                setTasks(tasksRes.data.map(transformTask))
                setMaterials(materialsRes.data.map(transformMaterial))
                setBudgets(budgetsRes.data.map(transformBudget))
                setUsers(usersRes.data.map(transformUser))
                setLoaded(true)
            } catch (err) {
                console.error('Error loading data from Supabase:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    // Transform functions (snake_case -> camelCase)
    const transformProject = (p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        client: p.client,
        location: p.location,
        startDate: p.start_date,
        endDate: p.end_date,
        budget: parseFloat(p.budget) || 0,
        status: p.status,
        progress: p.progress,
        priority: p.priority,
        manager: p.manager,
        milestones: p.milestones || [],
        createdAt: p.created_at
    })

    const transformTask = (t) => ({
        id: t.id,
        projectId: t.project_id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        assignee: t.assignee,
        assigneeId: t.assignee_id,
        dueDate: t.due_date,
        estimatedHours: t.estimated_hours,
        createdAt: t.created_at
    })

    const transformMaterial = (m) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        unit: m.unit,
        quantity: m.quantity,
        minStock: m.min_stock,
        maxStock: m.max_stock,
        unitPrice: parseFloat(m.unit_price) || 0,
        supplier: m.supplier,
        projectId: m.project_id,
        location: m.location,
        lastUpdated: m.last_updated,
        createdAt: m.created_at
    })

    const transformBudget = (b) => ({
        id: b.id,
        projectId: b.project_id,
        category: b.category,
        description: b.description,
        amount: parseFloat(b.amount) || 0,
        date: b.date,
        vendor: b.vendor,
        status: b.status,
        createdAt: b.created_at
    })

    const transformUser = (u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        phone: u.phone,
        avatar: u.avatar,
        status: u.status,
        joinedAt: u.joined_at
    })

    // Reverse transform functions (camelCase -> snake_case)
    const toDbProject = (p) => ({
        name: p.name,
        description: p.description,
        client: p.client,
        location: p.location,
        start_date: p.startDate,
        end_date: p.endDate,
        budget: p.budget,
        status: p.status,
        progress: p.progress || 0,
        priority: p.priority,
        manager: p.manager,
        milestones: p.milestones || []
    })

    const toDbTask = (t) => ({
        project_id: t.projectId,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        assignee: t.assignee,
        assignee_id: t.assigneeId,
        due_date: t.dueDate,
        estimated_hours: t.estimatedHours
    })

    const toDbMaterial = (m) => ({
        name: m.name,
        category: m.category,
        unit: m.unit,
        quantity: m.quantity,
        min_stock: m.minStock,
        max_stock: m.maxStock,
        unit_price: m.unitPrice,
        supplier: m.supplier,
        project_id: m.projectId,
        location: m.location
    })

    const toDbBudget = (b) => ({
        project_id: b.projectId,
        category: b.category,
        description: b.description,
        amount: b.amount,
        date: b.date,
        vendor: b.vendor,
        status: b.status
    })

    // Project actions
    const addProject = useCallback(async (project) => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .insert([toDbProject(project)])
                .select()

            if (error) throw error
            const newProject = transformProject(data[0])
            setProjects(prev => [...prev, newProject])
            return newProject
        } catch (err) {
            console.error('Error adding project:', err)
            throw err
        }
    }, [])

    const updateProject = useCallback(async (project) => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .update(toDbProject(project))
                .eq('id', project.id)
                .select()

            if (error) throw error
            const updatedProject = transformProject(data[0])
            setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p))
            return updatedProject
        } catch (err) {
            console.error('Error updating project:', err)
            throw err
        }
    }, [])

    const deleteProject = useCallback(async (id) => {
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', id)

            if (error) throw error
            setProjects(prev => prev.filter(p => p.id !== id))
        } catch (err) {
            console.error('Error deleting project:', err)
            throw err
        }
    }, [])

    // Task actions
    const addTask = useCallback(async (task) => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .insert([toDbTask(task)])
                .select()

            if (error) throw error
            const newTask = transformTask(data[0])
            setTasks(prev => [...prev, newTask])
            return newTask
        } catch (err) {
            console.error('Error adding task:', err)
            throw err
        }
    }, [])

    const updateTask = useCallback(async (task) => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .update(toDbTask(task))
                .eq('id', task.id)
                .select()

            if (error) throw error
            const updatedTask = transformTask(data[0])
            setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t))
            return updatedTask
        } catch (err) {
            console.error('Error updating task:', err)
            throw err
        }
    }, [])

    const deleteTask = useCallback(async (id) => {
        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', id)

            if (error) throw error
            setTasks(prev => prev.filter(t => t.id !== id))
        } catch (err) {
            console.error('Error deleting task:', err)
            throw err
        }
    }, [])

    // Material actions
    const addMaterial = useCallback(async (material) => {
        try {
            const { data, error } = await supabase
                .from('materials')
                .insert([toDbMaterial(material)])
                .select()

            if (error) throw error
            const newMaterial = transformMaterial(data[0])
            setMaterials(prev => [...prev, newMaterial])
            return newMaterial
        } catch (err) {
            console.error('Error adding material:', err)
            throw err
        }
    }, [])

    const updateMaterial = useCallback(async (material) => {
        try {
            const dbMaterial = toDbMaterial(material)
            dbMaterial.last_updated = new Date().toISOString()

            const { data, error } = await supabase
                .from('materials')
                .update(dbMaterial)
                .eq('id', material.id)
                .select()

            if (error) throw error
            const updatedMaterial = transformMaterial(data[0])
            setMaterials(prev => prev.map(m => m.id === material.id ? updatedMaterial : m))
            return updatedMaterial
        } catch (err) {
            console.error('Error updating material:', err)
            throw err
        }
    }, [])

    const deleteMaterial = useCallback(async (id) => {
        try {
            const { error } = await supabase
                .from('materials')
                .delete()
                .eq('id', id)

            if (error) throw error
            setMaterials(prev => prev.filter(m => m.id !== id))
        } catch (err) {
            console.error('Error deleting material:', err)
            throw err
        }
    }, [])

    // Budget actions
    const addExpense = useCallback(async (expense) => {
        try {
            const { data, error } = await supabase
                .from('budgets')
                .insert([toDbBudget(expense)])
                .select()

            if (error) throw error
            const newExpense = transformBudget(data[0])
            setBudgets(prev => [...prev, newExpense])
            return newExpense
        } catch (err) {
            console.error('Error adding expense:', err)
            throw err
        }
    }, [])

    const updateExpense = useCallback(async (expense) => {
        try {
            const { data, error } = await supabase
                .from('budgets')
                .update(toDbBudget(expense))
                .eq('id', expense.id)
                .select()

            if (error) throw error
            const updatedExpense = transformBudget(data[0])
            setBudgets(prev => prev.map(b => b.id === expense.id ? updatedExpense : b))
            return updatedExpense
        } catch (err) {
            console.error('Error updating expense:', err)
            throw err
        }
    }, [])

    const deleteExpense = useCallback(async (id) => {
        try {
            const { error } = await supabase
                .from('budgets')
                .delete()
                .eq('id', id)

            if (error) throw error
            setBudgets(prev => prev.filter(b => b.id !== id))
        } catch (err) {
            console.error('Error deleting expense:', err)
            throw err
        }
    }, [])

    // Computed values
    const getProjectById = useCallback((id) => projects.find(p => p.id === parseInt(id)), [projects])
    const getTasksByProject = useCallback((projectId) => tasks.filter(t => t.projectId === parseInt(projectId)), [tasks])
    const getMaterialsByProject = useCallback((projectId) => materials.filter(m => m.projectId === parseInt(projectId)), [materials])
    const getBudgetByProject = useCallback((projectId) => budgets.filter(b => b.projectId === parseInt(projectId)), [budgets])

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
            addTask,
            updateTask,
            deleteTask,
            addMaterial,
            updateMaterial,
            deleteMaterial,
            addExpense,
            updateExpense,
            deleteExpense,
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
