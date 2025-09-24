-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MassSelection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "templateType" TEXT NOT NULL,
    "liturgicalYear" TEXT,
    "season" TEXT,
    "themes" TEXT,
    "pastoralFocus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "MassSelection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MassPart" (
    "id" TEXT NOT NULL,
    "partName" TEXT NOT NULL,
    "keySignature" TEXT,
    "notes" TEXT,
    "massSelectionId" TEXT NOT NULL,

    CONSTRAINT "MassPart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "MassSelection_createdById_idx" ON "public"."MassSelection"("createdById");

-- CreateIndex
CREATE INDEX "MassSelection_isPublic_idx" ON "public"."MassSelection"("isPublic");

-- CreateIndex
CREATE INDEX "MassSelection_date_idx" ON "public"."MassSelection"("date");

-- CreateIndex
CREATE INDEX "MassPart_massSelectionId_idx" ON "public"."MassPart"("massSelectionId");

-- AddForeignKey
ALTER TABLE "public"."MassSelection" ADD CONSTRAINT "MassSelection_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MassPart" ADD CONSTRAINT "MassPart_massSelectionId_fkey" FOREIGN KEY ("massSelectionId") REFERENCES "public"."MassSelection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
