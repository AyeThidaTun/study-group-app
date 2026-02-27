-- CreateTable
CREATE TABLE "Deck" (
    "deckId" SERIAL NOT NULL,
    "modCode" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("deckId")
);

-- CreateTable
CREATE TABLE "Flashcard" (
    "flashcardId" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "deckId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("flashcardId")
);

-- CreateTable
CREATE TABLE "FlashcardProgress" (
    "flashcardProgressId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "flashcardId" INTEGER NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "lastReviewed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlashcardProgress_pkey" PRIMARY KEY ("flashcardProgressId")
);

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_modCode_fkey" FOREIGN KEY ("modCode") REFERENCES "Module"("modCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("deckId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashcardProgress" ADD CONSTRAINT "FlashcardProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashcardProgress" ADD CONSTRAINT "FlashcardProgress_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "Flashcard"("flashcardId") ON DELETE RESTRICT ON UPDATE CASCADE;
