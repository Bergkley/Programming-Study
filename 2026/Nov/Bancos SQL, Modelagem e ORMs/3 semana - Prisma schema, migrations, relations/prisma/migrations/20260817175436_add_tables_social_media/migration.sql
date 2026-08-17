-- CreateTable
CREATE TABLE "SocialMedia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SocialAccount" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "socialMediaId" INTEGER NOT NULL,
    "username" TEXT,
    "accessToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SocialAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SocialAccount_socialMediaId_fkey" FOREIGN KEY ("socialMediaId") REFERENCES "SocialMedia" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PostSocialAccount" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postId" INTEGER NOT NULL,
    "socialAccountId" INTEGER NOT NULL,
    "publishedAt" DATETIME,
    CONSTRAINT "PostSocialAccount_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PostSocialAccount_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialMedia_name_key" ON "SocialMedia"("name");

-- CreateIndex
CREATE INDEX "SocialAccount_userId_idx" ON "SocialAccount"("userId");

-- CreateIndex
CREATE INDEX "SocialAccount_socialMediaId_idx" ON "SocialAccount"("socialMediaId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_userId_socialMediaId_key" ON "SocialAccount"("userId", "socialMediaId");

-- CreateIndex
CREATE INDEX "PostSocialAccount_postId_idx" ON "PostSocialAccount"("postId");

-- CreateIndex
CREATE INDEX "PostSocialAccount_socialAccountId_idx" ON "PostSocialAccount"("socialAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "PostSocialAccount_postId_socialAccountId_key" ON "PostSocialAccount"("postId", "socialAccountId");
