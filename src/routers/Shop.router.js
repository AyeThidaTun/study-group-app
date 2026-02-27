const express = require('express');
const multer = require('multer');
const path = require('path');
const {
    getAllProducts,
    getUserPoints,
    processPurchase,
    getUserInventory,
    redeemInventoryItem,
    updateStock,
    createProduct, 
} = require('../models/Shop.model.js');
const jwtMiddleware = require('../middleware/jwtMiddleware');

const router = express.Router();

////////////////////////////////////////////
//// Endpoints for Shop (Start) ///////////
////////////////////////////////////////////

// Route for getting all products for the shop with optional filters
router.get('/products', (req, res, next) => {
    const { sort, categories, status } = req.query;
  
    getAllProducts(sort, categories, status)
      .then((products) => res.status(200).json(products))
      .catch(next);
  });
  

// Route for fetching user points (Requires authentication)
router.get('/user/points', jwtMiddleware.verifyToken, (req, res, next) => {
    const userId = res.locals.userId; // Extract user ID from verify token middleware
  
    getUserPoints(userId)
      .then((points) => res.status(200).json({ points }))
      .catch(next);
  });

// Route for processing a purchase
router.post('/purchase', jwtMiddleware.verifyToken, (req, res) => {
    const userId = res.locals.userId; // Extract user ID from JWT
    const { productId, quantity } = req.body;

    processPurchase(userId, productId, quantity)
        .then((result) => res.status(200).json({ success: true, message: "Purchase successful", result }))
        .catch((error) => res.status(400).json({ success: false, error: error.message }));
});
////////////////////////////////////////////
//// Endpoints for Shop (End) ///////////
////////////////////////////////////////////

////////////////////////////////////////////
//// Endpoints for Inventory (Start) ///////////
////////////////////////////////////////////

// Route for fetching user inventory (Requires authentication)
router.get('/user/inventory', jwtMiddleware.verifyToken, async (req, res, next) => {
    const userId = res.locals.userId; // Extract user ID from verify token middleware

    try {
        const inventory = await getUserInventory(userId);

        console.log('User inventory:', inventory);

        // Structure the response into redeemed and unredeemed items
        const categorizedInventory = {
            redeemed: [],
            unredeemed: []
        };

        inventory.forEach(item => {
            const formattedItem = {
                inventoryId: item.inventoryId,
                productId: item.product.productId,
                name: item.product.name,
                description: item.product.description,
                category: item.product.category,
                image: item.product.image,
                price: item.product.price,
                quantity: item.quantity,
                redeemed: item.redeemed,
                purchasedAt: item.purchasedAt
            };

            if (item.redeemed) {
                categorizedInventory.redeemed.push(formattedItem);
            } else {
                categorizedInventory.unredeemed.push(formattedItem);
            }
        });

        res.status(200).json(categorizedInventory);
    } catch (error) {
        next(error);
    }
});

// Route for redeeming an inventory item
router.post('/inventory/redeem', jwtMiddleware.verifyToken, async (req, res, next) => {
    const userId = res.locals.userId; // Extract user ID from JWT
    const { inventoryId } = req.body;

    console.log('body', req.body)
    console.log('inventoryId at router', inventoryId);

    try {
        const result = await redeemInventoryItem(userId, inventoryId);

        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message });
        }

        res.status(200).json({ success: true, message: "Item redeemed successfully" });
    } catch (error) {
        next(error);
    }
});

////////////////////////////////////////////
//// Endpoints for Inventory (End) ///////////
////////////////////////////////////////////


////////////////////////////////////////////
//// Endpoints for Admin Shop (Start) ///////////
////////////////////////////////////////////

// Add this to your existing routes
router.put('/admin/updateStock', jwtMiddleware.verifyToken, async (req, res, next) => {
    const { productId, stock } = req.body;

    if (!productId || stock === undefined) {
        return res.status(400).json({ success: false, message: "Missing productId or stock" });
    }

    if (typeof stock !== 'number' || stock < 0) {
        return res.status(400).json({ success: false, message: "Stock must be a non-negative number" });
    }

    try {
        const result = await updateStock(productId, stock);
        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message });
        }
        res.status(200).json({ success: true, message: "Stock updated successfully", newStock: result.newStock });
    } catch (error) {
        next(error);
    }
});

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public", "images"));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
    }
});

// Multer setup with 5MB file limit
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // Restrict file types to images only
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed!"), false);
        }
        cb(null, true);
    }
});

// Route to add a new product (Admin Only)
router.post('/admin/products', jwtMiddleware.verifyToken, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({ success: false, message: "Image too big! Max size is 5MB." });
            }
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        // If no file is uploaded
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Product image is required." });
        }

        next();
    });
}, async (req, res, next) => {
    try {
        const { name, description, category, price, stock } = req.body;
        const imagePath = `/images/${req.file.filename}`;

        const product = await createProduct({ name, description, category, price, stock, image: imagePath });

        res.status(201).json({ success: true, message: "Product added successfully", product });
    } catch (error) {
        next(error);
    }
});
////////////////////////////////////////////
//// Endpoints for Admin Shop (End) ///////////
//////////////////////////////////////////// 

module.exports = router;