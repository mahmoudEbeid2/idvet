-- Product snapshot on quote requests: slug + a copied image, kept if the product is deleted.
ALTER TABLE "QuoteRequest" ADD COLUMN "productSlug" TEXT;
ALTER TABLE "QuoteRequest" ADD COLUMN "productImage" TEXT;

-- Existing requests: take the slug from the product while it still exists.
UPDATE "QuoteRequest" q SET "productSlug" = p."slug" FROM "Product" p WHERE q."productId" = p."id";
