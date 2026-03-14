import express from 'express'
import cors from 'cors'
import admin from 'firebase-admin'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
    readFileSync(join(__dirname, 'firebaseServiceAccount.json'), 'utf8')
)

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()
const app = express()
const PORT = process.env.PORT || 8000
const JWT_SECRET = process.env.JWT_SECRET || 'cmts-jwt-secret-key-2025'

// Middleware
app.use(cors())
app.use(express.json())

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) return res.status(401).json({ error: 'Access denied' })

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        req.user = decoded
        next()
    } catch (err) {
        res.status(403).json({ error: 'Invalid token' })
    }
}

// =============================================
// Create default admin on startup
// =============================================
async function createDefaultAdmin() {
    try {
        const existing = await db.collection('users')
            .where('email', '==', 'admin@gmail.com')
            .get()

        if (existing.empty) {
            const hashedPassword = await bcrypt.hash('admin123', 10)
            await db.collection('users').add({
                name: 'Admin',
                email: 'admin@gmail.com',
                password: hashedPassword,
                role: 'Admin',
                department: 'Management',
                phone: '',
                avatar: 'AD',
                status: 'Active',
                joinedAt: new Date().toISOString(),
                createdAt: new Date().toISOString()
            })
            console.log('✅ Default admin account created (admin@gmail.com)')
        } else {
            console.log('✅ Default admin account exists')
        }
    } catch (err) {
        console.error('Error creating default admin:', err)
    }
}

// =============================================
// AUTH ROUTES
// =============================================

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role, department, phone } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' })
        }

        // Check if user already exists
        const existingUser = await db.collection('users')
            .where('email', '==', email)
            .get()

        if (!existingUser.empty) {
            return res.status(400).json({ error: 'An account with this email already exists' })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Block admin registration
        const allowedRoles = ['Engineer', 'Contractor', 'Client']
        const userRole = allowedRoles.includes(role) ? role : 'Client'

        // Create user document
        const userData = {
            name,
            email,
            password: hashedPassword,
            role: userRole,
            department: department || '',
            phone: phone || '',
            avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
            status: 'Active',
            joinedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        }

        const docRef = await db.collection('users').add(userData)

        // Generate JWT
        const { password: _, ...userWithoutPassword } = userData
        const tokenPayload = { id: docRef.id, email, role: userData.role }
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' })

        res.status(201).json({
            token,
            user: { id: docRef.id, ...userWithoutPassword }
        })
    } catch (error) {
        console.error('Error registering user:', error)
        res.status(500).json({ error: error.message })
    }
})

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' })
        }

        // Find user by email
        const snapshot = await db.collection('users')
            .where('email', '==', email)
            .get()

        if (snapshot.empty) {
            return res.status(401).json({ error: 'Invalid email or password' })
        }

        const userDoc = snapshot.docs[0]
        const userData = userDoc.data()

        // Compare password
        const isValidPassword = await bcrypt.compare(password, userData.password)
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' })
        }

        // Generate JWT
        const { password: _, ...userWithoutPassword } = userData
        const tokenPayload = { id: userDoc.id, email, role: userData.role }
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' })

        res.json({
            token,
            user: { id: userDoc.id, ...userWithoutPassword }
        })
    } catch (error) {
        console.error('Error logging in:', error)
        res.status(500).json({ error: error.message })
    }
})

// Verify token / Get current user
app.get('/api/auth/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' })
        }

        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, JWT_SECRET)

        const userDoc = await db.collection('users').doc(decoded.id).get()
        if (!userDoc.exists) {
            return res.status(401).json({ error: 'User not found' })
        }

        const { password, ...userWithoutPassword } = userDoc.data()
        res.json({ id: userDoc.id, ...userWithoutPassword })
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Invalid or expired token' })
        }
        res.status(500).json({ error: error.message })
    }
})

// =============================================
// GENERIC CRUD ROUTES FOR FIRESTORE COLLECTIONS
// =============================================

const ALLOWED_COLLECTIONS = ['projects', 'tasks', 'materials', 'budgets', 'users']

