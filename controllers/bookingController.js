import Booking from "../models/Booking.js";
import Product from "../models/Product.js";

// =========================
// ✔ Create Booking
// =========================
export const createBooking = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ error: "Product ID & quantity required" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // ❌ Buyer can't book own product
    if (product.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot book your own product" });
    }

    // ❌ Product inactive
    if (!product.isActive) {
      return res.status(400).json({ error: "Product is not available" });
    }

    // ❌ Stock check
    if (quantity > product.stock) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    // ❌ Duplicate booking check
    const existing = await Booking.findOne({
      buyerId: req.user._id,
      productId,
    });

    if (existing) {
      return res.status(400).json({ error: "You already booked this product" });
    }

    const booking = await Booking.create({
      productId,
      sellerId: product.seller,
      buyerId: req.user._id,
      quantity,
    });

    // 🔥 Reduce stock
    product.stock -= quantity;
    await product.save();

    res.status(201).json({
      success: true,
      message: "Booking created",
      booking,
    });

  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ error: "Booking failed" });
  }
};


// =========================
// ✔ Get My Bookings (Buyer)
// =========================
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      buyerId: req.user._id,
    }).populate("productId", "name price images category");

    res.json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};


// =========================
// ✔ Get Received Bookings (Seller)
// =========================
export const getReceivedBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      sellerId: req.user._id,
    })
      .populate("productId", "name price images category")
      .populate("buyerId", "name email avatar");

    res.json({
      count: bookings.length,
      bookings,
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};
