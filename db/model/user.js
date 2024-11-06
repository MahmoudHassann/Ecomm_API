import mongoose from "mongoose"
import validator from "validator"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid")
            }
        }
    },
    confirmEmail: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String,
        required: true,
        minLength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes("password")) {
                throw new Error("password musn\"t contain password")
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})


//Generate auth token
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "1d" })
    return token
}
// Method to generate refresh token
userSchema.methods.generateRefreshToken = async function () {
    const user = this;

    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign({ _id: user._id.toString() }, process.env.REFRESH_JWT_SECRET, { expiresIn: '7d' });

    // Save the refresh token in the user's refreshTokens array (if you want to allow multiple sessions, you can push it, otherwise replace it)
    user.tokens = user.tokens.concat({ token: refreshToken }); // Make sure the user schema has a refreshTokens field
    await user.save();

    return refreshToken;
};


//Hash plain password before saving
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {

        user.password = await bcrypt.hash(user.password, 8)
    }
    return next()
})

//login in users
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await userModel.findOne({ email })
    if (!user) {
        throw new Error('Unable to log in')
    }
    if(!user.confirmEmail)
    {
        throw new Error('Unable to log in Confirm Email First')
    }
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login Check Ur Email & password')
    }
    return user
}

const userModel = mongoose.model("User", userSchema)
export default userModel