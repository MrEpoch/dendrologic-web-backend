
CREATE TABLE IF NOT EXISTS "geo_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"location" geometry(point) NOT NULL,
	"geojson" json NOT NULL,
	CONSTRAINT "geo_request_id_unique" UNIQUE("id"),
	CONSTRAINT "geo_request_name_unique" UNIQUE("name")
);
