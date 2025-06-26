#include "vsfsck.h"
#include <stdlib.h>

int read_block(uint32_t block_num, uint8_t* buffer) {
    fseek(image, block_num * BLOCK_SIZE, SEEK_SET);
    return fread(buffer, 1, BLOCK_SIZE, image) == BLOCK_SIZE;
}

int write_block(uint32_t block_num, uint8_t* buffer) {
    fseek(image, block_num * BLOCK_SIZE, SEEK_SET);
    return fwrite(buffer, 1, BLOCK_SIZE, image) == BLOCK_SIZE;
}