/*
  Warnings:

  - A unique constraint covering the columns `[userid]` on the table `Author` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Author_userid_key" ON "Author"("userid");
