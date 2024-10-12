import userModel from "../../../db/model/user.js"
import { asyncHandler } from "../../../services/errorhandling.js";
import { sendEmail } from "../../../services/sendemail.js";
import jwt from 'jsonwebtoken'
export const signup = asyncHandler(
    async (req, res, next) => {
        const user = await userModel.findOne({ email: req.body.email }).select("email")
        if (!user) {
            const user = new userModel(req.body)
            const savedUser = await user.save()
            const token = await user.generateAuthToken()
            const emailMSG = `Click <a href='${req.protocol}://${req.headers.host}${process.env.BASE_URL}/auth/confirmEmail/${token}'>HERE</a> To Confirm Your Account`
            sendEmail(savedUser.email, emailMSG)
            return res.status(201).send({ user, token })
        }
        else {
            return next(Error('Email Exist', { cause: 409 }))
        }
    }
)


export const confirmEmail = asyncHandler(
    async (req, res, next) => {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.updateOne({ _id: decoded._id, confirmEmail: false }, { confirmEmail: true })
        return user.modifiedCount ? res.json({ message: 'Email Confirmed' }) : next(Error('Email is In-Valid or Already Confirmed', { cause: 400 }))

    }
)



// Sign-in method
export const signin = asyncHandler(async (req, res, next) => {
    const user = await userModel.findByCredentials(req.body.email, req.body.password);

    const accessToken = await user.generateAuthToken();
    const refreshToken = await user.generateRefreshToken();

    req.session.user = { id: user._id, username: user.name, refreshToken };

    await new Promise((resolve, reject) => {
        req.session.save((err) => {
            if (err) {
                console.error('Session save error during signin:', err);
                reject(err);
            } else {
                console.log('Session saved successfully during signin');
                resolve();
            }
        });
    });
    return res.status(201).send({ user, accessToken, refreshToken });
});

//logout Methode
export const logout = asyncHandler(async (req, res, next) => {
    try {
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).json({ message: 'Logout failed' });
                }
                return res.clearCookie(process.env.SESSION_COOKIE_NAME);
            });
        } else {
            return res.status(400).json({ message: 'No active session' });
        }
    } catch (err) {
        return next(new Error("Logout failed", { cause: 500 }));
    }
});







export const logoutAll = asyncHandler(
    async (req, res, next) => {

        req.user.tokens = []
        await req.user.save()
        return res.send()

    }
)


// Refresh Token Route
export const refreshToken = asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return next(new Error("Refresh token is required", { cause: 401 }));
    }

    try {
        // Verify the refresh token
        const payload = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
        // Find the user by ID
        const user = await userModel.findById(payload._id);
        if (!user) {
            return next(new Error("User not found", { cause: 404 }));
        }

        // Check if the refresh token is valid
        const isTokenValid = user.tokens.some(tokenObj => tokenObj.token === refreshToken);
        if (!isTokenValid) {
            return next(new Error("Invalid refresh token", { cause: 401 }));
        }

        // Generate new tokens
        const newAccessToken = await user.generateAuthToken();
        const newRefreshToken = await user.generateRefreshToken();

        // Replace old refresh token with the new one
        user.tokens = user.tokens.filter(tokenObj => tokenObj.token !== refreshToken);
        user.tokens.push({ token: newRefreshToken });

        await user.save();

        // Send new tokens to the client
        return res.status(200).send({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (error) {
        return next(new Error("Invalid refresh token", { cause: 401 }));
    }
});



