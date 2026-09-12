CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attore_id" uuid,
	"attore_email" text,
	"ruolo" text,
	"azione" text NOT NULL,
	"entita" text,
	"entita_id" text,
	"dettagli" jsonb,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
