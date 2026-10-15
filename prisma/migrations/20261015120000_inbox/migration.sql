-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('new', 'read', 'archived');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('new', 'contacted', 'closed');

-- Rename ContactSubmission -> ContactMessage, keeping existing rows
ALTER TABLE "ContactSubmission" RENAME TO "ContactMessage";
ALTER TABLE "ContactMessage" RENAME CONSTRAINT "ContactSubmission_pkey" TO "ContactMessage_pkey";

-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "mailError" TEXT,
ADD COLUMN     "mailSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "ContactStatus" NOT NULL DEFAULT 'new',
ADD COLUMN     "subject" TEXT;

-- AlterTable
ALTER TABLE "QuoteRequest" ADD COLUMN     "city" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "mailError" TEXT,
ADD COLUMN     "mailSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "status" "QuoteStatus" NOT NULL DEFAULT 'new';

-- Rows from before this migration were already emailed by the old mailer
-- (or SMTP was off); don't flag them as failed.
UPDATE "ContactMessage" SET "mailSent" = true;
UPDATE "QuoteRequest" SET "mailSent" = true;

-- CreateIndex
CREATE INDEX "ContactMessage_status_createdAt_idx" ON "ContactMessage"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");

-- CreateIndex
CREATE INDEX "QuoteRequest_status_createdAt_idx" ON "QuoteRequest"("status", "createdAt");
