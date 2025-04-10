CREATE TABLE "payment" (
	"id" varchar(30) NOT NULL,
	"workspace_id" varchar(30) NOT NULL,
	"time_created" timestamp with time zone DEFAULT now() NOT NULL,
	"time_deleted" timestamp with time zone,
	"customer_id" varchar(255),
	"payment_id" varchar(255),
	"amount" integer NOT NULL,
	CONSTRAINT "payment_workspace_id_id_pk" PRIMARY KEY("workspace_id","id")
);
--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;