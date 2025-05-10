/*
  Warnings:

  - Added the required column `creatorId` to the `Workflow` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "configJson" JSONB,
ADD COLUMN     "creatorId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "_WorkflowBots" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_WorkflowBots_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_WorkflowBots_B_index" ON "_WorkflowBots"("B");

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkflowBots" ADD CONSTRAINT "_WorkflowBots_A_fkey" FOREIGN KEY ("A") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkflowBots" ADD CONSTRAINT "_WorkflowBots_B_fkey" FOREIGN KEY ("B") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
