const express = require('express');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
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

// Configure multer storage to preserve file extensions
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname); // Get the original file extension
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ storage });

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
            const farmer_id = localStorage.getItem('userId');
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
            const user_id = localStorage.getItem('userId');
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
        `;
        const [products] = await sequelize.query(query);
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.post('/api/products', upload.array('images', 5), async (req, res) => {
    const { farmer_id, name, description, price, quantity, weight, availability, shipping_info, category } = req.body;
    const files = req.files;

    try {
        // Generate unique product ID
        const product_id = uuidv4();

        // Process uploaded files
        const banner_image_url = files[0] ? `/uploads/${files[0].filename}` : null;
        const image_urls = files.map(file => `/uploads/${file.filename}`);

        // Insert product into the database
        const query = `
            INSERT INTO Products (
                product_id,
                farmer_id,
                name,
                description,
                banner_image_url,
                image_urls,
                price,
                quantity,
                weight,
                availability,
                shipping_info,
                rating,
                total_reviews,
                category
            )
            VALUES (
                :product_id,
                :farmer_id,
                :name,
                :description,
                :banner_image_url,
                :image_urls,
                :price,
                :quantity,
                :weight,
                :availability,
                :shipping_info,
                0, -- Default rating
                0, -- Default total_reviews
                :category
            )
        `;
        await sequelize.query(query, {
            replacements: {
                product_id,
                farmer_id,
                name,
                description,
                banner_image_url,
                image_urls: JSON.stringify(image_urls),
                price,
                quantity,
                weight,
                availability,
                shipping_info,
                category
            }
        });

        res.status(201).json({ message: 'Product added successfully', product_id });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Failed to add product' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT 
                product_id, farmer_id,name, description, banner_image_url, image_urls, price, quantity, weight, availability, shipping_info, rating, total_reviews, category
            FROM Products
            WHERE product_id = :id
        `;
        const [product] = await sequelize.query(query, {
            replacements: { id },
        });

        if (product.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json(product[0]);
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({ error: 'Failed to fetch product details' });
    }
});

app.get('/api/just-arrived', async (req, res) => {
    try {
        const query = `
            SELECT * FROM Products ORDER BY created_at DESC LIMIT 8;
        `;
        const [products] = await sequelize.query(query);
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching just arrived products:', error);
        res.status(500).json({ error: 'Failed to fetch just arrived products' });
    }
});

