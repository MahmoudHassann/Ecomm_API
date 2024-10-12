import categoryModel from "../../../db/model/category.js";
import subcategoryModel from "../../../db/model/subcategory.js";
import cloudinary from "../../../services/cloudinary.js";
import { asyncHandler } from "../../../services/errorhandling.js";
import { paginate } from "../../../services/pagination.js";


export const addsubCategory = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new Error('Image is required', { cause: 400 }));
    } else {

        //check if category exist
        const { categoryId } = req.params
        
        const category = await categoryModel.findById(categoryId);
        if (!category) {
            return next(new Error('Category ID Not Exist', { cause: 404 }));
        }
        else {
            //  Create the subcategory without the image initially
            
            const subcategory = await subcategoryModel.create({
                name: req.body.name,
                userID: req.user._id,
                categoryID:category._id
            });

            // If subcategory creation is successful, proceed to upload the image
            if (subcategory) {
                const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
                    folder: `user/category/${categoryId}`,
                });

                // Step 2: Update the subcategory with the image details
                subcategory.image = secure_url;
                subcategory.imagePublicId = public_id;
                await subcategory.save();

                return res.status(201).json({ message: 'Done', subcategory });
            } else {
                return next(new Error('Fail to add subcategory', { cause: 400 }));
            }
        }



    }
});


export const updatesubCategory = asyncHandler(async (req, res, next) => {
    const { id,categoryId } = req.params;

    // Step 1: Prepare the update object
    let updateData = { ...req.body, updatedBy: req.user._id };

    // Step 2: Check if an image file is provided
    if (req.file) {
        // Attempt to update the subcategory first without changing the image
        const subcategory = await subcategoryModel.findById(id);

        if (!subcategory) {
            return next(new Error('subcategory not found', { cause: 404 }));
        }

        // Proceed with updating the subcategory
        const updatedsubcategory = await subcategoryModel.findOneAndUpdate({_id:id,categoryID:categoryId}, updateData, { new: true });

        if (!updatedsubcategory) {
            return next(new Error('Fail to update subcategory', { cause: 400 }));
        }

        // Step 3: Upload the new image to Cloudinary if the subcategory update is successful
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `user/category/${categoryId}` });

        // Step 4: Update the subcategory with the new image details
        updatedsubcategory.image = secure_url;
        updatedsubcategory.imagePublicId = public_id;
        await updatedsubcategory.save();

        // Step 5: Delete the old image from Cloudinary if it exists
        if (subcategory.imagePublicId) {
            await cloudinary.uploader.destroy(subcategory.imagePublicId);
        }

        return res.status(200).json({ message: 'subcategory updated successfully', subcategory: updatedsubcategory });
    } else {
        // If no new image file is provided, update only the other details
        const updatedsubcategory = await subcategoryModel.findOneAndUpdate({_id:id,categoryID:categoryId}, updateData, { new: true });

        if (!updatedsubcategory) {
            return next(new Error('Fail to update subcategory', { cause: 400 }));
        }

        return res.status(200).json({ message: 'subcategory updated successfully', subcategory: updatedsubcategory });
    }
});

export const getAllsubCategories = asyncHandler(async (req, res, next) => {

    const populate = [
        {
            path: 'userID',
            select: 'name email'
        },
        {
            path: 'updatedBy',
            select: 'name email'
        },
        {
            path: 'categoryID'
        }
    ]
    const { skip, limit } = paginate({ page: req.query.page, size: req.query.size })
    const subcategory = await subcategoryModel.find().populate(populate).limit(limit).skip(skip)
    if (subcategory) {
        return res.status(201).json({ message: 'Done', subcategory });
    }
    else {
        return next(new Error('Fail to find categories', { cause: 400 }));
    }


});
export const getsubCategoryById = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const populate = [
        {
            path: 'userID',
            select: 'name email'
        },
        {
            path: 'updatedBy',
            select: 'name email'
        },
        {
            path: 'categoryID'
        }
    ]
    
    const subCategory = await subcategoryModel.findById({ _id: id }).populate(populate)
    if (subCategory) {
        return res.status(201).json({ message: 'Done', subCategory });
    }
    else {
        return next(new Error('Fail to find categories', { cause: 400 }));
    }


});

export const deleteSubcategory = asyncHandler(async (req, res, next) => {
    const { id, categoryId } = req.params; // Get subcategory ID and category ID from request parameters
  
    // Step 1: Check if the subcategory exists
    const subcategory = await subcategoryModel.findById(id);
    if (!subcategory) {
      return next(new Error("Subcategory not found", { cause: 404 }));
    }
  
    // Step 2: Check if the category exists and matches the subcategory's category ID
    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return next(new Error("Associated category not found", { cause: 404 }));
    }
  
    // Ensure that the subcategory is indeed linked to the given category
    if (subcategory.categoryID.toString() !== category._id.toString()) {
      return next(new Error("Subcategory does not belong to the specified category", { cause: 400 }));
    }
  
    try {
      // Step 3: Delete the subcategory image from Cloudinary if it exists
      if (subcategory.imagePublicId) {
        await cloudinary.uploader.destroy(subcategory.imagePublicId);
      }
  
      // Step 4: Delete the subcategory from the database
      await subcategoryModel.findByIdAndDelete(id);
  
      return res.status(200).json({ message: "Subcategory deleted successfully" });
    } catch (error) {
      return next(new Error("Failed to delete subcategory", { cause: 500 }));
    }
  });
  
