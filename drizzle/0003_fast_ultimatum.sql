ALTER TABLE "reset_password" DROP CONSTRAINT "reset_password_token_unique";--> statement-breakpoint
ALTER TABLE "reset_password" ALTER COLUMN "token" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reset_password" ADD COLUMN "changed_at" timestamp;