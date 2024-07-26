const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API documentation for managing Users and Products",
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            firstname: {
              type: "string",
              example: "John",
            },
            lastname: {
              type: "string",
            },
            email: {
              type: "string",
              example: "hehe@gmail.com",
            },
            mobile: {
              type: "string",
            },
            password: {
              type: "string",
            },
            address: {
              type: "string",
              example: "123 ABC Street",
            },
            role: {
              type: "number",
              enum: [1945, 1979],
              example: 1979,
            },
          },
        },
        Product: {
          type: "object",
          properties: {
            category: {
              type: "string",
              format: "objectId",
            },
            brand: {
              type: "string",
              format: "objectId",
            },
            image: {
              type: "string",
            },
            name: {
              type: "string",
            },
            price: {
              type: "number",
            },
            quantity: {
              type: "number",
            },
            description: {
              type: "string",
            },
          },
        },
        Brand: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
          },
        },
        Category: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Users",
        description: "User management API",
      },
      {
        name: "Products",
        description: "Product management API",
      },
    ],
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./controllers/*.js", "./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
