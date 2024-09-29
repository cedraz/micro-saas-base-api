/*
  Warnings:

  - Added the required column `status` to the `testimonials` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TestimonialStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "testimonials" ADD COLUMN     "status" "TestimonialStatus" NOT NULL;
