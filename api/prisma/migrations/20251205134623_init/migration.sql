/*
  Warnings:

  - You are about to drop the column `event` on the `Webhook` table. All the data in the column will be lost.
  - You are about to drop the column `payload` on the `Webhook` table. All the data in the column will be lost.
  - Added the required column `method` to the `Webhook` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pathname` to the `Webhook` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payload" JSONB NOT NULL,
    "signature" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "webhookId" TEXT NOT NULL,
    CONSTRAINT "WebhookDelivery_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Webhook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "method" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Webhook" ("createdAt", "id") SELECT "createdAt", "id" FROM "Webhook";
DROP TABLE "Webhook";
ALTER TABLE "new_Webhook" RENAME TO "Webhook";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
