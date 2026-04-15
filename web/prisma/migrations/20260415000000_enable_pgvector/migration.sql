/*
  Warnings:

  - You are about to alter the column `content` on the `documents` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "documents" ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "chunks" ADD COLUMN "content" TEXT NOT NULL DEFAULT '';
