import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

export async function generatePresignedUrl(key: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
    return url;
  } catch (error) {
    console.error('Presigned URL error:', error);
    throw new Error('Failed to generate presigned URL');
  }
}

export async function uploadProfilePictureToS3(file: Express.Multer.File, userId: number) {
  try {
    const fileExtension = file.originalname.split('.').pop();
    const key = `profile-pictures/${userId}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);
    return key;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
}

export async function deleteFromS3(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Failed to delete file from S3');
  }
}

export async function uploadMessageImageToS3(
  file: Express.Multer.File,
  userId: number,
  conversationId: number
): Promise<string> {
  try {
    const fileExtension = file.originalname.split('.').pop();
    const key = `messages/${conversationId}/${userId}/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);
    return key;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload message image to S3');
  }
}