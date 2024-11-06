import { populate } from "dotenv";
import brandModel from "../../../db/model/brand.js";
import itemModel from "../../../db/model/item.js";
import subcategoryModel from "../../../db/model/subcategory.js";
import cloudinary from "../../../services/cloudinary.js";
import { asyncHandler } from "../../../services/errorhandling.js";
import { paginate } from "../../../services/pagination.js";



export const addItem = asyncHandler(async (req, res, next) => {
  const { subcategoryId, categoryID, brandId, name, totalAmount, price } = req.body;

  if (!req.files?.length) {
    return next(new Error("Images are required", { cause: 400 }));
  }

  req.body.stock = totalAmount;
  req.body.finalPrice = price - (price * ((req.body.discount || 0) / 100));

  const subCategory = await subcategoryModel.findOne({ _id: subcategoryId, categoryID });
  if (!subCategory) {
    return next(new Error('Invalid category or subcategory IDs', { cause: 404 }));
  }

  const brand = await brandModel.findById({ _id: brandId });
  if (!brand) {
    return next(new Error('Invalid brand ID', { cause: 404 }));
  }

  // At this point, all validations have passed, proceed with the image upload
  const images = [];
  const imagesIDs = [];

  try {
    for (const file of req.files) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { folder: `user/Item/${name}` });
      images.push({
        itemImageSrc: secure_url,
        alt: `Image for ${name}`,
        title: `${name} Image`
      });
      imagesIDs.push(public_id);
    }
  } catch (uploadError) {
    return next(new Error('Image upload failed', { cause: 500 }));
  }

  req.body.imagePublicIds = imagesIDs;
  req.body.images = images;
  req.body.userID = req.user._id;
  req.body.category = categoryID;
  req.body.subCategory = subcategoryId
  req.body.brand = brandId

  const Item = await itemModel.create(req.body);

  return res.status(201).json({ message: "Done", Item });
});



export const updateItem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Find the product by ID
  const product = await itemModel.findById(id);
  if (!product) {
    return next(new Error("Invalid product ID", { cause: 404 }));
  }

  // Extract required fields from the request body
  const { subcategoryId, categoryID, brandId, name, price, discount } = req.body;

  // Perform all necessary validations first

  if (req.body.totalAmount !== undefined) {
    const calcStock = req.body.totalAmount - product.soldItems;
    req.body.stock = Math.max(calcStock, 0);
  }

  if (req.body.soldItems !== undefined) {
    const newSoldItems = req.body.soldItems;

    if (newSoldItems < 0) {
      return next(new Error("Sold items cannot be negative.", { cause: 400 }));
    } else if (newSoldItems > product.totalAmount) {
      return next(new Error("Sold items cannot exceed total amount of stock.", { cause: 400 }));
    } else {
      product.soldItems = newSoldItems;
      const newStock = product.totalAmount - product.soldItems;
      req.body.stock = Math.max(newStock, 0);
    }
  }

  if (price && discount) {
    req.body.finalPrice = price - price * (discount / 100);
  } else if (price) {
    req.body.finalPrice = price - price * (product.discount / 100);
  } else if (discount) {
    req.body.finalPrice = product.price - product.price * (discount / 100);
  }

  if (subcategoryId && categoryID) {
    const subCategory = await subcategoryModel.findOne({ _id: subcategoryId, categoryID });

    if (!subCategory) {
      return next(new Error("Invalid category or subcategory IDs", { cause: 404 }));
    }
  }

  if (brandId) {
    const brand = await brandModel.findById(brandId);
    if (!brand) {
      return next(new Error("Invalid brand ID", { cause: 404 }));
    }
  }

  // All validations passed, update the product without uploading images
  req.body.updatedBy = req.user._id;
  const updatedProduct = await itemModel.findOneAndUpdate(
    { _id: id },
    req.body,
    { new: true }  // Use `new: true` to get the updated document after the update
  );

  if (!updatedProduct) {
    return next(new Error("Failed to update this product", { cause: 400 }));
  }

  // Now that the update is successful, upload new images if provided
  if (req.files?.length) {
    const images = [];
    const imagesIDs = [];

    for (const file of req.files) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        { folder: `user/Item/${name}` }
      );
      images.push(secure_url);
      imagesIDs.push(public_id);
    }

    // Save new image URLs and IDs in the updated product
    updatedProduct.images = images;
    updatedProduct.imagePublicIds = imagesIDs;

    // Delete old images after new images are successfully uploaded
    if (product.imagePublicIds && product.imagePublicIds.length > 0) {
      for (const oldImageId of product.imagePublicIds) {
        await cloudinary.uploader.destroy(oldImageId);
      }
    }

    // Save the updated product with new images
    await updatedProduct.save();
  }

  return res.status(200).json({ message: "Update successful", updatedProduct });
});


export const getItems = asyncHandler(async (req, res, next) => {
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
      path: "category",
      populate: {
        path: 'userID',
        select: 'name email'
      }
    },
    {
      path: "subCategory",
      populate: {
        path: 'userID',
        select: 'name email'
      }
    },
    {
      path: "brand",
      populate: {
        path: 'userID',
        select: 'name email'
      }
    },
  ]
  const { skip, limit } = paginate({ page: req.query.page, size: req.query.size })
  const totalCount = await itemModel.countDocuments();
  const item = await itemModel.find().populate(populate).limit(limit).skip(skip)

  if (item) {
    return res.status(201).json({ message: 'Done', item,totalCount });
  }
  else {
    return next(new Error('Fail to find items', { cause: 400 }));
  }


});
export const getItemById = asyncHandler(async (req, res, next) => {
  const {id} = req.params
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
      path: "category",
      populate: {
        path: 'userID',
        select: 'name email'
      }
    },
    {
      path: "subCategory",
      populate: {
        path: 'userID',
        select: 'name email'
      }
    },
    {
      path: "brand",
      populate: {
        path: 'userID',
        select: 'name email'
      }
    },
  ]

  const item = await itemModel.findById({_id:id}).populate(populate)

  if (item) {
    return res.status(201).json({ message: 'Done', item });
  }
  else {
    return next(new Error('Fail to find items', { cause: 400 }));
  }


});





// تعديل لسا عاوز اتاكد ان اليوزر الي بيمسح هو هو نفس اليوزر الي ضاف العنصر او الادمين لما اضيف الرولز نفس الكلام ل ديليت بتاع ال كاتجوري والساب كاتيجوري
export const deleteItem = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // Get item ID from request parameters

  // Step 1: Check if the item exists
  const item = await itemModel.findById(id);
  if (!item) {
    return next(new Error("Item not found", { cause: 404 }));
  }

  // Step 2: Validate the associated brand, category, and subcategory
  const subCategory = await subcategoryModel.findOne({ _id: item.subCategory, categoryID: item.category });
  if (!subCategory) {
    return next(new Error("Invalid category or subcategory association", { cause: 404 }));
  }

  const category = await categoryModel.findById(item.category);
  if (!category) {
    return next(new Error("Invalid category association", { cause: 404 }));
  }

  const brand = await brandModel.findById(item.brand);
  if (!brand) {
    return next(new Error("Invalid brand association", { cause: 404 }));
  }

  try {
    // Step 3: Delete the item images from Cloudinary if they exist
    if (item.imagePublicIds && item.imagePublicIds.length > 0) {
      for (const imageId of item.imagePublicIds) {
        await cloudinary.uploader.destroy(imageId);
      }
    }

    // Step 4: Delete the item from the database
    await itemModel.findByIdAndDelete(id);

    return res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    return next(new Error("Failed to delete item", { cause: 500 }));
  }
});




