import couponModel from "../../../db/model/coupon.js";
import { asyncHandler } from "../../../services/errorhandling.js";

export const createCoupon = asyncHandler(
    async (req, res, next) => {
        const { name } = req.body
        const coupon = await couponModel.findOne({ name })
        if (coupon) {
            return next(new Error('Duplicated name', { cause: 409 }))
        }
        req.body.createdBy = req.user._id
        const savedCoupon = await couponModel.create(req.body)
        return res.status(201).json({ message: "Done", savedCoupon })
    }
)


export const updateCoupon = asyncHandler(
    async (req, res, next) => {
        req.body.updatedBy = req.user._id
        const coupon = await couponModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
        return res.status(200).json({ message: "Done", coupon })
    }
)


export const deleteCoupon = asyncHandler(
    async (req, res, next) => {
        const coupon = await couponModel.findByIdAndUpdate(req.params.id, { deletedBy: req.user._id, deleted: true }, { new: true })
        return res.status(200).json({ message: "Done", coupon })
    }
)


export const coupons = asyncHandler(
    async (req, res, next) => {
        const { name } = req.query
        if (name) {
            const coupon = await couponModel.findOne({ name: name, deleted: false })
            if (!coupon) {
                return next(new Error('Coupon Name is In-valid', { cause: 400 }));
            }
            else {

                return res.status(200).json({ message: "Done", coupon })
            }
        }
        else {
            const coupon = await couponModel.find({ deleted: false })
            return res.status(200).json({ message: "Done", coupon })
        }

    }
)




