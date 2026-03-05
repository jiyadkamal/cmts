// Initial Projects
export const initialProjects = [
    {
        id: 1,
        name: 'Downtown Office Tower',
        description: 'A 45-story commercial office building with modern amenities and sustainable design features.',
        client: 'Metro Development Corp',
        location: 'Downtown District, City Center',
        startDate: '2024-01-15',
        endDate: '2026-06-30',
        budget: 45000000,
        status: 'In Progress',
        progress: 35,
        priority: 'High',
        manager: 'Sarah Engineer',
        milestones: [
            { id: 1, name: 'Foundation Complete', date: '2024-04-15', status: 'Completed' },
            { id: 2, name: 'Structure Framework', date: '2024-10-30', status: 'Completed' },
            { id: 3, name: 'Exterior Facade', date: '2025-03-15', status: 'In Progress' },
            { id: 4, name: 'Interior Fit-out', date: '2025-09-30', status: 'Pending' },
            { id: 5, name: 'Final Inspection', date: '2026-05-15', status: 'Pending' }
        ],
        createdAt: '2024-01-10T08:00:00Z'
    },
    {
        id: 2,
        name: 'Riverside Luxury Apartments',
        description: 'Premium residential complex featuring 200 luxury apartments with river views and exclusive amenities.',
        client: 'Riverside Realty LLC',
        location: 'Waterfront Avenue, Riverside',
        startDate: '2024-03-01',
        endDate: '2025-12-31',
        budget: 28000000,
        status: 'In Progress',
        progress: 52,
        priority: 'High',
        manager: 'Sarah Engineer',
        milestones: [
            { id: 1, name: 'Site Preparation', date: '2024-04-01', status: 'Completed' },
            { id: 2, name: 'Foundation & Basement', date: '2024-07-15', status: 'Completed' },
            { id: 3, name: 'Structural Work', date: '2024-12-01', status: 'Completed' },
            { id: 4, name: 'MEP Installation', date: '2025-05-30', status: 'In Progress' },
            { id: 5, name: 'Interior Finishing', date: '2025-10-15', status: 'Pending' }
        ],
        createdAt: '2024-02-20T09:30:00Z'
    },
    {
        id: 3,
        name: 'Central Hospital Expansion',
        description: 'Major expansion of the existing hospital facility including a new emergency wing and diagnostic center.',
        client: 'City Healthcare Authority',
        location: 'Medical District, Central Zone',
        startDate: '2024-06-01',
        endDate: '2026-08-31',
        budget: 62000000,
        status: 'In Progress',
        progress: 22,
        priority: 'Critical',
        manager: 'John Administrator',
        milestones: [
            { id: 1, name: 'Design Approval', date: '2024-05-15', status: 'Completed' },
            { id: 2, name: 'Demolition Phase', date: '2024-08-30', status: 'Completed' },
            { id: 3, name: 'New Foundation', date: '2025-01-15', status: 'In Progress' },
            { id: 4, name: 'Building Structure', date: '2025-08-30', status: 'Pending' },
            { id: 5, name: 'Medical Equipment Install', date: '2026-06-30', status: 'Pending' }
        ],
        createdAt: '2024-05-01T10:00:00Z'
    },
    {
        id: 4,
        name: 'Green Valley Shopping Mall',
        description: 'Modern retail complex with sustainable features, underground parking, and entertainment facilities.',
        client: 'Valley Retail Group',
        location: 'Green Valley, Suburban District',
        startDate: '2023-09-15',
        endDate: '2025-03-31',
        budget: 35000000,
        status: 'In Progress',
        progress: 78,
        priority: 'Medium',
        manager: 'Sarah Engineer',
        milestones: [
            { id: 1, name: 'Land Acquisition', date: '2023-08-01', status: 'Completed' },
            { id: 2, name: 'Underground Parking', date: '2024-03-15', status: 'Completed' },
            { id: 3, name: 'Main Structure', date: '2024-09-30', status: 'Completed' },
            { id: 4, name: 'Tenant Fit-out', date: '2025-01-30', status: 'In Progress' },
            { id: 5, name: 'Grand Opening Prep', date: '2025-03-15', status: 'Pending' }
        ],
        createdAt: '2023-09-01T08:30:00Z'
    },
    {
        id: 5,
        name: 'Highway Bridge Renovation',
        description: 'Critical infrastructure project to renovate and strengthen the main highway bridge.',
        client: 'Department of Transportation',
        location: 'Interstate Highway 45',
        startDate: '2024-04-01',
        endDate: '2024-11-30',
        budget: 12000000,
        status: 'Completed',
        progress: 100,
        priority: 'Critical',
        manager: 'John Administrator',
        milestones: [
            { id: 1, name: 'Traffic Diversion', date: '2024-04-15', status: 'Completed' },
            { id: 2, name: 'Deck Removal', date: '2024-06-01', status: 'Completed' },
            { id: 3, name: 'Structural Repair', date: '2024-08-15', status: 'Completed' },
            { id: 4, name: 'New Deck Installation', date: '2024-10-30', status: 'Completed' },
            { id: 5, name: 'Final Testing', date: '2024-11-20', status: 'Completed' }
        ],
        createdAt: '2024-03-15T07:00:00Z'
    }
]

