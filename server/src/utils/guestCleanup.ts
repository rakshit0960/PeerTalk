import { scheduleJob } from 'node-schedule';
import db from "../config/prisma";

// Function to delete inactive guest users and their data
export async function cleanupInactiveGuestUsers() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    // Find all guest users who have been created for a day
    const inactiveGuests = await db.user.findMany({
      where: {
        isGuest: true,
        createdAt: {
          lt: oneDayAgo
        }
      },
      select: {
        id: true,
        conversations: {
          select: {
            id: true
          }
        }
      }
    });

    // Get all conversation IDs involving inactive guests
    const conversationIds = inactiveGuests.flatMap(guest =>
      guest.conversations.map(conversation => conversation.id)
    );

    // Delete all messages in these conversations
    await db.message.deleteMany({
      where: {
        conversationId: {
          in: conversationIds
        }
      }
    });

    // Delete all conversations involving inactive guests
    await db.conversation.deleteMany({
      where: {
        id: {
          in: conversationIds
        }
      }
    });

    // Finally, delete the inactive guest users
    const deletedGuests = await db.user.deleteMany({
      where: {
        id: {
          in: inactiveGuests.map(guest => guest.id)
        }
      }
    });

    console.log(`Cleaned up ${deletedGuests.count} inactive guest users and their data`);
  } catch (error) {
    console.error('Error during guest cleanup:', error);
  }
}

// Schedule cleanup to run every day at 12:00 AM
export function scheduleGuestCleanup() {
  // Run every day at 12:00 AM
  scheduleJob('0 0 * * *', cleanupInactiveGuestUsers);
  console.log('Scheduled guest cleanup job');
}
