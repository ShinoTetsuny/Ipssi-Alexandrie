const express = require('express');
const connectDB = require('./database/bdd');
const userRoutes = require('./routes/user');
const ResgistationRoutes = require('./routes/registration');

const app = express();

app.use(express.json());
app.use('/users', userRoutes);
app.use('/', ResgistationRoutes);

connectDB();

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});