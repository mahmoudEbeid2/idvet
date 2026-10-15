-- Rename ContactSubmission -> ContactMessage, keeping existing rows
ALTER TABLE "ContactSubmission" RENAME TO "ContactMessage";
ALTER TABLE "ContactMessage" RENAME CONSTRAINT "ContactSubmission_pkey" TO "ContactMessage_pkey";

-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subject" TEXT;

-- AlterTable
ALTER TABLE "QuoteRequest" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");
