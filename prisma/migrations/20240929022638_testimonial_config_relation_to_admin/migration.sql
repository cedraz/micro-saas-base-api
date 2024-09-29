/*
  Warnings:

  - Added the required column `admin_id` to the `testimonial_configs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "testimonial_configs" ADD COLUMN     "admin_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "testimonial_configs" ADD CONSTRAINT "testimonial_configs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
