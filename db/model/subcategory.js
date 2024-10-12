import mongoose from "mongoose";
const ObjectID = mongoose.Schema.Types.ObjectId

const subcategorySchema = new mongoose.Schema({
    userID: {
        type: ObjectID,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    image: String,
    imagePublicId: String,
    updatedBy: {
        type: ObjectID,
        ref: 'User'
    },
    categoryID: {
        type: ObjectID,
        ref: 'Category'
    }
}, {
    timestamps: true
})

const subcategoryModel = mongoose.model('subCategory', subcategorySchema)
export default subcategoryModel