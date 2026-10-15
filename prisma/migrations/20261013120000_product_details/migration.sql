-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "compositionAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "compositionEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "compositionKu" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "indicationsAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "indicationsEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "indicationsKu" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "seoDescriptionAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "seoDescriptionEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "seoDescriptionKu" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "seoTitleAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "seoTitleEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "seoTitleKu" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "tagsAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "tagsEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "tagsKu" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuoteRequest_createdAt_idx" ON "QuoteRequest"("createdAt");

-- AddForeignKey
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed the Disinfectants category (the catalog filters list Medicines,
-- Supplements, Feed Additives and Disinfectants).
INSERT INTO "Category" ("id", "slug", "nameKu", "nameAr", "nameEn", "icon", "color", "sortOrder", "updatedAt") VALUES
  ('cat_disinfectants', 'disinfectants', 'دژەمیکرۆبەکان', 'مطهرات', 'Disinfectants', '/assets/products/icon-disinfectant.svg', '#e6f5f5', 5, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
