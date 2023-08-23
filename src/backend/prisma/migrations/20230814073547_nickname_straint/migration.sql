/*
  Warnings:

  - You are about to alter the column `nickname` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(12)`.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "nickname" SET DATA TYPE VARCHAR(12);
