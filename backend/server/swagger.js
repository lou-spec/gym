const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Gym Workout Planner API',
            version: '1.0.0',
            description: 'API documentation for the Gym Workout Planner application',
        },
        servers: [
            {
                url: 'https://gym-pwa-three.vercel.app/api',
                description: 'Production server',
            },
            {
                url: 'http://localhost:3000/api',
                description: 'Local server',
            },

        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'token',
                },
            },
        },
        security: [
            {
                cookieAuth: [],
            },
        ],
    },

    apis: ['./server/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
