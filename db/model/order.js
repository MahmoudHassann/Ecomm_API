import mongoose from "mongoose";
const ObjectID = mongoose.Schema.Types.ObjectId

const orderSchema = new mongoose.Schema({
    userID: {
        type: ObjectID,
        required: true,
        ref: 'User'
    },
    items: [{
        itemId: {
            type: ObjectID,
            ref: 'Item',
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
    address:String,
    phone:String,
    paymentMethod:{
        type:String,
        default:'Cash',
        enum:['Cash','Visa']
    },
    couponId:{
        type:ObjectID,
        ref:'Coupon'
    },
    status:{
        type:String,
        default:'placed',
        enum:['placed','received','underReview','rejected','onWay']
    },
    bill: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true
})

const orderModel = mongoose.model('Order', orderSchema)
export default orderModel