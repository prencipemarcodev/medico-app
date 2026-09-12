ALTER TABLE "studi" ADD COLUMN "codice_studio" text;--> statement-breakpoint
ALTER TABLE "studi" ADD CONSTRAINT "studi_codice_studio_unique" UNIQUE("codice_studio");