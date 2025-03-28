document.addEventListener('DOMContentLoaded', async () => {
    const productsContainer = document.querySelector('#products-container');

    try {
        const response = await fetch('/products');
        const products = await response.json();

        productsContainer.innerHTML = '';

        // Add CSS dynamically
        const style = document.createElement('style');
        style.textContent = `
            .product-item {
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                transition: all 0.3s ease;
                height: 100%;
                display: flex;
                flex-direction: column;
                border: 1px solid #f0f0f0;
            }
            
            .product-item:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(0,0,0,0.12);
            }
            
            .product-item figure {
                margin: 0;
                position: relative;
                padding-top: 100%;
                overflow: hidden;
                background: #f9f9f9;
            }
            
            .product-item img {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: contain;
                padding: 15px;
                transition: transform 0.5s ease;
            }
            
            .product-item:hover img {
                transform: scale(1.03);
            }
            
            .product-content {
                padding: 16px;
                flex-grow: 1;
                display: flex;
                flex-direction: column;
            }
            
            .product-title {
                font-size: 15px;
                margin: 0 0 8px;
                color: #333;
                font-weight: 500;
                line-height: 1.3;
                min-height: 38px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            
            .product-rating {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
                margin-bottom: 8px;
            }
            
            .rating-stars {
                color: #FFB800;
                font-size: 14px;
            }
            
            .rating-count {
                color: #666;
                font-size: 13px;
            }
            
            .product-pricing {
                margin: 8px 0 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .original-price {
                color: #999;
                font-size: 14px;
            }
            
            .current-price {
                color: #222;
                font-size: 18px;
                font-weight: 600;
            }
            
            .discount-badge {
                background: linear-gradient(135deg, #FF416C, #FF4B2B);
                color: white;
                border: none;
                padding: 3px 8px;
                font-size: 11px;
                border-radius: 4px;
                font-weight: 500;
            }
            
            .product-actions {
                margin-top: auto;
                padding: 0 16px 16px;
            }
            
            .quantity-input {
                height: 40px;
                text-align: center;
                border: 1px solid #e0e0e0;
                border-radius: 6px;
                width: 100%;
            }
            
            .add-to-cart {
                background: linear-gradient(135deg, #4361ee, #3a0ca3);
                border: none;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                border-radius: 6px;
                transition: all 0.3s ease;
                color: white;
                text-decoration: none;
                font-size: 14px;
                width: 100%;
            }
            
            .add-to-cart:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
            }
            
            .wishlist-btn {
                height: 40px;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                border: 1px solid #e0e0e0;
                color: #666;
                transition: all 0.3s ease;
                background: white;
                cursor: pointer;
            }
            
            .wishlist-btn:hover {
                background-color: #f8f9fa;
                border-color: #d0d0d0;
                color: #f72585;
            }
            
            .action-grid {
                display: grid;
                grid-template-columns: 60px 1fr 40px;
                gap: 8px;
            }
        `;
        document.head.appendChild(style);

        products.forEach(product => {
            const productHTML = `
                <div class="product-item swiper-slide">
                    <figure>
                        <a href="product_details.html?product_id=${product.product_id}" title="${product.name}">
                            <img src="${product.banner_image_url}" alt="${product.name}" class="tab-image">
                        </a>
                    </figure>
                    <div class="product-content">
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-rating">
                            <span class="rating-stars">
                                ${generateStars(product.rating)}
                            </span>
                            <span class="rating-count">(${product.total_reviews})</span>
                        </div>
                        <div class="product-pricing">
                            ${product.original_price ? `<del class="original-price">₹${parseFloat(product.original_price).toFixed(2)}</del>` : ''}
                            <span class="current-price">₹${parseFloat(product.price).toFixed(2)}</span>
                            ${product.discount ? `<span class="discount-badge">${product.discount}% OFF</span>` : ''}
                        </div>
                        <div class="product-actions">
                            <div class="action-grid">
                                <input type="number" name="quantity" class="quantity-input" value="1" min="1">
                                <a href="cart.html?product_id=${product.product_id}" class="add-to-cart">
                                    <svg width="18" height="18" fill="currentColor">
                                        <use xlink:href="#cart"></use>
                                    </svg>
                                </a>
                                <button class="wishlist-btn">
                                    <svg width="18" height="18" fill="currentColor">
                                        <use xlink:href="#heart"></use>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            productsContainer.insertAdjacentHTML('beforeend', productHTML);
        });

        // Add event listeners for wishlist buttons
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                this.classList.toggle('active');
                const svg = this.querySelector('svg use');
                if (this.classList.contains('active')) {
                    svg.setAttribute('xlink:href', '#heart-filled');
                    this.style.color = '#f72585';
                } else {
                    svg.setAttribute('xlink:href', '#heart');
                    this.style.color = '#666';
                }
            });
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        productsContainer.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 2rem; color: #666;">
                <p>Unable to load products at this time. Please try again later.</p>
            </div>
        `;
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const allProductsContainer = document.querySelector('#all-products-container');
    
    // Add dynamic CSS
    const style = document.createElement('style');
    style.textContent = `
        .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 2rem;
            padding: 1rem;
        }
        
        .product-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            border: none;
        }
        
        .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        .product-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            background: #f9f9f9;
        }
        
        .product-body {
            padding: 1.25rem;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
        }
        
        .product-title {
            font-size: 1rem;
            font-weight: 500;
            margin-bottom: 0.5rem;
            color: #212121;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            min-height: 3em;
        }
        
        .product-price {
            font-weight: 600;
            color: #2e7d32;
            margin: 0.5rem 0;
            font-size: 1.1rem;
        }
        
        .product-rating {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            margin-bottom: 0.75rem;
        }
        
        .review-count {
            font-size: 0.8rem;
            color: #757575;
            margin-left: 0.25rem;
        }
        
        .product-description {
            font-size: 0.875rem;
            color: #757575;
            margin-bottom: 1rem;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            flex-grow: 1;
        }
        
        .product-actions {
            margin-top: auto;
        }
        
        .btn-view {
            width: 100%;
            background: #2e7d32;
            border: none;
            padding: 0.5rem;
            font-weight: 500;
            transition: all 0.3s ease;
            color: white;
            border-radius: 6px;
            text-decoration: none;
            text-align: center;
            font-size: 0.9rem;
        }
        
        .btn-view:hover {
            background: #005005;
            color: white;
        }
        
        .star {
            width: 18px;
            height: 18px;
        }
        
        .star-full {
            fill: #FFB800;
        }
        
        .star-empty {
            fill: #e0e0e0;
        }
        
        .loading {
            display: flex;
            justify-content: center;
            padding: 2rem;
            grid-column: 1 / -1;
        }
        
        .spinner {
            width: 3rem;
            height: 3rem;
            border: 0.25rem solid rgba(0, 0, 0, 0.1);
            border-left-color: #2e7d32;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .empty-state {
            text-align: center;
            padding: 3rem;
            grid-column: 1 / -1;
        }
    `;
    document.head.appendChild(style);

    try {
        // Show loading state
        allProductsContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
            </div>
        `;

        const response = await fetch('/products');
        const products = await response.json();

        // Clear container and set up grid
        allProductsContainer.innerHTML = '';
        allProductsContainer.classList.add('product-grid');

        if (products.length === 0) {
            allProductsContainer.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="#9e9e9e">
                        <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
                    </svg>
                    <h3>No products found</h3>
                    <p>We couldn't find any products to display</p>
                </div>
            `;
            return;
        }

        // Loop through products and create grid items
        products.forEach(product => {
            const productHTML = `
                <div class="product-card">
                    <img src="${product.banner_image_url}" class="product-image" alt="${product.name}">
                    <div class="product-body">
                        <h5 class="product-title">${product.name}</h5>
                        <div class="product-price">₹${parseFloat(product.price).toFixed(2)}</div>
                        <div class="product-rating">
                            ${generateStars(product.rating)}
                            <span class="review-count">(${product.total_reviews || 0})</span>
                        </div>
                        <p class="product-description">${product.description ? product.description.substring(0, 60) + '...' : 'No description available'}</p>
                        <div class="product-actions">
                            <a href="product_details.html?product_id=${product.product_id}" class="btn-view">View Details</a>
                        </div>
                    </div>
                </div>
            `;
            allProductsContainer.insertAdjacentHTML('beforeend', productHTML);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        allProductsContainer.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="#9e9e9e">
                    <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                </svg>
                <h3>Error loading products</h3>
                <p>Please try again later</p>
            </div>
        `;
    }
});

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return `
        ${'<svg class="star star-full" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>'.repeat(fullStars)}
        ${halfStar ? '<svg class="star star-full" viewBox="0 0 24 24"><path d="M12 15.4V6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>' : ''}
        ${'<svg class="star star-empty" viewBox="0 0 24 24"><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>'.repeat(emptyStars)}
    `;
}

document.getElementById('add-product-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const result = await response.json();
            alert('Product added successfully!');
            e.target.reset();
        } else {
            const error = await response.json();
            alert(`Error: ${error.error}`);
        }
    } catch (err) {
        console.error('Error submitting form:', err);
        alert('Failed to add product.');
    }
});

function generateStars(rating) {
    const fullStars = Math.floor(rating); // Number of full stars
    const halfStar = rating % 1 >= 0.5 ? 1 : 0; // Check if there's a half star
    const emptyStars = 5 - fullStars - halfStar; // Remaining empty stars

    return `
        ${'<svg width="18" height="18" class="text-warning"><use xlink:href="#star-full"></use></svg>'.repeat(fullStars)}
        ${halfStar ? '<svg width="18" height="18" class="text-warning"><use xlink:href="#star-half"></use></svg>' : ''}
        ${'<svg width="18" height="18" class="text-muted"><use xlink:href="#star-empty"></use></svg>'.repeat(emptyStars)}
    `;
}


const multer = require('multer');

const upload = multer({ dest: path.join(__dirname, 'public', 'uploads') });

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

document.addEventListener('DOMContentLoaded', async () => {
    const justArrivedContainer = document.querySelector('#just-arrived-container');

    try {
        const response = await fetch('/api/just-arrived');
        const products = await response.json();

        justArrivedContainer.innerHTML = '';

        products.forEach(product => {
            const productHTML = `
                <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                    <div class="card h-100">
                        <img src="${product.banner_image_url}" class="card-img-top" alt="${product.name}">
                        <div class="card-body text-center">
                            <h5 class="card-title fs-6">${product.name}</h5>
                            <p class="card-text text-muted">₹${parseFloat(product.price).toFixed(2)}</p>
                            <div class="rating mb-2">
                                ${generateStars(product.rating)}
                                <span class="text-muted">(${product.total_reviews} reviews)</span>
                            </div>
                            <p class="card-text text-muted">${product.description.substring(0, 50)}...</p>
                            <a href="product_details.html?product_id=${product.product_id}" class="btn btn-primary btn-sm">View Details</a>
                        </div>
                    </div>
                </div>
            `;
            justArrivedContainer.insertAdjacentHTML('beforeend', productHTML);
        });
    } catch (error) {
        console.error('Error fetching just arrived products:', error);
    }
});