// Initial Tasks
export const initialTasks = [
    // Downtown Office Tower Tasks
    {
        id: 1,
        projectId: 1,
        title: 'Install curtain wall system - Floor 15-20',
        description: 'Complete installation of aluminum and glass curtain wall system for floors 15 through 20.',
        status: 'In Progress',
        priority: 'High',
        assignee: 'Mike Contractor',
        assigneeId: 3,
        dueDate: '2025-02-15',
        estimatedHours: 240,
        createdAt: '2025-01-05T09:00:00Z'
    },
    {
        id: 2,
        projectId: 1,
        title: 'MEP rough-in Floor 10-15',
        description: 'Complete mechanical, electrical, and plumbing rough-in work for designated floors.',
        status: 'Todo',
        priority: 'High',
        assignee: 'Sarah Engineer',
        assigneeId: 2,
        dueDate: '2025-02-28',
        estimatedHours: 180,
        createdAt: '2025-01-06T10:30:00Z'
    },
    {
        id: 3,
        projectId: 1,
        title: 'Elevator shaft construction',
        description: 'Complete construction of main elevator shafts and install guide rails.',
        status: 'Completed',
        priority: 'Critical',
        assignee: 'Mike Contractor',
        assigneeId: 3,
        dueDate: '2025-01-10',
        estimatedHours: 320,
        createdAt: '2024-12-01T08:00:00Z'
    },
    {
        id: 4,
        projectId: 1,
        title: 'Fire safety system installation',
        description: 'Install fire suppression system including sprinklers, alarms, and emergency lighting.',
        status: 'Todo',
        priority: 'Critical',
        assignee: 'Sarah Engineer',
        assigneeId: 2,
        dueDate: '2025-03-30',
        estimatedHours: 400,
        createdAt: '2025-01-08T11:00:00Z'
    },
    // Riverside Apartments Tasks
    {
        id: 5,
        projectId: 2,
        title: 'Plumbing installation - Building A',
        description: 'Complete all plumbing work for Building A including water supply and drainage systems.',
        status: 'In Progress',
        priority: 'High',
        assignee: 'Mike Contractor',
        assigneeId: 3,
        dueDate: '2025-02-20',
        estimatedHours: 280,
        createdAt: '2025-01-02T08:30:00Z'
    },
    {
        id: 6,
        projectId: 2,
        title: 'Window installation - All buildings',
        description: 'Install energy-efficient windows throughout the residential complex.',
        status: 'Todo',
        priority: 'Medium',
        assignee: 'Mike Contractor',
        assigneeId: 3,
        dueDate: '2025-03-15',
        estimatedHours: 200,
        createdAt: '2025-01-07T09:00:00Z'
    },
    {
        id: 7,
        projectId: 2,
        title: 'Landscaping design finalization',
        description: 'Finalize landscape design including garden areas, walkways, and water features.',
        status: 'Completed',
        priority: 'Low',
        assignee: 'Sarah Engineer',
        assigneeId: 2,
        dueDate: '2025-01-15',
        estimatedHours: 40,
        createdAt: '2024-12-20T14:00:00Z'
    },
    // Hospital Expansion Tasks
    {
        id: 8,
        projectId: 3,
        title: 'Foundation reinforcement',
        description: 'Reinforce existing foundation to support new wing structure.',
        status: 'In Progress',
        priority: 'Critical',
        assignee: 'Mike Contractor',
        assigneeId: 3,
        dueDate: '2025-02-28',
        estimatedHours: 360,
        createdAt: '2025-01-03T07:30:00Z'
    },
    {
        id: 9,
        projectId: 3,
        title: 'Temporary facilities setup',
        description: 'Set up temporary patient care facilities during construction phase.',
        status: 'Completed',
        priority: 'Critical',
        assignee: 'Sarah Engineer',
        assigneeId: 2,
        dueDate: '2024-12-30',
        estimatedHours: 120,
        createdAt: '2024-12-01T10:00:00Z'
    },
    // Shopping Mall Tasks
    {
        id: 10,
        projectId: 4,
        title: 'Food court ventilation system',
        description: 'Install commercial-grade ventilation system for the food court area.',
        status: 'In Progress',
        priority: 'High',
        assignee: 'Mike Contractor',
        assigneeId: 3,
        dueDate: '2025-02-10',
        estimatedHours: 160,
        createdAt: '2025-01-04T08:00:00Z'
    },
    {
        id: 11,
        projectId: 4,
        title: 'Parking lot lighting installation',
        description: 'Install LED lighting system throughout the underground parking facility.',
        status: 'Completed',
        priority: 'Medium',
        assignee: 'Mike Contractor',
        assigneeId: 3,
        dueDate: '2025-01-20',
        estimatedHours: 80,
        createdAt: '2024-12-15T09:30:00Z'
    },
    {
        id: 12,
        projectId: 4,
        title: 'Signage and wayfinding installation',
        description: 'Install all interior and exterior signage including digital directories.',
        status: 'Todo',
        priority: 'Medium',
        assignee: 'Sarah Engineer',
        assigneeId: 2,
        dueDate: '2025-03-01',
        estimatedHours: 60,
        createdAt: '2025-01-09T11:30:00Z'
    }
]

