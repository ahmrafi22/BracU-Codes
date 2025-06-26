#include "vsfsck.h"
#include <stdlib.h>

void check_superblock() {
    printf("Checking superblock...\n");
    
    Superblock sb;
    if (!read_block(0, (uint8_t*)&sb)) {
        printf("ERROR: Cannot read superblock\n");
        exit(1);
    }

    if (sb.magic != MAGIC) {
        printf("ERROR: Wrong magic number (got 0x%x, expected 0x%x)\n", sb.magic, MAGIC);
        error_count++;
        sb.magic = MAGIC;
    }

    if (sb.block_size != BLOCK_SIZE) {
        printf("ERROR: Wrong block size (got %u, expected %u)\n", sb.block_size, BLOCK_SIZE);
        error_count++;
        sb.block_size = BLOCK_SIZE;
    }

    if (sb.total_blocks != TOTAL_BLOCKS) {
        printf("ERROR: Wrong total blocks (got %u, expected %u)\n", sb.total_blocks, TOTAL_BLOCKS);
        error_count++;
        sb.total_blocks = TOTAL_BLOCKS;
    }

    if (sb.inode_bitmap != INODE_BITMAP_BLOCK) {
        printf("ERROR: Wrong inode bitmap block (got %u, expected %u)\n", sb.inode_bitmap, INODE_BITMAP_BLOCK);
        error_count++;
        sb.inode_bitmap = INODE_BITMAP_BLOCK;
    }

    if (sb.data_bitmap != DATA_BITMAP_BLOCK) {
        printf("ERROR: Wrong data bitmap block (got %u, expected %u)\n", sb.data_bitmap, DATA_BITMAP_BLOCK);
        error_count++;
        sb.data_bitmap = DATA_BITMAP_BLOCK;
    }

    if (sb.inode_table != INODE_TABLE_START) {
        printf("ERROR: Wrong inode table start (got %u, expected %u)\n", sb.inode_table, INODE_TABLE_START);
        error_count++;
        sb.inode_table = INODE_TABLE_START;
    }

    if (sb.first_data != FIRST_DATA_BLOCK) {
        printf("ERROR: Wrong first data block (got %u, expected %u)\n", sb.first_data, FIRST_DATA_BLOCK);
        error_count++;
        sb.first_data = FIRST_DATA_BLOCK;
    }

    if (sb.inode_size != INODE_SIZE) {
        printf("ERROR: Wrong inode size (got %u, expected %u)\n", sb.inode_size, INODE_SIZE);
        error_count++;
        sb.inode_size = INODE_SIZE;
    }

    if (sb.inode_count != INODE_COUNT) {
        printf("ERROR: Wrong inode count (got %u, expected %u)\n", sb.inode_count, INODE_COUNT);
        error_count++;
        sb.inode_count = INODE_COUNT;
    }

    write_block(0, (uint8_t*)&sb);
}

void check_inode_bitmap() {
    printf("Checking inode bitmap...\n");

    if (!read_block(INODE_BITMAP_BLOCK, inode_bitmap)) {
        printf("ERROR: Cannot read inode bitmap\n");
        exit(1);
    }

    for (int i = 0; i < INODE_COUNT; i++) {
        uint8_t buffer[INODE_SIZE];
        fseek(image, (INODE_TABLE_START * BLOCK_SIZE) + (i * INODE_SIZE), SEEK_SET);
        if (fread(buffer, 1, INODE_SIZE, image) != INODE_SIZE) {
            printf("ERROR: Cannot read inode %d\n", i);
            exit(1);
        }
        memcpy(&inodes[i], buffer, INODE_SIZE);
    }

    for (int i = 0; i < INODE_COUNT; i++) {
        int byte = i / 8;
        int bit = i % 8;
        int bitmap_used = (inode_bitmap[byte] >> bit) & 1;

        int inode_valid = (inodes[i].links > 0 && inodes[i].dtime == 0);

        if (bitmap_used && !inode_valid) {
            printf("ERROR: Inode %d marked used but invalid\n", i);
            error_count++;
            inode_bitmap[byte] &= ~(1 << bit);
        }

        if (!bitmap_used && inode_valid) {
            printf("ERROR: Inode %d valid but not marked used\n", i);
            error_count++;
            inode_bitmap[byte] |= (1 << bit);
        }

        valid_inodes[i] = inode_valid;
    }

    write_block(INODE_BITMAP_BLOCK, inode_bitmap);
}

void check_data_blocks() {
    printf("Checking data blocks...\n");

    if (!read_block(DATA_BITMAP_BLOCK, data_bitmap)) {
        printf("ERROR: Cannot read data bitmap\n");
        exit(1);
    }

    memset(used_data_blocks, 0, sizeof(used_data_blocks));

    for (int i = 0; i < INODE_COUNT; i++) {
        if (!valid_inodes[i]) continue;

        if (inodes[i].direct != 0) {
            if (inodes[i].direct < FIRST_DATA_BLOCK || inodes[i].direct >= TOTAL_BLOCKS) {
                printf("ERROR: Inode %d has invalid direct block %u\n", i, inodes[i].direct);
                error_count++;
                inodes[i].direct = 0;
            }
            else if (used_data_blocks[inodes[i].direct]) {
                printf("ERROR: Block %u used by multiple inodes\n", inodes[i].direct);
                error_count++;
                inodes[i].direct = 0;
            }
            else {
                used_data_blocks[inodes[i].direct] = 1;
            }
        }

        if (inodes[i].indirect != 0) {
            if (inodes[i].indirect < FIRST_DATA_BLOCK || inodes[i].indirect >= TOTAL_BLOCKS) {
                printf("ERROR: Inode %d has invalid indirect block %u\n", i, inodes[i].indirect);
                error_count++;
                inodes[i].indirect = 0;
            }
            else if (used_data_blocks[inodes[i].indirect]) {
                printf("ERROR: Indirect block %u used by multiple inodes\n", inodes[i].indirect);
                error_count++;
                inodes[i].indirect = 0;
            }
            else {
                used_data_blocks[inodes[i].indirect] = 1;
            }
        }
    }

    for (int i = FIRST_DATA_BLOCK; i < TOTAL_BLOCKS; i++) {
        int byte = (i - FIRST_DATA_BLOCK) / 8;
        int bit = (i - FIRST_DATA_BLOCK) % 8;
        int bitmap_used = (data_bitmap[byte] >> bit) & 1;

        if (bitmap_used && !used_data_blocks[i]) {
            printf("ERROR: Data block %d marked used but not referenced\n", i);
            error_count++;
            data_bitmap[byte] &= ~(1 << bit);
        }

        if (!bitmap_used && used_data_blocks[i]) {
            printf("ERROR: Data block %d referenced but not marked used\n", i);
            error_count++;
            data_bitmap[byte] |= (1 << bit);
        }
    }

    write_block(DATA_BITMAP_BLOCK, data_bitmap);

    for (int i = 0; i < INODE_COUNT; i++) {
        fseek(image, (INODE_TABLE_START * BLOCK_SIZE) + (i * INODE_SIZE), SEEK_SET);
        fwrite(&inodes[i], 1, INODE_SIZE, image);
    }
}