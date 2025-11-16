import Review from "../models/Review.js";
import Product from "../models/Product.js";

// ⭐ ADD or UPDATE review
export const addOrUpdateReview = async (req, res) => {
  try {
    const { productId, comment, rating } = req.body;

    if (!productId || !comment || !rating) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1–5" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Prevent seller from reviewing own product
    if (product.seller.toString() === req.user.id) {
      return res.status(400).json({ error: "Cannot review your own product" });
    }

    let review = await Review.findOne({
      product: productId,
      user: req.user.id,
    });

    if (review) {
      review.comment = comment;
      review.rating = rating;
      await review.save();
    } else {
      review = await Review.create({
        product: productId,
        user: req.user.id,
        comment,
        rating,
      });
    }

    // Recalculate average rating
    const reviews = await Review.find({ product: productId });
    const avgRating =
      reviews.reduce((sum, r) => sum + Number(r.rating), 0) /
      (reviews.length || 1);

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      reviewsCount: reviews.length,
    });

    res.json({ success: true, review });

  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};


// ⭐ DELETE review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found or unauthorized" });
    }

    const reviews = await Review.find({ product: review.product });

    const avgRating =
      reviews.reduce((sum, r) => sum + Number(r.rating), 0) /
      (reviews.length || 1);

    await Product.findByIdAndUpdate(review.product, {
      rating: reviews.length ? avgRating : 0,
      reviewsCount: reviews.length,
    });

    res.json({ success: true, message: "Review deleted" });

  } catch (error) {
    res.status(500).json({ error: "Failed to delete review" });
  }
};


// ⭐ GET all reviews of a product
export const getReviewsOfProduct = async (req, res) => {
  const reviews = await Review.find({ product: req.params.id }).populate(
    "user",
    "name email"
  );
  res.json(reviews);
};
