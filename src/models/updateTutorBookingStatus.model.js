
const prisma = require('./prismaClient');

async function cancelExpiredBookings() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize date (avoid time mismatches)

    // Find all expired pending bookings
    const expiredBookings = await prisma.tutorBooking.findMany({
      where: {
        status: "Pending",  // Check only pending bookings
        startDate: { lte: today }, // If start date has passed
      },
    });

    if (expiredBookings.length > 0) {
      // Cancel expired bookings
      await prisma.tutorBooking.updateMany({
        where: {
          id: { in: expiredBookings.map(booking => booking.id) },
        },
        data: { status: "Cancelled" },
      });

      console.log(`${expiredBookings.length} bookings were automatically cancelled.`);
    } else {
      console.log("No expired bookings found.");
    }
  } catch (error) {
    console.error("Error cancelling expired bookings:", error);
  }
}

module.exports = { cancelExpiredBookings }; // Ensure proper export