// GET all documents from a collection
app.get('/api/:collection', authenticateToken, async (req, res) => {
    try {
        const { collection } = req.params
        if (!ALLOWED_COLLECTIONS.includes(collection)) {
            return res.status(400).json({ error: 'Invalid collection' })
        }

        // Helper: sort by createdAt descending in-memory (avoids Firestore composite indexes)
        const sortByDate = (docs) => docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        // Helper: batch Firestore 'in' queries (max 30 items per query)
        const batchInQuery = async (collectionName, field, ids) => {
            const BATCH_SIZE = 30
            const batches = []
            for (let i = 0; i < ids.length; i += BATCH_SIZE) {
                const chunk = ids.slice(i, i + BATCH_SIZE)
                batches.push(db.collection(collectionName).where(field, 'in', chunk).get())
            }
            const snapshots = await Promise.all(batches)
            return snapshots.flatMap(snap => snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        }

        // 1. For users collection, no project-based filtering needed
        if (collection === 'users') {
            const snapshot = await db.collection('users').get()
            const docs = snapshot.docs.map(doc => {
                const { password, ...safeData } = doc.data()
                return { id: doc.id, ...safeData }
            })
            return res.json(sortByDate(docs))
        }

        // 2. Admin sees everything
        if (req.user.role === 'Admin') {
            const snapshot = await db.collection(collection).get()
            const docs = sortByDate(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
            return res.json(docs)
        }

        // 3. Non-admin: compute accessible project IDs (deduplicated)
        const ownedSnapshot = await db.collection('projects').where('ownerId', '==', req.user.id).get()
        const memberSnapshot = await db.collection('projects').where('members', 'array-contains', req.user.id).get()
        const accessibleProjectIds = [...new Set([
            ...ownedSnapshot.docs.map(d => d.id),
            ...memberSnapshot.docs.map(d => d.id)
        ])]
        console.log(`[Data] User: ${req.user.email} (${req.user.role}), Collection: ${collection}, Owned: ${ownedSnapshot.size}, Member of: ${memberSnapshot.size}, Accessible (deduped): ${accessibleProjectIds.length}`)

        if (accessibleProjectIds.length === 0) return res.json([])

        // 4. Handle projects collection
        if (collection === 'projects') {
            const docsDetails = await Promise.all(
                accessibleProjectIds.map(id => db.collection('projects').doc(id).get())
            )
            const docs = sortByDate(
                docsDetails
                    .filter(d => d.exists)
                    .map(doc => ({ id: doc.id, ...doc.data() }))
            )
            return res.json(docs)
        }

        // 5. Handle tasks, materials, budgets — batched 'in' queries
        if (['tasks', 'materials', 'budgets'].includes(collection)) {
            const docs = await batchInQuery(collection, 'projectId', accessibleProjectIds)
            return res.json(sortByDate(docs))
        }

        // 6. Fallback
        const snapshot = await db.collection(collection).get()
        const docs = sortByDate(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        res.json(docs)
    } catch (error) {
        console.error(`Error fetching ${req.params.collection}:`, error)
        res.status(500).json({ error: error.message })
    }
})

// GET a single document
app.get('/api/:collection/:id', authenticateToken, async (req, res) => {
    try {
        const { collection, id } = req.params
        if (!ALLOWED_COLLECTIONS.includes(collection)) {
            return res.status(400).json({ error: 'Invalid collection' })
        }

        const doc = await db.collection(collection).doc(id).get()
        if (!doc.exists) {
            return res.status(404).json({ error: 'Document not found' })
        }

        const data = doc.data()

        // Access Control for single documents
        if (req.user.role !== 'Admin') {
            if (collection === 'projects') {
                if (data.ownerId !== req.user.id && !(data.members || []).includes(req.user.id)) {
                    return res.status(403).json({ error: 'Access denied to this project' })
                }
            } else if (['tasks', 'materials', 'budgets'].includes(collection)) {
                const projectId = data.projectId
                if (!projectId) return res.status(403).json({ error: 'Item not associated with a project' })

                // Verify project access
                const projectDoc = await db.collection('projects').doc(projectId).get()
                if (!projectDoc.exists) return res.status(404).json({ error: 'Associated project not found' })

                const projectData = projectDoc.data()
                if (projectData.ownerId !== req.user.id && !(projectData.members || []).includes(req.user.id)) {
                    return res.status(403).json({ error: 'Access denied' })
                }
            }
        }

        res.json({ id: doc.id, ...data })
    } catch (error) {
        console.error(`Error fetching document:`, error)
        res.status(500).json({ error: error.message })
    }
})

// POST - create a new document
// Helper: Sync material to budget
async function syncMaterialToBudget(materialId, materialData) {
    try {
        const { name, projectId, quantity, unitPrice, createdAt } = materialData
        const amount = (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0)

        // Find existing budget entry for this material
        const existing = await db.collection('budgets')
            .where('materialId', '==', materialId)
            .limit(1)
            .get()

        const expenseData = {
            projectId,
            materialId,
            category: 'Materials',
            description: `Material: ${name}`,
            amount,
            date: new Date().toISOString().split('T')[0],
            vendor: materialData.supplier || 'Unknown',
            status: 'Paid',
            createdAt: createdAt || new Date().toISOString()
        }

        if (!existing.empty) {
            await existing.docs[0].ref.update(expenseData)
            console.log(`[Budget Sync] Updated expense for material: ${materialId}`)
        } else if (amount > 0) {
            await db.collection('budgets').add(expenseData)
            console.log(`[Budget Sync] Created new expense for material: ${materialId}`)
        }
    } catch (err) {
        console.error('[Budget Sync] Error:', err)
    }
}

// POST - create a new document
app.post('/api/:collection', authenticateToken, async (req, res) => {
    try {
        const { collection } = req.params
        if (!ALLOWED_COLLECTIONS.includes(collection)) {
            return res.status(400).json({ error: 'Invalid collection' })
        }

        const data = {
            ...req.body,
            createdAt: req.body.createdAt || new Date().toISOString()
        }

        // Add ownerId if it's a project
        if (collection === 'projects') {
            if (req.user.role !== 'Contractor' && req.user.role !== 'Admin') {
                return res.status(403).json({ error: 'Only contractors can create projects' })
            }
            data.ownerId = req.user.id
            data.members = data.members || []
        }

        // Restriction: Clients cannot manage materials
        if (collection === 'materials' && req.user.role === 'Client') {
            return res.status(403).json({ error: 'Clients cannot create materials' })
        }

        // Access control: Verify user has access to the project for tasks/materials/budgets
        if (['tasks', 'materials', 'budgets'].includes(collection) && req.user.role !== 'Admin') {
            const projectId = data.projectId
            if (!projectId) return res.status(400).json({ error: 'projectId is required' })

            const projectDoc = await db.collection('projects').doc(projectId).get()
            if (!projectDoc.exists) return res.status(404).json({ error: 'Project not found' })

            const projectData = projectDoc.data()
            if (projectData.ownerId !== req.user.id && !(projectData.members || []).includes(req.user.id)) {
                return res.status(403).json({ error: 'You do not have access to this project' })
            }
        }

        const docRef = await db.collection(collection).add(data)
        const newDoc = await docRef.get()
        const result = { id: newDoc.id, ...newDoc.data() }

        // Trigger sync if material
        if (collection === 'materials') {
            await syncMaterialToBudget(docRef.id, result)
        }

        res.status(201).json(result)
    } catch (error) {
        console.error(`Error creating document:`, error)
        res.status(500).json({ error: error.message })
    }
})

// Join Project
app.post('/api/projects/:id/join', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params
        const docRef = db.collection('projects').doc(id)
        const doc = await docRef.get()

        if (!doc.exists) {
            return res.status(404).json({ error: 'Project not found' })
        }

        const data = doc.data()
        if (data.ownerId === req.user.id) {
            return res.status(400).json({ error: 'You are the owner of this project' })
        }

        const members = data.members || []
        if (members.includes(req.user.id)) {
            return res.status(400).json({ error: 'You are already a member of this project' })
        }

        console.log(`[JOIN DEBUG] User ID being added to members: "${req.user.id}" (type: ${typeof req.user.id})`)
        console.log(`[JOIN DEBUG] Current members array:`, JSON.stringify(members))

        await docRef.update({
            members: admin.firestore.FieldValue.arrayUnion(req.user.id)
        })

        // Return the full updated project so frontend can use it immediately
        const updatedDoc = await docRef.get()
        const updatedProject = { id: updatedDoc.id, ...updatedDoc.data() }
        console.log(`[JOIN DEBUG] Updated members array:`, JSON.stringify(updatedProject.members))

        res.json({ message: 'Joined project successfully', project: updatedProject })
    } catch (error) {
        console.error('Error joining project:', error)
        res.status(500).json({ error: error.message })
    }
})

// PUT - update a document
app.put('/api/:collection/:id', authenticateToken, async (req, res) => {
    try {
        const { collection, id } = req.params
        if (!ALLOWED_COLLECTIONS.includes(collection)) {
            return res.status(400).json({ error: 'Invalid collection' })
        }

        const docRef = db.collection(collection).doc(id)
        const doc = await docRef.get()
        if (!doc.exists) return res.status(404).json({ error: 'Document not found' })

        // Access Control
        if (req.user.role !== 'Admin') {
            const data = doc.data()
            if (collection === 'projects') {
                if (data.ownerId !== req.user.id) return res.status(403).json({ error: 'Only owners can edit projects' })
            } else if (['tasks', 'materials', 'budgets'].includes(collection)) {
                // Restriction: Clients cannot manage materials
                if (collection === 'materials' && req.user.role === 'Client') {
                    return res.status(403).json({ error: 'Clients cannot modify materials' })
                }

                // Determine projectId from item data or request body
                const projectId = data.projectId || req.body.projectId
                if (!projectId) return res.status(403).json({ error: 'Item not associated with a project' })

                const projectDoc = await db.collection('projects').doc(projectId).get()
                if (!projectDoc.exists) return res.status(404).json({ error: 'Associated project not found' })

                const projectData = projectDoc.data()
                // Allow owner or members to update
                if (projectData.ownerId !== req.user.id && !(projectData.members || []).includes(req.user.id)) {
                    return res.status(403).json({ error: 'Access denied' })
                }
            }
        }

        await docRef.update(req.body)
        const updatedDoc = await docRef.get()
        const result = { id: updatedDoc.id, ...updatedDoc.data() }

        // Trigger sync if material
        if (collection === 'materials') {
            await syncMaterialToBudget(id, result)
        }

        res.json(result)
    } catch (error) {
        console.error(`Error updating document:`, error)
        res.status(500).json({ error: error.message })
    }
})

// DELETE - delete a document
app.delete('/api/:collection/:id', authenticateToken, async (req, res) => {
    try {
        const { collection, id } = req.params
        if (!ALLOWED_COLLECTIONS.includes(collection)) {
            return res.status(400).json({ error: 'Invalid collection' })
        }

        const docRef = db.collection(collection).doc(id)
        const doc = await docRef.get()
        if (!doc.exists) return res.status(404).json({ error: 'Document not found' })

        // Access Control
        if (req.user.role !== 'Admin') {
            const data = doc.data()
            if (collection === 'projects') {
                if (data.ownerId !== req.user.id) return res.status(403).json({ error: 'Only owners can delete projects' })
            } else if (['tasks', 'materials', 'budgets'].includes(collection)) {
                const projectDoc = await db.collection('projects').doc(data.projectId).get()
                if (!projectDoc.exists) return res.status(404).json({ error: 'Associated project not found' })
                const projectData = projectDoc.data()
                if (projectData.ownerId !== req.user.id && req.user.role !== 'Admin') {
                    return res.status(403).json({ error: 'Access denied' })
                }
            }
        }

        // Implementation of Cascading Deletion for Projects
        if (collection === 'projects') {
            const collectionsToClean = ['tasks', 'materials', 'budgets']
            for (const coll of collectionsToClean) {
                const associatedDocs = await db.collection(coll)
                    .where('projectId', '==', id)
                    .get()

                if (!associatedDocs.empty) {
                    const batch = db.batch()
                    associatedDocs.docs.forEach(d => batch.delete(d.ref))
                    await batch.commit()
                    console.log(`[Cascade Delete] Removed ${associatedDocs.size} ${coll} for project: ${id}`)
                }
            }
        }

        // If material is deleted, remove linked budget entry
        if (collection === 'materials') {
            const budgetEntries = await db.collection('budgets')
                .where('materialId', '==', id)
                .get()

            if (!budgetEntries.empty) {
                const batch = db.batch()
                budgetEntries.docs.forEach(d => batch.delete(d.ref))
                await batch.commit()
                console.log(`[Budget Sync] Removed expenses for material: ${id}`)
            }
        }

        await docRef.delete()
        res.json({ success: true })
    } catch (error) {
        console.error(`Error deleting document:`, error)
        res.status(500).json({ error: error.message })
    }
})

// Start server
app.listen(PORT, async () => {
    console.log(`🔥 CMTS API Server running on http://localhost:${PORT}`)
    console.log(`📦 Firebase project: ${serviceAccount.project_id}`)
    await createDefaultAdmin()
})