// Initial Materials
export const initialMaterials = [
    {
        id: 1,
        name: 'Structural Steel Beams',
        category: 'Steel',
        unit: 'tons',
        quantity: 450,
        minStock: 100,
        maxStock: 600,
        unitPrice: 1200,
        supplier: 'MetalWorks Inc.',
        projectId: 1,
        location: 'Warehouse A',
        lastUpdated: '2025-01-10T08:00:00Z',
        createdAt: '2024-01-15T08:00:00Z'
    },
    {
        id: 2,
        name: 'Ready-Mix Concrete',
        category: 'Concrete',
        unit: 'cubic yards',
        quantity: 280,
        minStock: 50,
        maxStock: 400,
        unitPrice: 150,
        supplier: 'ConcretePro Ltd.',
        projectId: 1,
        location: 'On-site Storage',
        lastUpdated: '2025-01-12T09:30:00Z',
        createdAt: '2024-01-20T10:00:00Z'
    },
    {
        id: 3,
        name: 'Glass Panels (Tempered)',
        category: 'Glass',
        unit: 'panels',
        quantity: 85,
        minStock: 100,
        maxStock: 300,
        unitPrice: 450,
        supplier: 'ClearView Glass Co.',
        projectId: 1,
        location: 'Warehouse B',
        lastUpdated: '2025-01-08T14:00:00Z',
        createdAt: '2024-03-10T11:00:00Z'
    },
    {
        id: 4,
        name: 'Copper Piping (2 inch)',
        category: 'Plumbing',
        unit: 'feet',
        quantity: 3200,
        minStock: 500,
        maxStock: 5000,
        unitPrice: 12,
        supplier: 'PlumbSupply Inc.',
        projectId: 2,
        location: 'Warehouse A',
        lastUpdated: '2025-01-11T10:00:00Z',
        createdAt: '2024-04-05T09:00:00Z'
    },
    {
        id: 5,
        name: 'Electrical Wiring (12 AWG)',
        category: 'Electrical',
        unit: 'feet',
        quantity: 8500,
        minStock: 2000,
        maxStock: 12000,
        unitPrice: 2.5,
        supplier: 'ElectroSupply Corp.',
        projectId: 2,
        location: 'Warehouse C',
        lastUpdated: '2025-01-09T15:30:00Z',
        createdAt: '2024-04-15T08:30:00Z'
    },
    {
        id: 6,
        name: 'Cement Bags (50kg)',
        category: 'Concrete',
        unit: 'bags',
        quantity: 2800,
        minStock: 500,
        maxStock: 4000,
        unitPrice: 8,
        supplier: 'BuildMart Supplies',
        projectId: 3,
        location: 'On-site Storage',
        lastUpdated: '2025-01-13T11:00:00Z',
        createdAt: '2024-06-10T07:00:00Z'
    },
    {
        id: 7,
        name: 'Medical-Grade Flooring',
        category: 'Flooring',
        unit: 'sq ft',
        quantity: 4500,
        minStock: 1000,
        maxStock: 8000,
        unitPrice: 18,
        supplier: 'HealthBuild Materials',
        projectId: 3,
        location: 'Warehouse D',
        lastUpdated: '2025-01-07T16:00:00Z',
        createdAt: '2024-07-20T10:30:00Z'
    },
    {
        id: 8,
        name: 'Aluminum Frames',
        category: 'Aluminum',
        unit: 'pieces',
        quantity: 45,
        minStock: 50,
        maxStock: 200,
        unitPrice: 280,
        supplier: 'AlumCraft Industries',
        projectId: 4,
        location: 'Warehouse B',
        lastUpdated: '2025-01-06T12:00:00Z',
        createdAt: '2024-02-28T09:00:00Z'
    },
    {
        id: 9,
        name: 'LED Light Fixtures',
        category: 'Electrical',
        unit: 'units',
        quantity: 320,
        minStock: 100,
        maxStock: 500,
        unitPrice: 85,
        supplier: 'BrightLight Solutions',
        projectId: 4,
        location: 'Warehouse C',
        lastUpdated: '2025-01-10T13:45:00Z',
        createdAt: '2024-08-15T11:00:00Z'
    },
    {
        id: 10,
        name: 'Insulation Panels',
        category: 'Insulation',
        unit: 'sq ft',
        quantity: 12000,
        minStock: 3000,
        maxStock: 20000,
        unitPrice: 4.5,
        supplier: 'ThermoShield Inc.',
        projectId: 1,
        location: 'Warehouse A',
        lastUpdated: '2025-01-14T08:30:00Z',
        createdAt: '2024-05-20T10:00:00Z'
    }
]

