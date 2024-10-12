import mongoose from "mongoose";
const ObjectID = mongoose.Schema.Types.ObjectId

const itemSchema = new mongoose.Schema({
    userID: {
        type: ObjectID,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    images: [
        {
          itemImageSrc: String,
          alt: String,
          title: String
        }
      ],
    imagePublicIds: [String],
    description: {
        type: String,
        required: true
    },
    category: {
        type: ObjectID,
        ref: 'Category'
    },
    subCategory: {
        type: ObjectID,
        ref: 'subCategory'
    },
    price: {
        type: Number,
        required: true,
        default:0
    },
    updatedBy: {
        type: ObjectID,
        ref: 'User'
    },
    deletedBy: {
        type: ObjectID,
        ref: 'User'
    },
    deleted: { type: Boolean, default: false },
    stock:{
        type:Number,
        default:0
    },
    soldItems:{
        type:Number,
        default:0
    },
    totalAmount:{
        type:Number,
        default:0
    },
    discount:{
        type:Number,
        default:0
    },
    finalPrice:{
        type:Number,
        default:0
    },
    colors:{
        type:[String],
    },
    sizes:{
        type:[String],
        enum:['s','m','l','xl']
    },
    brand: {
        type: ObjectID,
        ref: 'Brand'
    },
    
}, {
    timestamps: true
})

const itemModel = mongoose.model('Item', itemSchema)
export default itemModel