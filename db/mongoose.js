import mongoose from 'mongoose'


const connectDB = async () => {
    return await mongoose.connect(process.env.MONGODB_URL).then((result) => console.log(`Connected DB`))
        .catch((err) => console.log(`Fail to Connected DB ${err}`))
}

export default connectDB