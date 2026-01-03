ALTER TABLE "email_verifications" DROP CONSTRAINT "email_verifications_token_unique";--> statement-breakpoint
ALTER TABLE "email_verifications" ALTER COLUMN "token" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "email_verifications" ADD COLUMN "verified_at" timestamp;