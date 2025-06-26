#include "vsfsck.h"
#include <stdlib.h>

FILE* image;
uint8_t inode_bitmap[BLOCK_SIZE];
uint8_t data_bitmap[BLOCK_SIZE];
Inode inodes[INODE_COUNT];
int used_data_blocks[TOTAL_BLOCKS];
int valid_inodes[INODE_COUNT];
int error_count = 0;

int main(int argc, char* argv[]) {
    if (argc != 2) {
        printf("Usage: %s <image_file>\n", argv[0]);
        return 1;
    }

    image = fopen(argv[1], "r+b");
    if (!image) {
        printf("ERROR: Cannot open image file %s\n", argv[1]);
        return 1;
    }

    check_superblock();
    check_inode_bitmap();
    check_data_blocks();

    printf("Check complete. Found %d errors.\n", error_count);

    fclose(image);
    return 0;
}