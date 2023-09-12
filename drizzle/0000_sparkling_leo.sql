CREATE TABLE IF NOT EXISTS "mind_maps" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"content" text,
	"published" boolean DEFAULT false,
	"description" text,
	"created_at" date DEFAULT now(),
	"created_by" uuid,
	"collaborators" text[],
	CONSTRAINT "mind_maps_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar,
	"username" text,
	"bio" text,
	"created_by" uuid,
	CONSTRAINT "user_profiles_username_unique" UNIQUE("username"),
	CONSTRAINT "user_profiles_created_by_unique" UNIQUE("created_by")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mind_maps" ADD CONSTRAINT "mind_maps_created_by_user_profiles_created_by_fk" FOREIGN KEY ("created_by") REFERENCES "user_profiles"("created_by") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
