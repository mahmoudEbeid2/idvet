-- Quantity is optional on the quote form.
ALTER TABLE "QuoteRequest" ALTER COLUMN "quantity" DROP NOT NULL;
