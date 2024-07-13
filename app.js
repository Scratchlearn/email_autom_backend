const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./Config/db');
const cors = require('cors');
const path = require('path');

const app = express();

// Connect to MongoDB
connectDB();

// Serve static files from the React app
//app.use(express.static(path.join(__dirname, 'client/build')));



// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// Routes
app.use('/api/clients', require('./routes/client'));
app.use('/api/templates', require('./routes/template'));
app.use('/api/schedule-email', require('./routes/schedule'));
app.use('/api/smtp-settings', require('./routes/smtp'));
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'index.html'));
//   });
// Start the server
app.use('/api', require('./routes/schedule')); 


  
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
