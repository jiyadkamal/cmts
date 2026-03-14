const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`

    // Get token from localStorage
    const token = localStorage.getItem('cmts_token')

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
        },
        ...options
    }

    const response = await fetch(url, config)

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }))
        throw new Error(error.error || 'API request failed')
    }

    return response.json()
}

const api = {
    // GET all documents from a collection
    getAll: (collection) => request(`/${collection}`),

    // GET a single document
    getOne: (collection, id) => request(`/${collection}/${id}`),

    // POST - create a new document
    create: (collection, data) => request(`/${collection}`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // PUT - update a document
    update: (collection, id, data) => request(`/${collection}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    // DELETE - delete a document
    remove: (collection, id) => request(`/${collection}/${id}`, {
        method: 'DELETE'
    }),

    // Join a project
    joinProject: (id) => request(`/projects/${id}/join`, {
        method: 'POST'
    })
}

export default api
