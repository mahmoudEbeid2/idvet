
-- CreateEnum
CREATE TYPE "ReplyChannel" AS ENUM ('email', 'whatsapp');

-- CreateTable
CREATE TABLE "Reply" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT,
    "messageId" TEXT,
    "channel" "ReplyChannel" NOT NULL DEFAULT 'email',
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL,
    "sentBy" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mailSent" BOOLEAN NOT NULL DEFAULT false,
    "mailError" TEXT,

    CONSTRAINT "Reply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplyTemplate" (
    "id" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReplyTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reply_quoteId_sentAt_idx" ON "Reply"("quoteId", "sentAt");

-- CreateIndex
CREATE INDEX "Reply_messageId_sentAt_idx" ON "Reply"("messageId", "sentAt");

-- CreateIndex
CREATE INDEX "ReplyTemplate_lang_sortOrder_idx" ON "ReplyTemplate"("lang", "sortOrder");

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ContactMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- A reply belongs to exactly one quote request or contact message.
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_one_parent" CHECK (num_nonnulls("quoteId", "messageId") = 1);

-- Starter quick replies (Arabic); the team edits them in /admin/reply-templates.
INSERT INTO "ReplyTemplate" ("id", "lang", "title", "body", "sortOrder", "updatedAt") VALUES
('tpl_ar_received', 'ar', 'تم استلام طلبك',
 E'مرحباً {name}،\n\nشكراً لتواصلك مع IDVET. تم استلام طلبك، وسيتواصل معك أحد أعضاء فريقنا قريباً.\n\nمع التحية،\nفريق IDVET', 0, CURRENT_TIMESTAMP),
('tpl_ar_quote', 'ar', 'تفاصيل عرض السعر',
 E'مرحباً {name}،\n\nشكراً لاهتمامك بـ {product}. تفاصيل عرض السعر كالتالي:\n\n- السعر: \n- العبوة: \n- الكمية المتوفرة: \n- مدة التوريد: \n\nيسعدنا الرد على أي استفسار.\n\nمع التحية،\nفريق IDVET', 1, CURRENT_TIMESTAMP),
('tpl_ar_details', 'ar', 'طلب معلومات إضافية',
 E'مرحباً {name}،\n\nشكراً لتواصلك معنا. حتى نجهّز لك عرضاً مناسباً لـ {product}، نرجو تزويدنا بالكمية المطلوبة والمدينة ورقم هاتف للتواصل.\n\nمع التحية،\nفريق IDVET', 2, CURRENT_TIMESTAMP);
