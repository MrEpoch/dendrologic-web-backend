DROP TABLE "geo_image";--> statement-breakpoint
ALTER TABLE "feature" ALTER COLUMN "geometry_coordinates" SET DATA TYPE geometry(point);--> statement-breakpoint
ALTER TABLE "feature" ADD COLUMN "images" text[] DEFAULT '{}' NOT NULL;