#ifndef VSFSCK_H
#define VSFSCK_H

#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <stdlib.h>

#define BLOCK_SIZE 4096
#define TOTAL_BLOCKS 64
#define INODE_SIZE 256
#define INODE_COUNT 80
#define MAGIC 0xD34D
#define INODE_BITMAP_BLOCK 1
#define DATA_BITMAP_BLOCK 2
#define INODE_TABLE_START 3
#define FIRST_DATA_BLOCK 8

typedef struct {
    uint16_t magic;
    uint32_t block_size;
    uint32_t total_blocks;
    uint32_t inode_bitmap;
    uint32_t data_bitmap;
    uint32_t inode_table;
    uint32_t first_data;
    uint32_t inode_size;
    uint32_t inode_count;
    uint8_t reserved[4058];
} Superblock;

typedef struct {
    uint32_t mode;
    uint32_t uid;
    uint32_t gid;
    uint32_t size;
    uint32_t atime;
    uint32_t ctime;
    uint32_t mtime;
    uint32_t dtime;
    uint32_t links;
    uint32_t blocks;
    uint32_t direct;
    uint32_t indirect;
    uint32_t double_indirect;
    uint32_t triple_indirect;
    uint8_t reserved[156];
} Inode;

extern FILE* image;
extern uint8_t inode_bitmap[BLOCK_SIZE];
extern uint8_t data_bitmap[BLOCK_SIZE];
extern Inode inodes[INODE_COUNT];
extern int used_data_blocks[TOTAL_BLOCKS];
extern int valid_inodes[INODE_COUNT];
extern int error_count;

int read_block(uint32_t block_num, uint8_t* buffer);
int write_block(uint32_t block_num, uint8_t* buffer);
void check_superblock();
void check_inode_bitmap();
void check_data_blocks();

#endif