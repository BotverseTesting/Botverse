-- CreateTable
CREATE TABLE "FavoriteBot" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "botId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteBot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteBot_userId_botId_key" ON "FavoriteBot"("userId", "botId");

-- AddForeignKey
ALTER TABLE "FavoriteBot" ADD CONSTRAINT "FavoriteBot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteBot" ADD CONSTRAINT "FavoriteBot_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
