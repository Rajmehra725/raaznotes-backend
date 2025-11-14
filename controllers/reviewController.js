import Review from "../models/Review.js";
import Product from "../models/Product.js";

export const addReview = async (req, res) => {
  const { productId, comment, rating } = req.body;

  const review = await Review.create({
    product: productId,
    user: req.user.id,
    comment,
    rating
  });

  // update product average rating
  const reviews = await Review.find({ product: productId });
  const avg = reviews.reduce((a, b) => a + b.rating, 0) / reviews.length;

  await Product.findByIdAndUpdate(productId, { rating: avg });

  res.json(review);
};
