import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create({ ...req.body, seller: req.user.id });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllProducts = async (req, res) => {
  const data = await Product.find().populate("seller", "name email");
  res.json(data);
};

export const getSingleProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.json(product);
};

export const updateProduct = async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, seller: req.user.id },
    req.body,
    { new: true }
  );
  res.json(product);
};

export const deleteProduct = async (req, res) => {
  await Product.findOneAndDelete({ _id: req.params.id, seller: req.user.id });
  res.json({ message: "Product Deleted" });
};
