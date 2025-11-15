import Product from "../models/Product.js";
import slugify from "slugify";

// -----------------------------------------------
// CREATE PRODUCT
// -----------------------------------------------
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      images,
    } = req.body;

    const slug = slugify(name, { lower: true });

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      category,
      stock,
      images,
      seller: req.user._id, // FIXED
    });

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// -----------------------------------------------
// GET ALL PRODUCTS (Search + Filter + Sort + Pagination)
// -----------------------------------------------
export const getAllProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page, limit } = req.query;

    let query = { isActive: true };

    // Search
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price range FIXED (Number conversion)
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Pagination
    const currentPage = Number(page) || 1;
    const perPage = Number(limit) || 20;
    const skip = (currentPage - 1) * perPage;

    // Sorting
    let sortOption = {};
    if (sort === "price_low") sortOption.price = 1;
    if (sort === "price_high") sortOption.price = -1;
    if (sort === "newest") sortOption.createdAt = -1;
    if (sort === "rating") sortOption.rating = -1;

    const products = await Product.find(query)
      .populate("seller", "name email")
      .sort(sortOption)
      .skip(skip)
      .limit(perPage);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      total,
      page: currentPage,
      perPage,
      products,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// -----------------------------------------------
// GET SINGLE PRODUCT
// -----------------------------------------------
export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true
    }).populate("seller", "name email");

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({ success: true, product });

  } catch (err) {
    res.status(500).json({ error: "Invalid product ID" });
  }
};


// -----------------------------------------------
// UPDATE PRODUCT (Only seller can update)
// -----------------------------------------------
export const updateProduct = async (req, res) => {
  try {
    const updates = req.body;

    // Fix slug update
    if (updates.name) {
      updates.slug = slugify(updates.name, { lower: true });
    }

    // Seller check FIXED
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user._id },
      updates,
      { new: true }
    );

    if (!product)
      return res.status(403).json({ error: "Unauthorized or product not found" });

    res.json({ success: true, product });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// -----------------------------------------------
// SOFT DELETE PRODUCT (Seller hide)
// -----------------------------------------------
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user._id }, // FIXED
      { isActive: false },
      { new: true }
    );

    if (!product)
      return res.status(404).json({ error: "Product not found or unauthorized" });

    res.json({ success: true, message: "Product hidden" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// -----------------------------------------------
// ADMIN: PERMANENT DELETE PRODUCT
// -----------------------------------------------
export const adminDeleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product permanently deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
