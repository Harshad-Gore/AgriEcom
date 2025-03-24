const express = require('express');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MySQL
const sequelize = new Sequelize('agritechecom', 'root', 'Harsh@2004', {
    host: 'localhost',
    dialect: 'mysql',
});

// Test the connection
sequelize.authenticate()
    .then(() => console.log('Connected to MySQL'))
    .catch(err => console.error('Unable to connect to MySQL:', err));

app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => {
    console.log('Server is listening on http://localhost:3000');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Sync models with the database
sequelize.sync();

// Signup API endpoint
app.post('/api/signup', async (req, res) => {
    const { name, email, phone, role, farm_name, farm_location, farm_size, certifications, farm_products, bank_name, account_number, ifsc_code, aadhar_number, pan_number, address } = req.body;

    try {
        if (role === 'farmer') {
            // Ensure certifications is valid JSON
            const certificationsJson = Array.isArray(certifications) ? JSON.stringify(certifications) : JSON.stringify([certifications]);

            // Insert into Farmers table using raw SQL
            const query = `
                INSERT INTO Farmers 
                (farmer_id, name, email, phone, role, farm_name, farm_location, farm_size, certifications, farm_products, bank_name, account_number, ifsc_code, aadhar_number, pan_number, address)
                VALUES 
                (:farmer_id, :name, :email, :phone, :role, :farm_name, :farm_location, :farm_size, :certifications, :farm_products, :bank_name, :account_number, :ifsc_code, :aadhar_number, :pan_number, :address)
            `;
            const farmer_id = uuidv4(); // Generate a unique ID for the farmer
            await sequelize.query(query, {
                replacements: {
                    farmer_id,
                    name,
                    email,
                    phone,
                    role,
                    farm_name,
                    farm_location,
                    farm_size,
                    certifications: certificationsJson, 
                    farm_products,
                    bank_name,
                    account_number,
                    ifsc_code,
                    aadhar_number,
                    pan_number,
                    address
                }
            });
            res.status(201).json({ message: 'Farmer registered successfully', farmer_id });
        } else if (role === 'consumer') {
            // Insert into Users table using raw SQL
            const query = `
                INSERT INTO Users 
                (user_id, name, email, phone, address, role)
                VALUES 
                (:user_id, :name, :email, :phone, :address, :role)
            `;
            const user_id = uuidv4();
            await sequelize.query(query, {
                replacements: {
                    user_id,
                    name,
                    email,
                    phone,
                    address,
                    role
                }
            });
            res.status(201).json({ message: 'User registered successfully', user_id });
        } else {
            res.status(400).json({ error: 'Invalid role' });
        }
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

app.get('/products', async (req, res) => {
    try {
        const query = `
            SELECT 
                product_id, name, description, banner_image_url, price, rating, total_reviews 
            FROM Products
            ORDER BY created_at DESC
            LIMIT 10
        `;
        const [products] = await sequelize.query(query);
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});