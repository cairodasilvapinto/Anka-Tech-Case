-- CreateTable
CREATE TABLE `ClientAssetAllocation` (
    `id` VARCHAR(191) NOT NULL,
    `assetName` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `allocatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ClientAssetAllocation` ADD CONSTRAINT `ClientAssetAllocation_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
