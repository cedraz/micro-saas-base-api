-- DropForeignKey
ALTER TABLE "providers" DROP CONSTRAINT "providers_user_id_fkey";

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
