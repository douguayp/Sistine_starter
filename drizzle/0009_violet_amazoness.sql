CREATE TABLE "ai_usage_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"scan_id" text,
	"guest_id" text,
	"pass_id" text,
	"model" varchar(96) NOT NULL,
	"image_count" integer DEFAULT 0 NOT NULL,
	"image_widths" jsonb,
	"image_heights" jsonb,
	"image_size_kb_total" integer DEFAULT 0 NOT NULL,
	"detected_dish_count" integer DEFAULT 0 NOT NULL,
	"analyzed_dish_count" integer DEFAULT 0 NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"estimated_cost_usd" varchar(32),
	"success" boolean DEFAULT false NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guest_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"guest_id" text NOT NULL,
	"device_id_hash" text NOT NULL,
	"ip_hash" text,
	"user_agent" text,
	"free_scans_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passes" (
	"id" text PRIMARY KEY NOT NULL,
	"guest_id" text NOT NULL,
	"user_id" text,
	"plan" varchar(32) NOT NULL,
	"status" varchar(32) DEFAULT 'active' NOT NULL,
	"starts_at" timestamp NOT NULL,
	"expires_at" timestamp NOT NULL,
	"total_scan_credits" integer NOT NULL,
	"used_scan_credits" integer DEFAULT 0 NOT NULL,
	"recovery_code_hash" text NOT NULL,
	"provider" varchar(32) DEFAULT 'creem' NOT NULL,
	"provider_checkout_id" text,
	"provider_payment_id" text,
	"restored_count" integer DEFAULT 0 NOT NULL,
	"last_restored_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pass_devices" (
	"id" text PRIMARY KEY NOT NULL,
	"pass_id" text NOT NULL,
	"device_id_hash" text NOT NULL,
	"pass_token_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "scan_results" (
	"id" text PRIMARY KEY NOT NULL,
	"guest_id" text NOT NULL,
	"pass_id" text,
	"dietary_profile" jsonb NOT NULL,
	"structured_result" jsonb NOT NULL,
	"image_count" integer NOT NULL,
	"detected_dish_count" integer DEFAULT 0 NOT NULL,
	"analyzed_dish_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_scan_id_scan_results_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scan_results"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_pass_id_passes_id_fk" FOREIGN KEY ("pass_id") REFERENCES "public"."passes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passes" ADD CONSTRAINT "passes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pass_devices" ADD CONSTRAINT "pass_devices_pass_id_passes_id_fk" FOREIGN KEY ("pass_id") REFERENCES "public"."passes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scan_results" ADD CONSTRAINT "scan_results_pass_id_passes_id_fk" FOREIGN KEY ("pass_id") REFERENCES "public"."passes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_usage_logs_scan_id_idx" ON "ai_usage_logs" USING btree ("scan_id");--> statement-breakpoint
CREATE INDEX "ai_usage_logs_guest_id_idx" ON "ai_usage_logs" USING btree ("guest_id");--> statement-breakpoint
CREATE INDEX "ai_usage_logs_pass_id_idx" ON "ai_usage_logs" USING btree ("pass_id");--> statement-breakpoint
CREATE INDEX "guest_usage_guest_id_idx" ON "guest_usage" USING btree ("guest_id");--> statement-breakpoint
CREATE INDEX "guest_usage_device_id_hash_idx" ON "guest_usage" USING btree ("device_id_hash");--> statement-breakpoint
CREATE INDEX "passes_guest_id_idx" ON "passes" USING btree ("guest_id");--> statement-breakpoint
CREATE INDEX "passes_provider_payment_id_idx" ON "passes" USING btree ("provider_payment_id");--> statement-breakpoint
CREATE INDEX "pass_devices_pass_id_idx" ON "pass_devices" USING btree ("pass_id");--> statement-breakpoint
CREATE INDEX "pass_devices_device_id_hash_idx" ON "pass_devices" USING btree ("device_id_hash");--> statement-breakpoint
CREATE INDEX "scan_results_guest_id_idx" ON "scan_results" USING btree ("guest_id");--> statement-breakpoint
CREATE INDEX "scan_results_pass_id_idx" ON "scan_results" USING btree ("pass_id");