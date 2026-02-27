const prisma = require('./prismaClient');

const updateBookingStatus = async () => {
  // console.log('Updating booking statuses...');
  try {

    // real time
    const currentTime = new Date().toISOString();
    console.log('current date time: ', currentTime);

    //testing purpose
    // const today = new Date();
    // console.log('today date time: ', today);
    // today.setMinutes(today.getMinutes() + 31); // Increase minutes by 31
    // const currentTime = today.toISOString();

    // console.log('Fake test time (increased by 31 minutes):', currentTime);


    const bookingsToCancel = await prisma.booking.findMany({
      where: {
        status: 'pending',
        timeout: {
          lt: currentTime,
        },
      },
    });

    // console.log(`Found ${bookingsToCancel.length} bookings to cancel.`);

    for (const booking of bookingsToCancel) {
      await prisma.booking.update({
        where: {
          bookingId: booking.bookingId,
        },
        data: {
          status: 'cancelled',
        },
      });
      // this will be logged if the booking has been cancelled
      console.log(`Booking ID: ${booking.bookingId} has been cancelled.`);
    }
  } catch (error) {
    console.error('Error updating booking statuses:', error.message);
  }
};

module.exports = updateBookingStatus;
