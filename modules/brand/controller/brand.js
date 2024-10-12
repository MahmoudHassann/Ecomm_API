import brandModel from "../../../db/model/brand.js";
import cloudinary from "../../../services/cloudinary.js";
import { asyncHandler } from "../../../services/errorhandling.js";
import { paginate } from "../../../services/pagination.js";



export const addBrand = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new Error('Image is required', { cause: 400 }));
    } else {
        // Step 1: Create the brand without the image initially
        const brand = await brandModel.create({
            name: req.body.name,
            userID: req.user._id,
        });

        // If brand creation is successful, proceed to upload the image
        if (brand) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
                folder: 'user/brand',
            });

            // Step 2: Update the brand with the image details
            brand.image = secure_url;
            brand.imagePublicId = public_id;
            await brand.save();

            return res.status(201).json({ message: 'Done', brand });
        } else {
            return next(new Error('Fail to add brand', { cause: 400 }));
        }

    }
});


export const updateBrand = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Step 1: Prepare the update object
    let updateData = { ...req.body, updatedBy: req.user._id };

    // Step 2: Check if an image file is provided
    if (req.file) {
        // Attempt to update the brand first without changing the image
        const brand = await brandModel.findById(id);

        if (!brand) {
            return next(new Error('brand not found', { cause: 404 }));
        }

        // Proceed with updating the brand
        const updatedbrand = await brandModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedbrand) {
            return next(new Error('Fail to update brand', { cause: 400 }));
        }

        // Step 3: Upload the new image to Cloudinary if the brand update is successful
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: 'user/brand' });

        // Step 4: Update the brand with the new image details
        updatedbrand.image = secure_url;
        updatedbrand.imagePublicId = public_id;
        await updatedbrand.save();

        // Step 5: Delete the old image from Cloudinary if it exists
        if (brand.imagePublicId) {
            await cloudinary.uploader.destroy(brand.imagePublicId);
        }

        return res.status(200).json({ message: 'brand updated successfully', brand: updatedbrand });
    } else {
        // If no new image file is provided, update only the other details
        const updatedbrand = await brandModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedbrand) {
            return next(new Error('Fail to update brand', { cause: 400 }));
        }

        return res.status(200).json({ message: 'brand updated successfully', brand: updatedbrand });
    }
});


export const getBrands = asyncHandler(async (req, res, next) => {
    const populate = [
        {
            path: 'userID',
            select: 'name email'
        },
        {
            path: 'updatedBy',
            select: 'name email'
        }
    ]
    const { skip, limit } = paginate({ page: req.query.page, size: req.query.size })
    const brand =  await brandModel.find().populate(populate).limit(limit).skip(skip)

    if (brand) {
        return res.status(201).json({ message: 'Done', brand });
    }
    else{
        return next(new Error('Fail to find Brands', { cause: 400 }));
    }
    

});


