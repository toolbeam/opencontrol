ALTER TABLE "aws_account" RENAME COLUMN "account_id" TO "account_number";--> statement-breakpoint
DROP INDEX "account_id";--> statement-breakpoint
CREATE UNIQUE INDEX "account_number" ON "aws_account" USING btree ("workspace_id","account_number");