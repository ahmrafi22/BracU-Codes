#include <stdio.h>
#include <string.h>

void write_to_file(const char *filename) {
    FILE *file = fopen(filename, "w");
    if (file == NULL) {
        perror("Error opening file");
        return;
    }

    printf("Enter a string (enter -1 to stop): \n ");
    char buffer[512];

    while (1) {
        printf("->");
        if (fgets(buffer, sizeof(buffer), stdin) == NULL) {
            break;
        }

        if (strcmp(buffer, "-1\n") == 0) {
            break;
        }

        fputs(buffer, file);
    }

    fclose(file);
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        printf("Write the name of the file properly\n");
        return 1;
    }

    write_to_file(argv[1]);

    return 0;
}
