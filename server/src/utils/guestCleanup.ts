import { scheduleJob } from 'node-schedule';
import db from "../config/prisma";
import { deleteFromS3 } from '../services/s3.service';

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

    // First, get all messages with images in these conversations
    const messagesWithImages = await db.message.findMany({
      where: {
        conversationId: {
          in: conversationIds
        },
        image: {
          not: null
        }
      },
      select: {
        image: true
      }
    });

    // Delete all images from S3
    const imageKeys = messagesWithImages
      .map(message => message.image)
      .filter(key => key !== null);

    await Promise.all(
      imageKeys.map(async (key) => {
        try {
          await deleteFromS3(key);
          console.log(`Deleted image: ${key}`);
        } catch (error) {
          console.error(`Failed to delete image ${key}:`, error);
        }
      })
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
    console.log(`Deleted ${imageKeys.length} images from S3`);
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
