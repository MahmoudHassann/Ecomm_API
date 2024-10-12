import mongoose from "mongoose";
const ObjectID = mongoose.Schema.Types.ObjectId

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required'],
        unique: [true, 'email must be unique value'],
        min: [2, 'minimum length 2 char'],
        max: [20, 'max length 2 char']
    },
    createdBy: {
        type: ObjectID,
        required: [true, 'createdBy is required'],
        ref: 'User'
    },
    deletedBy: {
        type: ObjectID,
        ref: 'User'
    },
    updatedBy: {
        type: ObjectID,
        ref: 'User'
    },
    deleted: { type: Boolean, default: false },
    amount: {
        type: Number,
        min: [1, 'minimum amount 1%'],
        max: [100, 'max amount 100%'],
        required: true
    },
    usedBy: {
        type: [{
            type: ObjectID,
            ref: 'User'
        }]
    },
    expireDate: String
}, {
    timestamps: true,
})




const couponModel = mongoose.model('Coupon', couponSchema)
export default couponModel