/**
 * Helper functions to generate Swagger documentation for routes
 */

/**
 * Generate standard GET endpoint documentation
 * @param {string} path - API path (e.g., "/api/users")
 * @param {string} summary - Short summary of the endpoint
 * @param {string} description - Detailed description
 * @param {string} tag - Swagger tag for grouping
 * @param {string} responseSchema - Reference to response schema (e.g., "User")
 * @param {Array} parameters - Additional parameters (optional)
 * @returns {string} JSDoc comment for the endpoint
 */
const getEndpoint = (path, summary, description, tag, responseSchema, parameters = []) => {
  const paramDocs = parameters.length > 0 
    ? `*     parameters:\n${parameters.map(p => `*       - ${p}`).join('\n')}\n` 
    : '';
  
  return `/**
 * @swagger
 * ${path}:
 *   get:
 *     summary: ${summary}
 *     description: ${description}
 *     tags: [${tag}]
${paramDocs}*     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/${responseSchema}'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */`;
};

/**
 * Generate standard POST endpoint documentation
 * @param {string} path - API path (e.g., "/api/users")
 * @param {string} summary - Short summary of the endpoint
 * @param {string} description - Detailed description
 * @param {string} tag - Swagger tag for grouping
 * @param {string} requestSchema - Reference to request schema (e.g., "UserCreate")
 * @param {string} responseSchema - Reference to response schema (e.g., "User")
 * @param {Array} parameters - Additional parameters (optional)
 * @returns {string} JSDoc comment for the endpoint
 */
const postEndpoint = (path, summary, description, tag, requestSchema, responseSchema, parameters = []) => {
  const paramDocs = parameters.length > 0 
    ? `*     parameters:\n${parameters.map(p => `*       - ${p}`).join('\n')}\n` 
    : '';
  
  return `/**
 * @swagger
 * ${path}:
 *   post:
 *     summary: ${summary}
 *     description: ${description}
 *     tags: [${tag}]
${paramDocs}*     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/${requestSchema}'
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/${responseSchema}'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */`;
};

/**
 * Generate standard PUT endpoint documentation
 * @param {string} path - API path (e.g., "/api/users/{id}")
 * @param {string} summary - Short summary of the endpoint
 * @param {string} description - Detailed description
 * @param {string} tag - Swagger tag for grouping
 * @param {string} requestSchema - Reference to request schema (e.g., "UserUpdate")
 * @param {string} responseSchema - Reference to response schema (e.g., "User")
 * @param {Array} parameters - Additional parameters (should include path parameters)
 * @returns {string} JSDoc comment for the endpoint
 */
const putEndpoint = (path, summary, description, tag, requestSchema, responseSchema, parameters = []) => {
  const paramDocs = parameters.length > 0 
    ? `*     parameters:\n${parameters.map(p => `*       - ${p}`).join('\n')}\n` 
    : '';
  
  return `/**
 * @swagger
 * ${path}:
 *   put:
 *     summary: ${summary}
 *     description: ${description}
 *     tags: [${tag}]
${paramDocs}*     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/${requestSchema}'
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/${responseSchema}'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */`;
};

/**
 * Generate standard DELETE endpoint documentation
 * @param {string} path - API path (e.g., "/api/users/{id}")
 * @param {string} summary - Short summary of the endpoint
 * @param {string} description - Detailed description
 * @param {string} tag - Swagger tag for grouping
 * @param {Array} parameters - Additional parameters (should include path parameters)
 * @returns {string} JSDoc comment for the endpoint
 */
const deleteEndpoint = (path, summary, description, tag, parameters = []) => {
  const paramDocs = parameters.length > 0 
    ? `*     parameters:\n${parameters.map(p => `*       - ${p}`).join('\n')}\n` 
    : '';
  
  return `/**
 * @swagger
 * ${path}:
 *   delete:
 *     summary: ${summary}
 *     description: ${description}
 *     tags: [${tag}]
${paramDocs}*     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */`;
};

/**
 * Generate standard parameter documentation for path parameters
 * @param {string} name - Parameter name
 * @param {string} description - Parameter description
 * @param {string} type - Parameter type (e.g., "integer", "string")
 * @returns {string} Parameter documentation
 */
const pathParam = (name, description, type = "string") => {
  return `in: path
 *         name: ${name}
 *         required: true
 *         schema:
 *           type: ${type}
 *         description: ${description}`;
};

/**
 * Generate standard parameter documentation for query parameters
 * @param {string} name - Parameter name
 * @param {string} description - Parameter description
 * @param {string} type - Parameter type (e.g., "integer", "string")
 * @param {boolean} required - Whether the parameter is required
 * @param {*} defaultValue - Default value for the parameter
 * @returns {string} Parameter documentation
 */
const queryParam = (name, description, type = "string", required = false, defaultValue = undefined) => {
  let param = `in: query
 *         name: ${name}
 *         schema:
 *           type: ${type}`;
  
  if (defaultValue !== undefined) {
    param += `
 *           default: ${defaultValue}`;
  }
  
  param += `
 *         required: ${required}
 *         description: ${description}`;
  
  return param;
};

/**
 * Generate tag documentation
 * @param {string} name - Tag name
 * @param {string} description - Tag description
 * @returns {string} Tag documentation
 */
const tagDoc = (name, description) => {
  return `/**
 * @swagger
 * tags:
 *   name: ${name}
 *   description: ${description}
 */`;
};

module.exports = {
  getEndpoint,
  postEndpoint,
  putEndpoint,
  deleteEndpoint,
  pathParam,
  queryParam,
  tagDoc
};
