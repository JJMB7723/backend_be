// ============================================
// controllers/cart.js
// Purpose: Handle HTTP requests for cart operations
//
// All cart routes are protected by authMiddleware,
// so req.customer is always available (set by the middleware).
// ============================================

const cartService = require("../service/cart");

// POST /api/cart/items — Add a product to the cart
async function addItem(req, res, next) {
    try {
        // req.customer.id is set by authMiddleware after verifying the JWT token
        const customerId = req.customer.id;
        const { product_id, quantity } = req.body;

        const item = await cartService.addItemToCart(customerId, product_id, quantity);

        res.status(201).json({
            success: true,
            message: "Item added to cart successfully",
            data: item,
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/cart — Get all items in the cart
async function getCart(req, res, next) {
    try {
        const customerId = req.customer.id;

        const cartData = await cartService.getCartWithItems(customerId);

        res.status(200).json({
            success: true,
            message: "Cart retrieved successfully",
            data: cartData,
        });
    } catch (error) {
        next(error);
    }
}

// PUT /api/cart/items/:itemId — Update quantity of a cart item
async function updateItem(req, res, next) {
    try {
        const customerId = req.customer.id;
        const itemId = req.params.itemId;
        const { quantity } = req.body;

        const updatedItem = await cartService.updateItemQuantity(customerId, itemId, quantity);

        res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            data: updatedItem,
        });
    } catch (error) {
        next(error);
    }
}

// DELETE /api/cart/items/:itemId — Remove an item from the cart
async function removeItem(req, res, next) {
    try {
        const customerId = req.customer.id;
        const itemId = req.params.itemId;

        const removedItem = await cartService.removeItem(customerId, itemId);

        res.status(200).json({
            success: true,
            message: "Item removed from cart successfully",
            data: removedItem,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    addItem,
    getCart,
    updateItem,
    removeItem,
};

