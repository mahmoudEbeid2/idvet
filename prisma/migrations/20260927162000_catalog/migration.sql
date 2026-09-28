-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameKu" TEXT NOT NULL DEFAULT '',
    "nameAr" TEXT NOT NULL DEFAULT '',
    "nameEn" TEXT NOT NULL DEFAULT '',
    "descriptionKu" TEXT NOT NULL DEFAULT '',
    "descriptionAr" TEXT NOT NULL DEFAULT '',
    "descriptionEn" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "brand" TEXT NOT NULL DEFAULT '',
    "code" TEXT NOT NULL DEFAULT '',
    "nameKu" TEXT NOT NULL DEFAULT '',
    "nameAr" TEXT NOT NULL DEFAULT '',
    "nameEn" TEXT NOT NULL DEFAULT '',
    "summaryKu" TEXT NOT NULL DEFAULT '',
    "summaryAr" TEXT NOT NULL DEFAULT '',
    "summaryEn" TEXT NOT NULL DEFAULT '',
    "dosageFormKu" TEXT NOT NULL DEFAULT '',
    "dosageFormAr" TEXT NOT NULL DEFAULT '',
    "dosageFormEn" TEXT NOT NULL DEFAULT '',
    "packagingKu" TEXT NOT NULL DEFAULT '',
    "packagingAr" TEXT NOT NULL DEFAULT '',
    "packagingEn" TEXT NOT NULL DEFAULT '',
    "speciesKu" TEXT NOT NULL DEFAULT '',
    "speciesAr" TEXT NOT NULL DEFAULT '',
    "speciesEn" TEXT NOT NULL DEFAULT '',
    "aboutKu" TEXT NOT NULL DEFAULT '',
    "aboutAr" TEXT NOT NULL DEFAULT '',
    "aboutEn" TEXT NOT NULL DEFAULT '',
    "usageKu" TEXT NOT NULL DEFAULT '',
    "usageAr" TEXT NOT NULL DEFAULT '',
    "usageEn" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "titleKu" TEXT NOT NULL DEFAULT '',
    "titleAr" TEXT NOT NULL DEFAULT '',
    "titleEn" TEXT NOT NULL DEFAULT '',
    "issuer" TEXT NOT NULL DEFAULT '',
    "issuedOn" TEXT NOT NULL DEFAULT '',
    "path" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_sortOrder_idx" ON "Category"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_categoryId_published_sortOrder_idx" ON "Product"("categoryId", "published", "sortOrder");

-- CreateIndex
CREATE INDEX "Product_published_sortOrder_idx" ON "Product"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductImage_productId_sortOrder_idx" ON "ProductImage"("productId", "sortOrder");

-- CreateIndex
CREATE INDEX "Certificate_productId_sortOrder_idx" ON "Certificate"("productId", "sortOrder");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed the 4 existing categories (slugs, names, icons and colors from lib/content).
-- Descriptions stay empty on purpose; they are written from /admin.
INSERT INTO "Category" ("id", "slug", "nameKu", "nameAr", "nameEn", "icon", "color", "sortOrder", "updatedAt") VALUES
  ('cat_medicines', 'medicines', 'دەرمانە ڤێتێرنەرییەکان', 'أدوية بيطرية', 'Veterinary Medicines', '/assets/products/icon-medicine.svg', '#e8f3fb', 1, CURRENT_TIMESTAMP),
  ('cat_supplements', 'supplements', 'پاشکۆی خۆراک', 'مكملات علفية', 'Feed Supplements', '/assets/products/icon-supplement.svg', '#fdf1e3', 2, CURRENT_TIMESTAMP),
  ('cat_feed_additives', 'feed-additives', 'زیادکراوەکانی خۆراک', 'إضافات أعلاف', 'Feed Additives', '/assets/products/icon-feed.svg', '#eaf7ee', 3, CURRENT_TIMESTAMP),
  ('cat_poultry_care', 'poultry-care', 'چاودێری مریشک', 'رعاية الدواجن', 'Poultry Care', '/assets/products/icon-poultry.svg', '#fdecec', 4, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
