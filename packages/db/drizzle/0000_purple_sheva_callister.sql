CREATE TABLE IF NOT EXISTS "emergency_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"medico_id" uuid NOT NULL,
	"code_hash" text NOT NULL,
	"usato" boolean DEFAULT false NOT NULL,
	"usato_at" timestamp with time zone,
	"usato_ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "medici" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"studio_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"cognome" text NOT NULL,
	"email" text NOT NULL,
	"telefono_primario" text NOT NULL,
	"telefono_secondario" text,
	"password_hash" text NOT NULL,
	"attivo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "medici_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "studi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"indirizzo" text,
	"telefono" text,
	"email" text,
	"attivo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"studio_id" uuid NOT NULL,
	"medico_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"cognome" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"attivo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "staff_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "staff_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"permesso" text NOT NULL,
	"granted_by" uuid,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "consent_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"paziente_id" uuid NOT NULL,
	"tipo" text NOT NULL,
	"azione" text NOT NULL,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pazienti" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"studio_id" uuid NOT NULL,
	"medico_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"cognome" text NOT NULL,
	"data_nascita" date NOT NULL,
	"codice_fiscale" text,
	"email" text NOT NULL,
	"telefono" text,
	"password_hash" text NOT NULL,
	"push_consenso" boolean DEFAULT false NOT NULL,
	"reminder_config" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"attivo" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pazienti_codice_fiscale_unique" UNIQUE("codice_fiscale"),
	CONSTRAINT "pazienti_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "slot_agenda" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"medico_id" uuid NOT NULL,
	"studio_id" uuid NOT NULL,
	"data" date NOT NULL,
	"ora_inizio" time NOT NULL,
	"ora_fine" time NOT NULL,
	"durata_min" integer DEFAULT 20 NOT NULL,
	"stato" text DEFAULT 'libero' NOT NULL,
	"locked_until" timestamp with time zone,
	"locked_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prenotazioni" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"studio_id" uuid NOT NULL,
	"paziente_id" uuid NOT NULL,
	"medico_id" uuid NOT NULL,
	"slot_id" uuid NOT NULL,
	"tipologia_visita" text NOT NULL,
	"motivo_categoria" text NOT NULL,
	"motivo_note" text,
	"stato" text DEFAULT 'confermata' NOT NULL,
	"gestita_da" uuid,
	"note_staff" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "prenotazioni_slot_id_unique" UNIQUE("slot_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "broadcast" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"studio_id" uuid NOT NULL,
	"inviato_da" uuid NOT NULL,
	"giorno_target" date NOT NULL,
	"testo" text NOT NULL,
	"canali" text[] NOT NULL,
	"n_destinatari" integer,
	"n_inviati" integer,
	"n_falliti" integer,
	"stato" text DEFAULT 'inviato' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "richieste_speciali" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"studio_id" uuid NOT NULL,
	"paziente_id" uuid NOT NULL,
	"medico_id" uuid NOT NULL,
	"tipo" text NOT NULL,
	"sottotipo" text,
	"payload" jsonb NOT NULL,
	"stato" text DEFAULT 'in_attesa' NOT NULL,
	"modalita_ritiro" text,
	"note_rifiuto" text,
	"gestita_da" uuid,
	"gestita_at" timestamp with time zone,
	"completata_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "log_notifiche" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"studio_id" uuid NOT NULL,
	"paziente_id" uuid,
	"evento" text NOT NULL,
	"canale" text NOT NULL,
	"stato" text DEFAULT 'in_coda' NOT NULL,
	"tentativi" integer DEFAULT 1 NOT NULL,
	"inviato_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "emergency_codes" ADD CONSTRAINT "emergency_codes_medico_id_medici_id_fk" FOREIGN KEY ("medico_id") REFERENCES "public"."medici"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "medici" ADD CONSTRAINT "medici_studio_id_studi_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studi"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "staff" ADD CONSTRAINT "staff_studio_id_studi_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studi"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "staff" ADD CONSTRAINT "staff_medico_id_medici_id_fk" FOREIGN KEY ("medico_id") REFERENCES "public"."medici"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "staff_permissions" ADD CONSTRAINT "staff_permissions_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "staff_permissions" ADD CONSTRAINT "staff_permissions_granted_by_medici_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."medici"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "consent_log" ADD CONSTRAINT "consent_log_paziente_id_pazienti_id_fk" FOREIGN KEY ("paziente_id") REFERENCES "public"."pazienti"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pazienti" ADD CONSTRAINT "pazienti_studio_id_studi_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studi"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pazienti" ADD CONSTRAINT "pazienti_medico_id_medici_id_fk" FOREIGN KEY ("medico_id") REFERENCES "public"."medici"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "slot_agenda" ADD CONSTRAINT "slot_agenda_medico_id_medici_id_fk" FOREIGN KEY ("medico_id") REFERENCES "public"."medici"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "slot_agenda" ADD CONSTRAINT "slot_agenda_studio_id_studi_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studi"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "slot_agenda" ADD CONSTRAINT "slot_agenda_locked_by_pazienti_id_fk" FOREIGN KEY ("locked_by") REFERENCES "public"."pazienti"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prenotazioni" ADD CONSTRAINT "prenotazioni_studio_id_studi_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studi"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prenotazioni" ADD CONSTRAINT "prenotazioni_paziente_id_pazienti_id_fk" FOREIGN KEY ("paziente_id") REFERENCES "public"."pazienti"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prenotazioni" ADD CONSTRAINT "prenotazioni_medico_id_medici_id_fk" FOREIGN KEY ("medico_id") REFERENCES "public"."medici"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prenotazioni" ADD CONSTRAINT "prenotazioni_slot_id_slot_agenda_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."slot_agenda"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "broadcast" ADD CONSTRAINT "broadcast_studio_id_studi_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studi"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "richieste_speciali" ADD CONSTRAINT "richieste_speciali_studio_id_studi_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studi"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "richieste_speciali" ADD CONSTRAINT "richieste_speciali_paziente_id_pazienti_id_fk" FOREIGN KEY ("paziente_id") REFERENCES "public"."pazienti"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "richieste_speciali" ADD CONSTRAINT "richieste_speciali_medico_id_medici_id_fk" FOREIGN KEY ("medico_id") REFERENCES "public"."medici"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "log_notifiche" ADD CONSTRAINT "log_notifiche_studio_id_studi_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studi"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "log_notifiche" ADD CONSTRAINT "log_notifiche_paziente_id_pazienti_id_fk" FOREIGN KEY ("paziente_id") REFERENCES "public"."pazienti"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
