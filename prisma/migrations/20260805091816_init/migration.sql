-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('New', 'Read', 'Replied', 'Archived');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('Draft', 'Published', 'Cancelled', 'Completed');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('Pending', 'Confirmed', 'Cancelled', 'Completed');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Pending', 'Paid', 'Failed', 'Refunded');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SuperAdmin', 'Admin', 'Editor');

-- CreateTable
CREATE TABLE "admin_users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'Editor',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ContactStatus" NOT NULL DEFAULT 'New',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cover_image" TEXT,
    "venue" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "registration_required" BOOLEAN NOT NULL DEFAULT true,
    "registration_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "registration_deadline" TIMESTAMP(3),
    "status" "EventStatus" NOT NULL DEFAULT 'Draft',
    "gradient" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" UUID NOT NULL,
    "registration_number" TEXT NOT NULL,
    "event_id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "gender" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "age" INTEGER,
    "mobile_number" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "occupation" TEXT,
    "organisation" TEXT,
    "address_line_1" TEXT,
    "address_line_2" TEXT,
    "city" TEXT,
    "district" TEXT,
    "state" TEXT,
    "country" TEXT DEFAULT 'India',
    "pin_code" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_relationship" TEXT,
    "emergency_mobile_number" TEXT,
    "number_of_participants" INTEGER NOT NULL DEFAULT 1,
    "preferred_language" TEXT DEFAULT 'English',
    "accommodation_required" BOOLEAN NOT NULL DEFAULT false,
    "food_preference" TEXT,
    "transportation_required" BOOLEAN NOT NULL DEFAULT false,
    "arrival_date" TIMESTAMP(3),
    "departure_date" TIMESTAMP(3),
    "medical_condition" TEXT,
    "allergies" TEXT,
    "current_medication" TEXT,
    "special_assistance" TEXT,
    "donation_amount" DECIMAL(10,2),
    "donation_purpose" TEXT,
    "registration_status" "RegistrationStatus" NOT NULL DEFAULT 'Pending',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'Pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "registration_id" UUID NOT NULL,
    "payment_gateway" TEXT NOT NULL DEFAULT 'razorpay',
    "gateway_order_id" TEXT,
    "gateway_payment_id" TEXT,
    "gateway_signature" TEXT,
    "transaction_reference" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'Pending',
    "payment_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_registration_number_key" ON "event_registrations"("registration_number");

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "event_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