// Initial Budgets (Expenses)
export const initialBudgets = [
    {
        id: 1,
        projectId: 1,
        category: 'Materials',
        description: 'Structural steel purchase - Phase 1',
        amount: 2400000,
        date: '2024-02-15',
        vendor: 'MetalWorks Inc.',
        status: 'Paid',
        createdAt: '2024-02-15T10:00:00Z'
    },
    {
        id: 2,
        projectId: 1,
        category: 'Labor',
        description: 'Foundation crew - January wages',
        amount: 185000,
        date: '2024-01-31',
        vendor: 'Internal',
        status: 'Paid',
        createdAt: '2024-01-31T17:00:00Z'
    },
    {
        id: 3,
        projectId: 1,
        category: 'Equipment',
        description: 'Tower crane rental - 6 months',
        amount: 420000,
        date: '2024-03-01',
        vendor: 'HeavyLift Rentals',
        status: 'Paid',
        createdAt: '2024-03-01T09:00:00Z'
    },
    {
        id: 4,
        projectId: 1,
        category: 'Materials',
        description: 'Glass curtain wall panels',
        amount: 1850000,
        date: '2024-08-20',
        vendor: 'ClearView Glass Co.',
        status: 'Paid',
        createdAt: '2024-08-20T11:30:00Z'
    },
    {
        id: 5,
        projectId: 2,
        category: 'Materials',
        description: 'Concrete and foundation supplies',
        amount: 890000,
        date: '2024-04-10',
        vendor: 'ConcretePro Ltd.',
        status: 'Paid',
        createdAt: '2024-04-10T08:00:00Z'
    },
    {
        id: 6,
        projectId: 2,
        category: 'Labor',
        description: 'Plumbing contractors - Q3',
        amount: 245000,
        date: '2024-09-30',
        vendor: 'AquaFlow Plumbing',
        status: 'Paid',
        createdAt: '2024-09-30T16:00:00Z'
    },
    {
        id: 7,
        projectId: 2,
        category: 'Permits',
        description: 'Building permits and inspections',
        amount: 125000,
        date: '2024-03-15',
        vendor: 'City Planning Dept.',
        status: 'Paid',
        createdAt: '2024-03-15T14:00:00Z'
    },
    {
        id: 8,
        projectId: 3,
        category: 'Materials',
        description: 'Medical-grade materials procurement',
        amount: 3200000,
        date: '2024-07-01',
        vendor: 'HealthBuild Materials',
        status: 'Paid',
        createdAt: '2024-07-01T10:00:00Z'
    },
    {
        id: 9,
        projectId: 3,
        category: 'Equipment',
        description: 'Specialized construction equipment',
        amount: 780000,
        date: '2024-06-15',
        vendor: 'MediConstruct Equipment',
        status: 'Paid',
        createdAt: '2024-06-15T09:30:00Z'
    },
    {
        id: 10,
        projectId: 4,
        category: 'Materials',
        description: 'Interior finishing materials',
        amount: 1450000,
        date: '2024-11-01',
        vendor: 'RetailBuild Supplies',
        status: 'Paid',
        createdAt: '2024-11-01T11:00:00Z'
    },
    {
        id: 11,
        projectId: 4,
        category: 'Labor',
        description: 'HVAC installation team',
        amount: 320000,
        date: '2024-12-15',
        vendor: 'CoolAir Systems',
        status: 'Pending',
        createdAt: '2024-12-15T15:00:00Z'
    },
    {
        id: 12,
        projectId: 1,
        category: 'Consulting',
        description: 'Structural engineering consultation',
        amount: 175000,
        date: '2024-05-10',
        vendor: 'StructurePro Consulting',
        status: 'Paid',
        createdAt: '2024-05-10T10:30:00Z'
    }
]

