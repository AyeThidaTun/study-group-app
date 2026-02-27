const prisma = require('./prismaClient');

////////////////////////////////////////////
//// Model for Shop (Start) ///////////
////////////////////////////////////////////
module.exports.getAllProducts = function (sort, category, status) {
    const query = {};

    // Apply category filter if provided
    if (category) {
        query.where = { category: { in: category.split(',') } }; // Supports multiple categories
    }

    // Apply category filter if provided
    if (status) {
        query.where = { status: { in: status.split(',') } }; // Supports multiple statuses
    }

    // Apply sorting if specified
    if (sort === "price_asc") {
        query.orderBy = { price: 'asc' };
    } else if (sort === "price_desc") {
        query.orderBy = { price: 'desc' };
    } else if (sort === "stock_asc") {
        query.orderBy = { stock: 'asc' };
    } else if (sort === "stock_desc") {
        query.orderBy = { stock: 'desc' };
    } else if (sort === "sold_asc") {
        query.orderBy = { numberSold: 'asc' };
    } else if (sort === "sold_desc") {
        query.orderBy = { numberSold: 'desc' };
    }

    return prisma.product.findMany(query);
};


// Fetch user points based on user ID
module.exports.getUserPoints = async function (userId) {
    return prisma.user.findUnique({
        where: { userId: userId },
        select: { points: true } // Only retrieve the points field
    })
        .then(user => {
            if (!user) {
                throw new Error("User not found");
            }
            return user.points;
        })
        .catch(error => {
            console.error("Error fetching user points:", error);
            throw error;
        });
};

module.exports.processPurchase = async function (userId, productId, quantity) {
    return prisma.$transaction(async (prisma) => {
        // Fetch user points
        const user = await prisma.user.findUnique({
            where: { userId: userId },
            select: { points: true }
        });

        if (!user) throw new Error("User not found");

        // Fetch product details
        const product = await prisma.product.findUnique({
            where: { productId: productId },
            select: { price: true, stock: true, name: true }
        });

        if (!product) throw new Error("Product not found");

        const totalCost = product.price * quantity;

        // Check if the user has enough points
        if (user.points < totalCost) {
            throw new Error("Insufficient points");
        }

        // Check if there is enough stock
        if (product.stock < quantity) {
            throw new Error("Not enough stock available");
        }

        // Deduct points from the user
        const updatedUser = await prisma.user.update({
            where: { userId: userId },
            data: { points: { decrement: totalCost } },
            select: { points: true }
        });

        // Deduct stock from the product
        await prisma.product.update({
            where: { productId: productId },
            data: { stock: { decrement: quantity } }
        });

        // Record the transaction in PointsTransaction
        await prisma.pointsTransaction.create({
            data: {
                userId: userId,
                points: -totalCost, // Negative since points are spent
                type: "PURCHASE",
                description: `Purchased ${quantity}x ${product.name}`
            }
        });

        // Add the purchased items to the Inventory table
        await prisma.inventory.create({
            data: {
                userId: userId,
                productId: productId,
                quantity: quantity,
                redeemed: false // Default to not redeemed
            }
        });

        // Update number of units sold for product
        await prisma.product.update({
            where: { productId: productId },
            data: { numberSold: { increment: quantity } }
        });

        return { success: true, remainingPoints: updatedUser.points, newStock: product.stock - quantity };
    }).catch(error => {
        return { success: false, message: error.message };
    });
};
////////////////////////////////////////////
//// Model for Shop (End) /////////////
////////////////////////////////////////////

////////////////////////////////////////////
//// Model Inventory (Start) //////////
////////////////////////////////////////////
module.exports.getUserInventory = async function (userId) {
    return prisma.inventory.findMany({
        where: { userId: userId },
        include: { product: true } // Include product details
    }).catch(error => {
        console.error("Error fetching user inventory:", error);
        throw error;
    });
};

module.exports.redeemInventoryItem = async function (userId, inventoryId) {
    console.log('inventoryId', inventoryId);
    return prisma.$transaction(async (prisma) => {
        // Check if the inventory item exists and belongs to the user
        const inventoryItem = await prisma.inventory.findUnique({
            where: { inventoryId: inventoryId },
            select: { userId: true, redeemed: true }
        });

        if (!inventoryItem) {
            throw new Error("Inventory item not found");
        }

        if (inventoryItem.userId !== userId) {
            throw new Error("Unauthorized access to inventory item");
        }

        if (inventoryItem.redeemed) {
            throw new Error("Item already redeemed");
        }

        // Mark the item as redeemed
        await prisma.inventory.update({
            where: { inventoryId: inventoryId },
            data: { redeemed: true }
        });

        return { success: true };
    }).catch(error => {
        return { success: false, message: error.message };
    });
};
////////////////////////////////////////////
//// Model Inventory (End) ////////////
////////////////////////////////////////////

////////////////////////////////////////////
//// Model Admin Shop (Start) ////////////
////////////////////////////////////////////
module.exports.updateStock = async function (productId, newStock) {
    try {
        const updatedProduct = await prisma.product.update({
            where: { productId: productId },
            data: {
                stock: newStock,
                status: newStock === 0 ? "SOLD_OUT" : "IN_STOCK" // Update status based on stock count
            },
            select: { stock: true, status: true }
        });

        return { success: true, newStock: updatedProduct.stock, status: updatedProduct.status };
    } catch (error) {
        return { success: false, message: error.message };
    }
};


module.exports.createProduct = async function ({ name, description, category, price, stock, image }) {
    return prisma.product.create({
        data: {
            name,
            description,
            category,
            price: parseInt(price),
            stock: parseInt(stock),
            image
        }
    });
};
////////////////////////////////////////////
//// Model Admin Shop (End) ////////////
////////////////////////////////////////////