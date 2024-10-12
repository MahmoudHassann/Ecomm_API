import jwt from 'jsonwebtoken'
import userModel from '../db/model/user.js'
import { asyncHandler } from '../services/errorhandling.js'
const auth = asyncHandler(
    async (req, res, next) => {
        try {
            const token = req.header('Authorization').replace('Bearer ', '')
            
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET)
                const user = await userModel.findOne({ _id: decoded._id })
                
                if (!user) {
                    throw new Error
                }
                req.token = token
                req.user = user
                return next()

            } catch (error) {
                return res.status(401).send({ error: error.message }); // Send the error message to the client
            }

        } catch (error) {
            return res.status(401).send({ error: "Authentication required" })
        }
    }
)
export default auth