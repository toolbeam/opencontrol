CREATE TABLE "aws_account" (
	"id" varchar(30) NOT NULL,
	"workspace_id" varchar(30) NOT NULL,
	"time_created" timestamp with time zone DEFAULT now() NOT NULL,
	"time_deleted" timestamp with time zone,
	"account_id" varchar(12) NOT NULL,
	"region" varchar(32) NOT NULL,
	CONSTRAINT "aws_account_workspace_id_id_pk" PRIMARY KEY("workspace_id","id")
);
--> statement-breakpoint
ALTER TABLE "aws_account" ADD CONSTRAINT "aws_account_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "account_id" ON "aws_account" USING btree ("workspace_id","account_id");