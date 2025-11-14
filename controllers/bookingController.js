import Booking from "../models/Booking.js";
import Product from "../models/Product.js";

export const createBooking = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const booking = await Booking.create({
      productId,
      sellerId: product.seller,  // ✔ correct field
      buyerId: req.user._id,
      quantity
    });

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: "Booking failed" });
  }
};


export const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ buyerId: req.user._id }).populate("productId");
  res.json(bookings);
};

export const getReceivedBookings = async (req, res) => {
  const bookings = await Booking.find({ sellerId: req.user._id }).populate("productId buyerId");
  res.json(bookings);
};
