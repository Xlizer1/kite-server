const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Base Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Kite API",
            version: "1.0.0",
            description: "API documentation for the Kite System",
        },
        servers: [
            {
                url: "http://localhost:8000",
                description: "Development server",
            },
        ],
        components: {
            schemas: {}, // Will be populated from schema files
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Enter JWT Bearer token **_only_**",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/api/**/router.js", "./src/config/swagger/schemas/*.js", "./src/config/swagger/*.routes.js"], // Include schema files and route docs
};

// Generate Swagger specification
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Setup Swagger middleware
const setupSwagger = (app) => {
    // Serve Swagger UI
    app.use(
        "/swagger",
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
            explorer: true,
            customCss: ".swagger-ui .topbar { display: none }", // Hide the top bar
            customSiteTitle: "Kite API Documentation",
        })
    );

    // Serve Swagger specification as JSON
    app.get("/swagger.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
};

module.exports = {
    setupSwagger,
    swaggerSpec,
};