app.get('/api/farmer/:farmerId', async (req, res) => {
    try {
        const { farmerId } = req.params; // Correctly destructure farmerId from req.params
        const query = `
            SELECT * FROM farmers WHERE farmer_id = :farmerId;
        `;
        const [farmer] = await sequelize.query(query, {
            replacements: { farmerId }, // Use the correct variable
        });

        if (farmer.length === 0) {
            return res.status(404).json({ error: 'Farmer not found' });
        }

        res.status(200).json(farmer[0]); // Return the first farmer record
    } catch (error) {
        console.error('Error fetching farmer data:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/farmer/:farmerId/products', async (req, res) => {
    try {
        const { farmerId } = req.params; // Extract farmerId from the request parameters
        const query = `
            SELECT * FROM Products WHERE farmer_id = :farmerId;
        `;
        const [products] = await sequelize.query(query, {
            replacements: { farmerId }, // Use the farmerId in the query
        });

        if (products.length === 0) {
            return res.status(404).json({ error: 'No products found for this farmer' });
        }

        res.status(200).json(products); // Return the list of products
    } catch (error) {
        console.error('Error fetching farmer products:', error);
        res.status(500).json({ error: 'Failed to fetch farmer products' });
    }
});

// API endpoint to get farmer's orders
app.get('/api/farmer/:farmerId/orders', async (req, res) => {
    try {
        const { farmerId } = req.params;
        const query = `
            SELECT o.*, u.name as customer_name 
            FROM Orders o
            JOIN Users u ON o.user_id = u.user_id
            WHERE o.farmer_id = :farmerId
        `;
        const [rows] = await sequelize.query(query, {
            replacements: { farmerId },
        });
        res.json(rows);
    } catch (error) {
        console.error('Error fetching farmer orders:', error);
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to get revenue data
app.get('/api/farmer/:farmerId/revenue', async (req, res) => {
    try {
        // Assuming you have an Orders table with payment information
        const [rows] = await pool.query(
            `SELECT 
           DATE_FORMAT(order_date, '%Y-%m') as month,
           SUM(total_amount) as revenue
         FROM Orders
         WHERE farmer_id = ?
         GROUP BY month
         ORDER BY month`,
            [req.params.farmerId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to get all orders

app.get('/api/farmer/:farmerId/products-count', async (req, res) => {
    try {
        const { farmerId } = req.params;

        // Query to count the total number of products for the farmer
        const query = `
            SELECT COUNT(*) AS total_count FROM Products WHERE farmer_id = :farmerId;
        `;
        const [result] = await sequelize.query(query, {
            replacements: { farmerId },
        });

        const totalCount = result[0]?.total_count || 0; // Get the count or default to 0
        res.status(200).json({ total_count: totalCount });
    } catch (error) {
        console.error('Error fetching product count:', error);
        res.status(500).json({ error: 'Failed to fetch product count' });
    }
});

app.post('/update-farmer-location', (req, res) => {
    const { farmer_id, latitude, longitude } = req.body;
    
    // Validate required fields
    if (!farmer_id || !latitude || !longitude) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update query to set latitude and longitude for specific farmer
    const updateQuery = `
        UPDATE farmers 
        SET latitude = ?, longitude = ? 
        WHERE farmer_id = ?
    `;

    db.query(updateQuery, [latitude, longitude, farmer_id], (err, result) => {
        if (err) {
            console.error('Update error:', err);
            return res.status(500).json({ error: 'Database update failed' });
        }

        // Check if any row was actually updated
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Farmer not found' });
        }

        res.status(200).json({ 
            message: 'Location updated successfully',
            farmer_id: farmer_id
        });
    });
});

// Get all farmers (replaces old /markers endpoint)
app.get('/farmers', (req, res) => {
    const query = `
        SELECT farmer_id, name, latitude, longitude, email as url 
        FROM farmers 
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching farmers:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});

// Get all farmers with basic info
app.get('/api/farmers', async (req, res) => {
    try {
        const query = `
            SELECT 
                farmer_id, name, farm_name, farm_location, 
                profile_image_url, latitude, longitude
            FROM Farmers
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        `;
        const [farmers] = await sequelize.query(query);
        res.status(200).json(farmers);
    } catch (error) {
        console.error('Error fetching farmers:', error);
        res.status(500).json({ error: 'Failed to fetch farmers' });
    }
});
app.get('/api/farmers/:id', async (req, res) => {
    try{
        const { id } = req.params;
        const query = `
            SELECT * FROM Farmers WHERE farmer_id = :id;
        `;
        const [farmers] = await sequelize.query(query, {
            replacements: { id },
        });
        if (farmers.length === 0) {
            return res.status(404).json({ error: 'Farmer not found' });
        }
        res.status(200).json(farmers[0]);
    }catch(error){
        console.error('Error fetching farmer data:', error);
        res.status(500).json({ error: error.message });
    }
});


// Get farmer details with products
app.get('/api/farmers/:id/details', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get farmer info
        const farmerQuery = `
            SELECT 
                farmer_id, name, email, phone, farm_name, farm_location, 
                profile_image_url, farm_size, certifications, farm_products,
                bank_name, account_number, ifsc_code
            FROM Farmers
            WHERE farmer_id = :id
        `;
        
        // Get products
        const productsQuery = `
            SELECT 
                product_id, name, description, price, 
                banner_image_url, availability, category,
                quantity, weight, shipping_info
            FROM Products
            WHERE farmer_id = :id
            ORDER BY created_at DESC
        `;
        
        const [farmer] = await sequelize.query(farmerQuery, { replacements: { id } });
        const [products] = await sequelize.query(productsQuery, { replacements: { id } });
        
        if (!farmer || farmer.length === 0) {
            return res.status(404).json({ error: 'Farmer not found' });
        }
        
        // Parse certifications if they exist
        const farmerData = farmer[0];
        if (farmerData.certifications) {
            try {
                farmerData.certifications = JSON.parse(farmerData.certifications);
            } catch (e) {
                farmerData.certifications = [];
            }
        } else {
            farmerData.certifications = [];
        }
        
        res.status(200).json({
            farmer: farmerData,
            products: products.map(p => ({
                ...p,
                price: parseFloat(p.price) // Ensure price is a number
            }))
        });
    } catch (error) {
        console.error('Error fetching farmer details:', error);
        res.status(500).json({ 
            error: 'Failed to fetch farmer details',
            details: error.message 
        });
    }
});

// Create subscription order
app.post('/api/subscriptions', async (req, res) => {
    try {
        const { 
            user_id, 
            farmer_id, 
            product_id, 
            frequency, 
            delivery_days, 
            start_date, 
            quantity 
        } = req.body;
        
        const subscription_id = uuidv4();
        
        const query = `
            INSERT INTO Subscriptions (
                subscription_id, user_id, farmer_id, product_id,
                frequency, delivery_days, start_date, quantity,
                status
            ) VALUES (
                :subscription_id, :user_id, :farmer_id, :product_id,
                :frequency, :delivery_days, :start_date, :quantity,
                'active'
            )
        `;
        
        await sequelize.query(query, {
            replacements: {
                subscription_id,
                user_id,
                farmer_id,
                product_id,
                frequency,
                delivery_days: JSON.stringify(delivery_days),
                start_date,
                quantity
            }
        });
        
        res.status(201).json({ subscription_id });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: 'Failed to create subscription' });
    }
});

app.post("/create-order", async (req, res) => {
    try {
        const merchantTransactionId = "T" + Date.now();
        const { name, amount, number } = req.body;

        const data = {
            merchantId: merchant_id,
            merchantTransactionId,
            merchantUserId: "user123",
            name,
            amount: amount * 100,
            redirectUrl: 'http://localhost:3000/payment-status?id=${merchantTransactionId}',
            redirectMode: "POST",
            mobileNumber: number,
            paymentInstrument: { type: "PAY_PAGE" },
        };

        const payload = Buffer.from(JSON.stringify(data)).toString("base64");
        const checksum = crypto.createHash("sha256").update(payload + "/pg/v1/pay" + salt_key).digest("hex") + "###1";

        const response = await axios.post("https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",
            { request: payload },
            { headers: { "X-VERIFY": checksum, "Content-Type": "application/json" } }
        );

        if (response.data.success) {
            await Order.create({ transaction_id: merchantTransactionId, amount, status: "PENDING" });
            res.json({ payment_url: response.data.data.instrumentResponse.redirectInfo.url });
        } else {
            res.status(400).json({ error: "Payment initialization failed" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/api/products/farmer/:farmerId', async (req, res) => {
    const { farmerId } = req.params;
    try {
        const query = `
            SELECT * FROM Products WHERE farmer_id = :farmerId;
        `;
        const [products] = await sequelize.query(query, {
            replacements: { farmerId },
        });
        res.status(200).json(products);
    } catch(error) {
        console.error('Error fetching farmer products:', error);
        res.status(500).json({ error: 'Failed to fetch farmer products' });
    }
});

// Update product
app.put('/api/products/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const {
            name, description, price, quantity, weight,
            availability, shipping_info, category
        } = req.body;

        const query = `
            UPDATE Products SET
                name = :name,
                description = :description,
                price = :price,
                quantity = :quantity,
                weight = :weight,
                availability = :availability,
                shipping_info = :shipping_info,
                category = :category
            WHERE product_id = :productId
        `;

        await sequelize.query(query, {
            replacements: {
                productId,
                name,
                description,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                weight: parseFloat(weight),
                availability,
                shipping_info,
                category
            }
        });

        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ 
            error: 'Failed to update product',
            details: error.message
        });
    }
});