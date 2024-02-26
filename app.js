
const express = require('express');
const mysql = require('mysql2'); // Use mysql2 instead of mysql
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');


const app = express();
const port = 3000;
// app.js

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key', // Change this to a secret key for session encryption
  resave: false,
  saveUninitialized: true,
}));

// MySQL connection configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ap9mQL162@',
    database: 'nonprofit_donation',
  });
// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('MySQL connection error: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + db.threadId);
});

// Set up routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// app.js

// ... (previous code)

app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/views/signup.html');
  });
  
  app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
  
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // Insert the user into the database
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error during user registration: ' + err.message);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      // Redirect to the login page after successful registration
      res.redirect('/login');
    });
  });
  
  app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
  });
  
  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    // Check if the user exists in the database
    const userQuery = 'SELECT * FROM users WHERE username = ?';
    db.query(userQuery, [username], async (err, results) => {
      if (err) {
        console.error('Error checking user: ' + err.message);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      if (results.length === 0) {
        // User not found
        res.status(401).send('Invalid username or password');
        return;
      }
  
      // Check the password
      const isPasswordValid = await bcrypt.compare(password, results[0].password);
  
      if (!isPasswordValid) {
        // Incorrect password
        res.status(401).send('Invalid username or password');
        return;
      }
  
      // Store user information in the session
      req.session.userId = results[0].id;
  
      // Redirect to the donation page after successful login
      res.redirect('/donation');
    });
  });
  
  // ... (rest of the code)
  

// app.js

// ... (previous code)

app.get('/donation', (req, res) => {
    // Check if the user is authenticated (logged in)
    if (!req.session.userId) {
      res.redirect('/login');
      return;
    }
  
    // Display the donation page for the authenticated user
    res.sendFile(__dirname + '/views/donation.html');
  });
  
  app.post('/donation', (req, res) => {
    // Check if the user is authenticated (logged in)
    if (!req.session.userId) {
        res.redirect('/login');
        return;
    }

    const userId = req.session.userId;
    const { category, amount } = req.body;

    // Log the donation in the database under the authenticated user and selected category
    const donationSql = 'INSERT INTO donations (user_id, category, amount) VALUES (?, ?, ?)';
    db.query(donationSql, [userId, category, amount], (err, result) => {
        if (err) {
            console.error('Error logging donation: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Redirect to the dashboard after successful donation
        res.redirect('/dashboard');
    });
});
app.post('/logout', (req, res) => {
  // Clear the session to log the user out
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout: ' + err.message);
    }
    res.redirect('/login'); // Redirect to the login page after logout
  });
});
function processDonationData(donations) {
  var data = {};
  donations.forEach(function(donation) {
    if (!data[donation.category]) {
      data[donation.category] = 0;
    }
    data[donation.category] += donation.amount;
  });
  return data;
}
 // app.js

// ... (previous code)

app.get('/dashboard', (req, res) => {
    // Check if the user is authenticated (logged in)
    if (!req.session.userId) {
      res.redirect('/login');
      return;
    }
  
    // Fetch donation history for the user from the database
    const userId = req.session.userId;
    const donationHistoryQuery = 'SELECT * FROM donations WHERE user_id = ?';
    db.query(donationHistoryQuery, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching donation history: ' + err.message);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      // Render the dashboard with donation history
      res.render('dashboard', {
        donations: results,
        processDonationData: processDonationData, // Pass the function to the template
      });
    });
  });
  
  // ... (remaining code)
  


// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
