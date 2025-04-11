ALTER TABLE "billing" ALTER COLUMN "balance" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "amount" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "usage" ALTER COLUMN "cost" SET DATA TYPE bigint;