/*
  Warnings:

  - A unique constraint covering the columns `[identifier]` on the table `verification_requests` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "verification_requests_identifier_token_key";

-- DropIndex
DROP INDEX "verification_requests_token_key";

-- CreateIndex
CREATE UNIQUE INDEX "verification_requests_identifier_key" ON "verification_requests"("identifier");
