-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startPrice" DECIMAL(10,2) NOT NULL,
    "currentBid" DECIMAL(10,2),
    "retailPrice" DECIMAL(10,2) NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ItemCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "Item_endTime_idx" ON "Item"("endTime");

-- CreateIndex
CREATE INDEX "Item_createdAt_idx" ON "Item"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "_ItemCategories_AB_unique" ON "_ItemCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_ItemCategories_B_index" ON "_ItemCategories"("B");

-- AddForeignKey
ALTER TABLE "_ItemCategories" ADD CONSTRAINT "_ItemCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemCategories" ADD CONSTRAINT "_ItemCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
