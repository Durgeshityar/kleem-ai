/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `FormResponse` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `FormResponse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FormResponse" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FormResponse_email_key" ON "FormResponse"("email");
