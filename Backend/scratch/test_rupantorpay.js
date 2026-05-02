
import dotenv from "dotenv";
dotenv.config();

const testPayment = async () => {
  const apiKey = "1KmmNvxbt9z6hiPXACkkfj9mNdEQg8TDQzXaTP5FVDHV2AFuPp";
  const url = "https://payment.rupantorpay.com/api/payment/checkout";
  
  const payload = {
    amount: "10",
    success_url: "http://localhost:5173/success",
    cancel_url: "http://localhost:5173/cancel",
    webhook_url: "http://localhost:5000/api/equipment/bookings/verify",
    fullname: "Test User",
    email: "test@example.com",
    sandbox: 1,
    metadata: {
      bookingId: "test_booking_id",
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
        "X-CLIENT": "localhost",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err.message);
  }
};

testPayment();