// Initial Users
export const initialUsers = [
    {
        id: 1,
        name: 'John Administrator',
        email: 'admin@cmts.com',
        role: 'Admin',
        department: 'Management',
        phone: '+1 (555) 100-1001',
        avatar: 'JA',
        status: 'Active',
        joinedAt: '2023-01-15'
    },
    {
        id: 2,
        name: 'Sarah Engineer',
        email: 'sarah@cmts.com',
        role: 'Engineer',
        department: 'Engineering',
        phone: '+1 (555) 100-1002',
        avatar: 'SE',
        status: 'Active',
        joinedAt: '2023-03-20'
    },
    {
        id: 3,
        name: 'Mike Contractor',
        email: 'mike@cmts.com',
        role: 'Contractor',
        department: 'Construction',
        phone: '+1 (555) 100-1003',
        avatar: 'MC',
        status: 'Active',
        joinedAt: '2023-06-10'
    },
    {
        id: 4,
        name: 'Emily Client',
        email: 'emily@cmts.com',
        role: 'Client',
        department: 'External',
        phone: '+1 (555) 100-1004',
        avatar: 'EC',
        status: 'Active',
        joinedAt: '2024-01-05'
    },
    {
        id: 5,
        name: 'David Wilson',
        email: 'david.w@cmts.com',
        role: 'Engineer',
        department: 'Engineering',
        phone: '+1 (555) 100-1005',
        avatar: 'DW',
        status: 'Active',
        joinedAt: '2023-09-15'
    },
    {
        id: 6,
        name: 'Lisa Thompson',
        email: 'lisa.t@cmts.com',
        role: 'Contractor',
        department: 'Construction',
        phone: '+1 (555) 100-1006',
        avatar: 'LT',
        status: 'Active',
        joinedAt: '2024-02-28'
    }
]
