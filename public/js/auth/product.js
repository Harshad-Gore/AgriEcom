document.addEventListener('DOMContentLoaded', async () => {
    const productsContainer = document.querySelector('#products-container');

    try {
        const response = await fetch('/products');
        const products = await response.json();

        productsContainer.innerHTML = '';

        products.forEach(product => {
            const productHTML = `
                <div class="product-item swiper-slide">
                    <figure>
                        <a href="#" title="${product.name}">
                            <img src="${product.banner_image_url}" alt="${product.name}" class="tab-image">
                        </a>
                    </figure>
                    <div class="d-flex flex-column text-center">
                        <h3 class="fs-6 fw-normal">${product.name}</h3>
                        <div>
                            <span class="rating">
                                ${generateStars(product.rating)}
                            </span>
                            <span>(${product.total_reviews})</span>
                        </div>
                        <div class="d-flex justify-content-center align-items-center gap-2">
                            ${product.original_price ? `<del>$${parseFloat(product.original_price).toFixed(2)}</del>` : ''}
                            <span class="text-dark fw-semibold">$${parseFloat(product.price).toFixed(2)}</span>
                            ${product.discount ? `<span class="badge border border-dark-subtle rounded-0 fw-normal px-1 fs-7 lh-1 text-body-tertiary">${product.discount}% OFF</span>` : ''}
                        </div>
                        <div class="button-area p-3 pt-0">
                            <div class="row g-1 mt-2">
                                <div class="col-3">
                                    <input type="number" name="quantity" class="form-control border-dark-subtle input-number quantity" value="1">
                                </div>
                                <div class="col-7">
                                    <a href="#" class="btn btn-primary rounded-1 p-2 fs-7 btn-cart">
                                        <svg width="18" height="18">
                                            <use xlink:href="#cart"></use>
                                        </svg> Add to Cart
                                    </a>
                                </div>
                                <div class="col-2">
                                    <a href="#" class="btn btn-outline-dark rounded-1 p-2 fs-6">
                                        <svg width="18" height="18">
                                            <use xlink:href="#heart"></use>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            productsContainer.insertAdjacentHTML('beforeend', productHTML);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
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