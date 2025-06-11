const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const { swaggerDocs } = require('./config/swagger');
const { initializeDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const app = express();
const db = initializeDatabase();

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api', authRoutes(db));
app.use('/api/profile', profileRoutes(db));

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
  console.log('Swagger documentation at http://localhost:5000/api-docs');
});