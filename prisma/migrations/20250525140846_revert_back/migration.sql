/*
  Warnings:

  - You are about to drop the column `email` on the `FormResponse` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "FormResponse_email_key";

-- AlterTable
ALTER TABLE "FormResponse" DROP COLUMN "email";
