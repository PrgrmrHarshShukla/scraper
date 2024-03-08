-- CreateTable
CREATE TABLE "Tweet" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userid" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "deadline" TEXT NOT NULL,

    CONSTRAINT "Tweet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" TEXT NOT NULL,
    "userid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "org" TEXT NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gig" (
    "id" TEXT NOT NULL,
    "commitment" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "postedOn" TEXT NOT NULL,
    "min_pay" TEXT NOT NULL,
    "max_pay" TEXT NOT NULL,
    "is_remote" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Gig_pkey" PRIMARY KEY ("id")
);
