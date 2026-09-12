CREATE TABLE IF NOT EXISTS "staff_medici" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"medico_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "amministratori" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"cognome" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"ruolo" text DEFAULT 'admin' NOT NULL,
	"attivo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "amministratori_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "staff" ALTER COLUMN "medico_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pazienti" ALTER COLUMN "codice_fiscale" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pazienti" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pazienti" ADD COLUMN "primo_accesso" boolean DEFAULT true NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "staff_medici" ADD CONSTRAINT "staff_medici_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "staff_medici" ADD CONSTRAINT "staff_medici_medico_id_medici_id_fk" FOREIGN KEY ("medico_id") REFERENCES "public"."medici"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
