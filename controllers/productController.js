import Product from "../models/Product.js";
import slugify from "slugify";

// --------------------------------------------------
// CREATE PRODUCT
// --------------------------------------------------
export const createProduct = async (req, res) => {
  try {
    console.log("FILES:", req.files);
    console.log("BODY:", req.body);

    // Get images from upload or body
    let imageUrls = [];

    if (req.files?.length > 0) {
      imageUrls = req.files.map(f => f.path);
    } else if (req.body.images) {
      try {
        imageUrls = JSON.parse(req.body.images);
      } catch {
        imageUrls = Array.isArray(req.body.images)
          ? req.body.images
          : [req.body.images];
      }
    }

    const slugBase = slugify(req.body.name, { lower: true });
    const slug = `${slugBase}-${Date.now()}`;

    const product = await Product.create({
      name: req.body.name,
      slug,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category || null,
      seller: req.user._id,
      images: imageUrls.slice(0, 5)
    });

    res.json({ success: true, product });
  } catch (err) {
    console.log("CREATE ERROR:", err);
    res.status(500).json({ error: "Product creation failed", details: err.message });
  }
};

// --------------------------------------------------
// UPDATE PRODUCT
// --------------------------------------------------
export const updateProduct = async (req, res) => {
  try {
    let newImages = [];
    let oldImages = [];

    if (req.files?.length > 0) {
      newImages = req.files.map(f => f.path);
    }

    if (req.body.oldImages) {
      try {
        oldImages = JSON.parse(req.body.oldImages);
      } catch {
        oldImages = Array.isArray(req.body.oldImages)
          ? req.body.oldImages
          : [req.body.oldImages];
      }
    }

    // Generate new slug only when name changed
    const slugBase = slugify(req.body.name, { lower: true });
    const newSlug = `${slugBase}-${Date.now()}`;

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        slug: newSlug,
        price: req.body.price,
        description: req.body.description,
        category: req.body.category || null,
        images: [...oldImages, ...newImages].slice(0, 5)
      },
      { new: true }
    );

    res.json({ success: true, updated });
  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ error: "Product update failed", details: err.message });
  }
};

// --------------------------------------------------
// GET ALL PRODUCTS
// --------------------------------------------------
export const getAllProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 20 } = req.query;

    let query = { isActive: true };

    if (search) query.name = { $regex: search, $options: "i" };
    if (category) query.category = category;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;

    const sortOpt = {
      price_low: { price: 1 },
      price_high: { price: -1 },
      newest: { createdAt: -1 },
      rating: { rating: -1 }
    }[sort] || {};

    const products = await Product.find(query)
      .populate("seller", "name email")
      .sort(sortOpt)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({ success: true, total, page, limit, products });
  } catch (err) {
    console.log("GET ALL PRODUCTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// --------------------------------------------------
// GET SINGLE PRODUCT
// --------------------------------------------------
export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true
    }).populate("seller", "name email");

    if (!product)
      return res.status(404).json({ error: "Product not found" });

    res.json({ success: true, product });
  } catch (err) {
    console.log("GET SINGLE ERROR:", err);
    res.status(500).json({ error: "Invalid ID" });
  }
};

// --------------------------------------------------
// SOFT DELETE
// --------------------------------------------------
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user._id },
      { isActive: false },
      { new: true }
    );

    if (!product)
      return res.status(404).json({ error: "Unauthorized or not found" });

    res.json({ success: true, message: "Product hidden" });
  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// --------------------------------------------------
// ADMIN DELETE
// --------------------------------------------------
export const adminDeleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product permanently deleted" });
  } catch (err) {
    console.log("ADMIN DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
