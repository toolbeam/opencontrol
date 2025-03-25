CREATE TABLE "workspace" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"slug" varchar(255),
	"name" varchar(255),
	"time_created" timestamp with time zone DEFAULT now() NOT NULL,
	"time_deleted" timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX "slug" ON "workspace" USING btree ("slug");