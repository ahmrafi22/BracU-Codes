#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {  
    pid_t child = fork();

    if (child < 0) {
        printf("Fork failed");
        return 1;
    }

    if (child == 0) {  
        pid_t grandchild = fork();
        
        if (grandchild == 0) {  
            printf("I am grandchild\n");
            return 0;
        } else {  
            wait(NULL);
            printf("I am child\n");
            return 0;
        }
    } else {  
        wait(NULL);
        printf("I am parent\n");
    }

    return 0;
}