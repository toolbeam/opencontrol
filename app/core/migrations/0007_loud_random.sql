ALTER TABLE "usage" ALTER COLUMN "model" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "billing" ADD COLUMN "payment_method_id" varchar(255);--> statement-breakpoint
ALTER TABLE "billing" ADD COLUMN "payment_method_last4" varchar(255);