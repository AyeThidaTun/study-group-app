-- CreateTable
CREATE TABLE "DeckProgress" (
    "deckProgressId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "deckId" INTEGER NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "lastReviewed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeckProgress_pkey" PRIMARY KEY ("deckProgressId")
);

-- AddForeignKey
ALTER TABLE "DeckProgress" ADD CONSTRAINT "DeckProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckProgress" ADD CONSTRAINT "DeckProgress_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("deckId") ON DELETE RESTRICT ON UPDATE CASCADE;
