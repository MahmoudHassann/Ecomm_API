import Stripe from "stripe";
import couponModel from "../../../db/model/coupon.js";
import itemModel from "../../../db/model/item.js";
import orderModel from "../../../db/model/order.js";
import { asyncHandler } from "../../../services/errorhandling.js";
import payment from "../../../services/payment.js";




export const createOrder = asyncHandler(async (req, res, next) => {
    const { items, address, phone, couponName,paymentMethod } = req.body;

    let bill = 0;
    const EditItemList = [];

    // Extract item IDs for bulk fetching
    const itemIds = items.map(item => item.itemId);

    // Fetch all items from the database in one go
    const foundItems = await itemModel.find({ _id: { $in: itemIds } });

    // Create a map to easily lookup items by ID
    const itemMap = new Map(foundItems.map(item => [item._id.toString(), item]));
    

    // Validate items and calculate the bill
    for (const item of items) {
        const checkItem = itemMap.get(item.itemId.toString());

        if (!checkItem) {
            return next(new Error(`Item with ID ${item.itemId} not found`, { cause: 404 }));
        }

        if (checkItem.stock < item.quantity) {
            return next(new Error(`Insufficient stock for item ${checkItem.name}`, { cause: 400 }));
        }

        // Add the item to the order and calculate the bill
        const savedObj = {
            itemId: checkItem._id,
            name: checkItem.name,
            quantity: item.quantity,
            price: checkItem.finalPrice,
        };
        bill += checkItem.finalPrice * item.quantity;
        EditItemList.push(savedObj);
    }

    // Check if the order contains valid items
    if (EditItemList.length === 0) {
        return next(new Error('No valid items to order', { cause: 400 }));
    }

    const orderObj = {
        items: EditItemList,
        bill: bill,
        userID: req.user._id,
        address,
        phone,
        paymentMethod
    };

    // Apply coupon if provided
    if (couponName) {
        const Coupon = await couponModel.findOne({ name: couponName, usedBy: { $nin: [req.user._id] } });

        if (!Coupon) {
            return next(new Error('Invalid or already used coupon', { cause: 404 }));
        }

        // Apply coupon discount
        orderObj.couponId = Coupon._id;
        orderObj.bill -= orderObj.bill * (Coupon.amount / 100);
        req.body.coupon = Coupon
    }

    // Create the order
    const order = await orderModel.create(orderObj);

    if (!order) {
        return next(new Error('Failed to place order, please try again', { cause: 400 }));
    }

    // Mark coupon as used by this user
    if (couponName && order.couponId) {
        await couponModel.updateOne({ _id: order.couponId }, { $addToSet: { usedBy: req.user._id } });
    }

    //payment
    if (order.paymentMethod == 'Visa') {
        const stripe = new Stripe(process.env.STRIPE_KEY)
        if (req.body.coupon) {
            const coupon = await stripe.coupons.create({ percent_off: req.body.coupon.amount, duration: 'once' })
            req.body.couponId = coupon.id

        }
        const session = await payment({
            stripe,
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: req.user.email,
            metadata: {
                orderId: order._id.toString()
            },
            cancel_url: `${process.env.CANCEL_URL}?orderId=${order._id.toString()}`,
            line_items: order.items.map(item => {
                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: item.name
                        },
                        unit_amount: item.price * 100 // convert from cent to dollar
                    },
                    quantity: item.quantity
                }
            }),
            discounts: req.body.couponId ? [{ coupon: req.body.couponId }] : []
        })
        // Return success response with order details
        return res.status(201).json({ message: 'Order placed successfully', order, session, url: session.url });
    }
    else {
        // Return success response with order details
        return res.status(201).json({ message: 'Order placed successfully', order });
    }


});









