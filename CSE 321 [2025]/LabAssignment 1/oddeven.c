#include <stdio.h>
#include <stdlib.h>

void check_even_odd(int num) {
    printf("%d is %s\n", num, (num % 2 == 0) ? "even" : "odd");
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        printf("Write the numbers properly with spaces\n");
        return 1;
    }

    for (int i = 1; i < argc; i++) {
        int num = atoi(argv[i]);
        check_even_odd(num);
    }

    return 0;
}
