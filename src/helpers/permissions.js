// src/helpers/permissions.js - Simplified Department-Based Permission System

// Department IDs from your database
const DEPARTMENTS = {
    ADMIN: 1,
    RESTAURANT_ADMIN: 2,
    BRANCH_ADMIN: 3,
    INVENTORY_ADMIN: 4,
    CAPTAIN: 5,
    KITCHEN: 6,
    HOOKAH: 7,
    FINANCE: 8
};

// Define what each department can access
const DEPARTMENT_PERMISSIONS = {
    [DEPARTMENTS.ADMIN]: {
        // Super admin - can do everything
        users: ['create', 'read', 'update', 'delete', 'bulk_operations'],
        restaurants: ['create', 'read', 'update', 'delete'],
        tables: ['create', 'read', 'update', 'delete'],
        menu: ['create', 'read', 'update', 'delete'],
        orders: ['create', 'read', 'update', 'delete', 'approve'],
        inventory: ['create', 'read', 'update', 'delete'],
        analytics: ['read', 'export'],
        finance: ['read', 'update', 'export'],
        system: ['settings', 'logs', 'backup']
    },
    
    [DEPARTMENTS.RESTAURANT_ADMIN]: {
        // Can manage their restaurant
        users: ['create', 'read', 'update'], // Can manage restaurant staff
        restaurants: ['read', 'update'], // Can update their restaurant info
        tables: ['create', 'read', 'update', 'delete'],
        menu: ['create', 'read', 'update', 'delete'],
        orders: ['read', 'update', 'approve'],
        inventory: ['read', 'update'],
        analytics: ['read', 'export'],
        finance: ['read']
    },
    
    [DEPARTMENTS.BRANCH_ADMIN]: {
        // Similar to restaurant admin but for specific branch
        users: ['read', 'update'], // Limited user management
        restaurants: ['read'],
        tables: ['create', 'read', 'update'],
        menu: ['read', 'update'],
        orders: ['read', 'update', 'approve'],
        inventory: ['read', 'update'],
        analytics: ['read']
    },
    
    [DEPARTMENTS.INVENTORY_ADMIN]: {
        // Focused on inventory management
        inventory: ['create', 'read', 'update', 'delete'],
        menu: ['read'], // Need to see menu for inventory planning
        orders: ['read'], // Need to see orders for inventory tracking
        analytics: ['read'] // Inventory analytics
    },
    
    [DEPARTMENTS.CAPTAIN]: {
        // Restaurant floor management
        tables: ['read', 'update'], // Can see and update table status
        orders: ['create', 'read', 'update', 'approve'], // Main order management
        menu: ['read'], // Need to see menu
        customers: ['read', 'update'] // Handle customer requests
    },
    
    [DEPARTMENTS.KITCHEN]: {
        // Kitchen operations
        orders: ['read', 'update'], // Can see and update order status
        menu: ['read'], // Need to see menu items
        inventory: ['read', 'update'] // Can update inventory as items are used
    },
    
    [DEPARTMENTS.HOOKAH]: {
        // Hookah service management
        orders: ['create', 'read', 'update'], // Hookah orders
        tables: ['read'], // Need to see table info
        menu: ['read'] // Hookah menu items
    },
    
    [DEPARTMENTS.FINANCE]: {
        // Financial operations
        orders: ['read'], // Need to see orders for billing
        analytics: ['read', 'export'], // Financial reports
        finance: ['create', 'read', 'update', 'export'], // Full financial access
        invoices: ['create', 'read', 'update'],
        payments: ['create', 'read', 'update']
    }
};

/**
 * Check if user has permission for a specific action
 * @param {number} departmentId - User's department ID
 * @param {string} resource - Resource name (e.g., 'users', 'orders')
 * @param {string} action - Action name (e.g., 'create', 'read', 'update', 'delete')
 * @returns {boolean} - True if user has permission
 */
const hasPermission = (departmentId, resource, action) => {
    const permissions = DEPARTMENT_PERMISSIONS[departmentId];
    if (!permissions) return false;
    
    const resourcePermissions = permissions[resource];
    if (!resourcePermissions) return false;
    
    return resourcePermissions.includes(action);
};

/**
 * Check if user is admin (department 1)
 * @param {number} departmentId - User's department ID
 * @returns {boolean}
 */
const isAdmin = (departmentId) => {
    return departmentId === DEPARTMENTS.ADMIN;
};

/**
 * Check if user is management level (admin, restaurant admin, branch admin)
 * @param {number} departmentId - User's department ID
 * @returns {boolean}
 */
const isManagement = (departmentId) => {
    return [
        DEPARTMENTS.ADMIN,
        DEPARTMENTS.RESTAURANT_ADMIN,
        DEPARTMENTS.BRANCH_ADMIN
    ].includes(departmentId);
};

/**
 * Check if user can access financial data
 * @param {number} departmentId - User's department ID
 * @returns {boolean}
 */
const canAccessFinance = (departmentId) => {
    return [
        DEPARTMENTS.ADMIN,
        DEPARTMENTS.RESTAURANT_ADMIN,
        DEPARTMENTS.FINANCE
    ].includes(departmentId);
};

/**
 * Check if user can manage other users
 * @param {number} departmentId - User's department ID
 * @returns {boolean}
 */
const canManageUsers = (departmentId) => {
    return hasPermission(departmentId, 'users', 'create') || 
           hasPermission(departmentId, 'users', 'update') || 
           hasPermission(departmentId, 'users', 'delete');
};

/**
 * Get all permissions for a department
 * @param {number} departmentId - User's department ID
 * @returns {object} - All permissions for the department
 */
const getDepartmentPermissions = (departmentId) => {
    return DEPARTMENT_PERMISSIONS[departmentId] || {};
};

/**
 * Middleware to check department-based permissions
 * @param {string} resource - Resource name
 * @param {string} action - Action name
 * @returns {function} - Express middleware function
 */
const requirePermission = (resource, action) => {
    return async (req, res, next) => {
        try {
            const token = await getToken(req);
            const user = await verifyUserToken(token);
            
            if (!user || !user.department_id) {
                return res.status(401).json(resultObject(false, "Authentication required"));
            }
            
            if (!hasPermission(user.department_id, resource, action)) {
                return res.status(403).json(resultObject(false, "Insufficient permissions"));
            }
            
            next();
        } catch (error) {
            return res.status(401).json(resultObject(false, "Authentication failed"));
        }
    };
};

/**
 * Middleware to require admin access
 */
const requireAdmin = async (req, res, next) => {
    try {
        const token = await getToken(req);
        const user = await verifyUserToken(token);
        
        if (!user || !isAdmin(user.department_id)) {
            return res.status(403).json(resultObject(false, "Admin access required"));
        }
        
        next();
    } catch (error) {
        return res.status(401).json(resultObject(false, "Authentication failed"));
    }
};

/**
 * Middleware to require management level access
 */
const requireManagement = async (req, res, next) => {
    try {
        const token = await getToken(req);
        const user = await verifyUserToken(token);
        
        if (!user || !isManagement(user.department_id)) {
            return res.status(403).json(resultObject(false, "Management access required"));
        }
        
        next();
    } catch (error) {
        return res.status(401).json(resultObject(false, "Authentication failed"));
    }
};

module.exports = {
    DEPARTMENTS,
    DEPARTMENT_PERMISSIONS,
    hasPermission,
    isAdmin,
    isManagement,
    canAccessFinance,
    canManageUsers,
    getDepartmentPermissions,
    requirePermission,
    requireAdmin,
    requireManagement
};