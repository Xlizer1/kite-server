/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The user ID
 *         username:
 *           type: string
 *           description: Username for login
 *         email:
 *           type: string
 *           description: User's email address
 *         first_name:
 *           type: string
 *           description: User's first name
 *         last_name:
 *           type: string
 *           description: User's last name
 *         role_id:
 *           type: integer
 *           description: ID of the user's role
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the user was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the user was last updated
 *       required:
 *         - username
 *         - email
 *         - first_name
 *         - last_name
 *         - role_id
 *     
 *     UserLogin:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: Username for login
 *         password:
 *           type: string
 *           description: User's password
 *       required:
 *         - username
 *         - password
 *     
 *     UserRegistration:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: Username for login
 *         email:
 *           type: string
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's password
 *         first_name:
 *           type: string
 *           description: User's first name
 *         last_name:
 *           type: string
 *           description: User's last name
 *         role_id:
 *           type: integer
 *           description: ID of the user's role
 *       required:
 *         - username
 *         - email
 *         - password
 *         - first_name
 *         - last_name
 *         - role_id
 */
