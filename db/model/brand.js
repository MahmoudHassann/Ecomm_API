import mongoose from "mongoose";
const ObjectID = mongoose.Schema.Types.ObjectId

const brandSchema = new mongoose.Schema({
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
}, {
    timestamps: true
})

const brandModel = mongoose.model('Brand', brandSchema)
export default brandModel