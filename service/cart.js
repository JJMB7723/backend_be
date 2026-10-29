// ============================================
// service/cart.js
// Purpose: Business logic for cart operations
//
// Key business rules:
// - Each customer has exactly one cart (created automatically if needed)
// - Adding items does NOT deduct inventory (that happens when ordering)
// - Quantities must be positive numbers
// - The same product added twice should update the quantity, not create a duplicate
// ============================================

const cartModel = require("../models/cart");
const productModel = require("../models/product");

// Get or create a cart for the logged-in customer
async function getOrCreateCart(customerId) {
    let cart = await cartModel.getCartByCustomerId(customerId);

    // If the customer doesn't have a cart yet, create one
    if (!cart) {
        cart = await cartModel.createCart(customerId);
    }

    return cart;
}

// Add a product to the cart
async function addItemToCart(customerId, productId, quantity) {
    // ---- Validate quantity ----
    if (!quantity || Number(quantity) <= 0) {
        const error = new Error("Quantity must be a positive number");
        error.statusCode = 400;
        throw error;
    }

    // ---- Check if the product exists ----
    const product = await productModel.getProductById(productId);
    if (!product) {
        const error = new Error("Product with ID " + productId + " was not found");
        error.statusCode = 404;
        throw error;
    }

    // ---- Get or create the customer's cart ----
    const cart = await getOrCreateCart(customerId);

    // ---- Check if this product is already in the cart ----
    const existingItem = await cartModel.getCartItemByCartAndProduct(cart.id, productId);

    if (existingItem) {
        // Product already in cart — update the quantity (add to existing)
        const newQuantity = existingItem.quantity + Number(quantity);
        const updatedItem = await cartModel.updateCartItemQuantity(existingItem.id, newQuantity);
        return updatedItem;
    } else {
        // Product not in cart — add it as a new item
        const newItem = await cartModel.addCartItem(cart.id, productId, Number(quantity));
        return newItem;
    }
}

// Get all items in the customer's cart with product details and total
async function getCartWithItems(customerId) {
    const cart = await getOrCreateCart(customerId);
    const items = await cartModel.getCartItems(cart.id);
    const total = await cartModel.getCartTotal(cart.id);

    return {
        cart_id: cart.id,
        items: items,
        total: Number(total),
    };
}

// Update the quantity of a specific cart item
async function updateItemQuantity(customerId, itemId, quantity) {
    // ---- Validate quantity ----
    if (!quantity || Number(quantity) <= 0) {
        const error = new Error("Quantity must be a positive number");
        error.statusCode = 400;
        throw error;
    }

    // ---- Get the customer's cart ----
    const cart = await cartModel.getCartByCustomerId(customerId);
    if (!cart) {
        const error = new Error("Cart not found");
        error.statusCode = 404;
        throw error;
    }

    // ---- Check if the item belongs to this customer's cart ----
    const item = await cartModel.getCartItemById(itemId);
    if (!item || item.cart_id !== cart.id) {
        const error = new Error("Cart item not found in your cart");
        error.statusCode = 404;
        throw error;
    }

    const updatedItem = await cartModel.updateCartItemQuantity(itemId, Number(quantity));
    return updatedItem;
}

// Remove an item from the cart
async function removeItem(customerId, itemId) {
    // ---- Get the customer's cart ----
    const cart = await cartModel.getCartByCustomerId(customerId);
    if (!cart) {
        const error = new Error("Cart not found");
        error.statusCode = 404;
        throw error;
    }

    // ---- Check if the item belongs to this customer's cart ----
    const item = await cartModel.getCartItemById(itemId);
    if (!item || item.cart_id !== cart.id) {
        const error = new Error("Cart item not found in your cart");
        error.statusCode = 404;
        throw error;
    }

    const removedItem = await cartModel.removeCartItem(itemId);
    return removedItem;
}

module.exports = {
    getOrCreateCart,
    addItemToCart,
    getCartWithItems,
    updateItemQuantity,
    removeItem,
};

