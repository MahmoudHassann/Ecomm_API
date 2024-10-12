import cartModel from "../../../db/model/cart.js";
import itemModel from "../../../db/model/item.js";
import { asyncHandler } from "../../../services/errorhandling.js";




export const addToCart = asyncHandler(async (req, res, next) => {

    const Cart = await cartModel.findOne({ userID: req.user._id });


    const productIds = req.body.items.map(cartItem => cartItem.itemId); // Renamed 'product' to 'cartItem'



    // Fetch all products in one query
    const products = await itemModel.find({
        _id: { $in: productIds },
        stock: { $gte: 1 }, // Adjust as per your stock check logic
        deleted: false
    });





    // Create a map for easy lookup of fetched products
    const productMap = {};
    products.forEach(Product => {
        productMap[Product._id] = Product;
    });

    let totalBill = 0;

    if (Cart) {
        // Update existing cart
        for (const cartItem of req.body.items) { // Renamed 'product' to 'cartItem'
            const Product = productMap[cartItem.itemId];


            if (Product && Product.stock >= cartItem.quantity) {

                const existingCartItem = Cart.items.find(item => item.itemId.toString() === cartItem.itemId.toString());

                if (existingCartItem) {
                    // Update quantity if the product already exists in the cart
                    existingCartItem.quantity += cartItem.quantity;
                } else {
                    // Add new product to the cart
                    Cart.items.push({
                        itemId: cartItem.itemId,
                        name: Product.name,
                        quantity: cartItem.quantity,
                        price: Product.finalPrice
                    });
                }
            }
        }

        // Recalculate the total bill
        totalBill = Cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        // Update the cart in the database
        const result = await cartModel.findOneAndUpdate(
            { userID: req.user._id },
            { items: Cart.items, bill: totalBill },
            { new: true }
        );

        return res.status(200).json({ message: "Cart updated", result });
    } else {
        // Create a new cart with name, price, and calculate bill
        const newItems = req.body.items.map(cartItem => {
            const Product = productMap[cartItem.itemId];
            totalBill += Product.finalPrice * cartItem.quantity;
            return {
                itemId: cartItem.itemId,
                name: Product.name,
                quantity: cartItem.quantity,
                price: Product.finalPrice
            };
        });

        // Create a new cart
        const newCart = await cartModel.create({
            userID: req.user._id,
            items: newItems,
            bill: totalBill
        });

        return res.status(201).json({ message: "Cart created", newCart });
    }
});


export const getCartItems = asyncHandler(async (req, res, next) => {

    const populate = [
        {
            path: 'userID',
            select: 'name email'
        },
        {
            path: 'items.itemId',
            select: 'images stock'
        }
    ]
    const cart = await cartModel.findOne({ userID: req.user._id }).populate(populate)

    if (cart && cart.items.length > 0) {
        return res.status(201).json({ message: 'Done', cart });
    }
    else {
        return next(new Error('Fail to find Cart', { cause: 400 }));
    }

});

export const deleteItemCart = asyncHandler(async (req, res, next) => {
    const { itemID } = req.query
    
    const cart = await cartModel.findOne({ userID: req.user._id });
    
    const itemIndex = cart.items.findIndex((item) => item.itemId.toString() === itemID.toString());
    if (itemIndex > -1) {
        const item = cart.items[itemIndex];
        cart.bill -= item.quantity * item.price;
        cart.bill = Math.max(cart.bill, 0);
        cart.items.splice(itemIndex, 1);
        cart.bill = cart.items.reduce((acc, curr) => acc + curr.quantity * curr.price, 0);
        await cart.save();
        return res.status(200).json({ message: 'Done', cart });
    } else {
        return next(new Error('item not found', { cause: 404 }));
    }
})







