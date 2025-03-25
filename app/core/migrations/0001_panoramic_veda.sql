CREATE TABLE "user" (
	"id" varchar(30) NOT NULL,
	"workspace_id" varchar(30) NOT NULL,
	"time_created" timestamp with time zone DEFAULT now() NOT NULL,
	"time_deleted" timestamp with time zone,
	"email" text NOT NULL,
	"name" varchar(255),
	"time_seen" timestamp with time zone,
	"color" integer,
	CONSTRAINT "user_workspace_id_id_pk" PRIMARY KEY("workspace_id","id")
);
--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_email" ON "user" USING btree ("workspace_id","email");