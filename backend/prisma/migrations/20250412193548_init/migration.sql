-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('discord', 'github', 'slack', 'teams', 'microsoft_store');

-- CreateEnum
CREATE TYPE "LinkType" AS ENUM ('website', 'documentation', 'support', 'legal', 'social');

-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('logo', 'screenshot', 'banner');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPERUSER', 'ADMIN', 'USER');

-- CreateTable
CREATE TABLE "Bot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sourcePlatform" "Platform" NOT NULL,
    "officialWebsite" TEXT,
    "documentationUrl" TEXT,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pricingInfo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "type" "ImageType",
    "botId" TEXT NOT NULL,

    CONSTRAINT "BotImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotLink" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "LinkType",
    "botId" TEXT NOT NULL,

    CONSTRAINT "BotLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotPermission" (
    "id" SERIAL NOT NULL,
    "scope" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "botId" TEXT NOT NULL,

    CONSTRAINT "BotPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicalDetails" (
    "id" SERIAL NOT NULL,
    "resourcePath" TEXT,
    "installationUrl" TEXT,
    "externalId" TEXT,
    "isVerified" BOOLEAN,
    "metadata" JSONB,
    "botId" TEXT NOT NULL,

    CONSTRAINT "TechnicalDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "capabilities" TEXT[],
    "botId" TEXT NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL,
    "profilePicture" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bot_name_key" ON "Bot"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TechnicalDetails_botId_key" ON "TechnicalDetails"("botId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "BotImage" ADD CONSTRAINT "BotImage_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotLink" ADD CONSTRAINT "BotLink_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotPermission" ADD CONSTRAINT "BotPermission_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalDetails" ADD CONSTRAINT "TechnicalDetails_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
