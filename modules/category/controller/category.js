import categoryModel from "../../../db/model/category.js";
import subcategoryModel from "../../../db/model/subcategory.js";
import cloudinary from "../../../services/cloudinary.js";
import { asyncHandler } from "../../../services/errorhandling.js";
import { paginate } from "../../../services/pagination.js";


export const addCategory = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new Error('Image is required', { cause: 400 }));
    } else {
        // Step 1: Create the category without the image initially
        const category = await categoryModel.create({
            name: req.body.name,
            userID: req.user._id,
        });

        // If category creation is successful, proceed to upload the image
        if (category) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
                folder: 'user/category',
            });

            // Step 2: Update the category with the image details
            category.image = secure_url;
            category.imagePublicId = public_id;
            await category.save();

            return res.status(201).json({ message: 'Done', category });
        } else {
            return next(new Error('Fail to add category', { cause: 400 }));
        }

    }
});


export const updateCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Step 1: Prepare the update object
    let updateData = { ...req.body, updatedBy: req.user._id };

    // Step 2: Check if an image file is provided
    if (req.file) {
        // Attempt to update the category first without changing the image
        const category = await categoryModel.findById(id);

        if (!category) {
            return next(new Error('Category not found', { cause: 404 }));
        }

        // Proceed with updating the category
        const updatedCategory = await categoryModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedCategory) {
            return next(new Error('Fail to update category', { cause: 400 }));
        }

        // Step 3: Upload the new image to Cloudinary if the category update is successful
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: 'user/category' });

        // Step 4: Update the category with the new image details
        updatedCategory.image = secure_url;
        updatedCategory.imagePublicId = public_id;
        await updatedCategory.save();

        // Step 5: Delete the old image from Cloudinary if it exists
        if (category.imagePublicId) {
            await cloudinary.uploader.destroy(category.imagePublicId);
        }

        return res.status(200).json({ message: 'Category updated successfully', category: updatedCategory });
    } else {
        // If no new image file is provided, update only the other details
        const updatedCategory = await categoryModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedCategory) {
            return next(new Error('Fail to update category', { cause: 400 }));
        }

        return res.status(200).json({ message: 'Category updated successfully', category: updatedCategory });
    }
});

export const getAllCategories = asyncHandler(async (req, res, next) => {
    const categories = []
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
    const cursor =  categoryModel.find().populate(populate).limit(limit).skip(skip).cursor()

    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
        const covObj = doc.toObject()
        const subCategories = await subcategoryModel.find({categoryID:covObj._id})
        covObj.subcategoriesList = subCategories
        categories.push(covObj)
    }
    if (categories) {
        return res.status(201).json({ message: 'Done', categories });
    }
    else{
        return next(new Error('Fail to find categories', { cause: 400 }));
    }
    

});
export const getCategoryById = asyncHandler(async (req, res, next) => {
    const {id} =req.params
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

    const category = await categoryModel.findById({_id:id}).populate(populate)
    if (category) {
        return res.status(201).json({ message: 'Done', category });
    }
    else{
        return next(new Error('Fail to find categories', { cause: 400 }));
    }
    

});

export const deleteCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
  
    // Step 1: Check if the category exists
    const category = await categoryModel.findById(id);
    if (!category) {
      return next(new Error("Category not found", { cause: 404 }));
    }
  
    // Step 2: Check if there are any associated subcategories
    const subcategories = await subcategoryModel.find({ categoryID: id });
    if (subcategories.length > 0) {
      return next(new Error("Cannot delete category with associated subcategories", { cause: 400 }));
    }
  
    try {
      // Step 3: Delete the category image from Cloudinary if it exists
      if (category.imagePublicId) {
        await cloudinary.uploader.destroy(category.imagePublicId);
      }
  
      // Step 4: Delete the category from the database
      await categoryModel.findByIdAndDelete(id);
  
      return res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      return next(new Error("Failed to delete category", { cause: 500 }));
    }
  });
  
