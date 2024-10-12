import mongoose from "mongoose";
const ObjectID = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({
    userID: {
        type: ObjectID,
        required: true,
        unique: true,
        ref: 'User'
    },
    items: [{
        itemId: {
            type: ObjectID,
            ref: 'Item',
            unique: true,
            required: true
        },
        name: String,
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        price: Number
    }],
    bill: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true
})

const cartModel = mongoose.model('Cart', cartSchema)
export default cartModel