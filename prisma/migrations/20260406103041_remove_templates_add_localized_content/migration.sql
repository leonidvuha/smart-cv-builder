/*
  Warnings:

  - You are about to drop the column `templateId` on the `ChatSession` table. All the data in the column will be lost.
  - You are about to drop the column `locale` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `templateId` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the `Section` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Template` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[chatSessionId]` on the table `Resume` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_templateId_fkey";

-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_resumeId_fkey";

-- AlterTable
ALTER TABLE "ChatSession" DROP COLUMN "templateId";

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "locale",
DROP COLUMN "templateId",
ADD COLUMN     "chatSessionId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "localizedContent" JSONB,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "rawContent" JSONB,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft';

-- DropTable
DROP TABLE "Section";

-- DropTable
DROP TABLE "Template";

-- CreateIndex
CREATE UNIQUE INDEX "Resume_chatSessionId_key" ON "Resume"("chatSessionId");

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_chatSessionId_fkey" FOREIGN KEY ("chatSessionId") REFERENCES "ChatSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
