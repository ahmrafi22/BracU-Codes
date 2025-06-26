#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/ipc.h>
#include <sys/msg.h>
#include <sys/wait.h>
#include <errno.h>

struct message_buf {
    long int type;
    char txt[6];
};

int main(){
    pid_t p_id;
    pid_t child_pid;
    key_t key;
    int msgid;
    int snt;
    struct message_buf message;
    struct message_buf receive_msg;
    char work[100];
    char buff[100];
    key=ftok("msgfile",65);
    msgid=msgget(key, 0666 | IPC_CREAT);
    if(msgid==-1){                          
        perror("msgget");
    }
    printf("Enter workspace name: ");
    scanf("%s", work);
    if(strcmp(work, "cse321") != 0){
        printf("Invalid workspace name\n");
        return 0;
    }
    message.type=1;
    strcpy(message.txt, work);
    snt=msgsnd(msgid, &message, sizeof(message), 0);
    if(snt==-1){
        perror("msgsnd");
    }
    printf("Login process: Message '%s' sent to queue\n", message.txt);
    p_id=fork();
    if(p_id<0){
        perror("fork");
    }
    else if(p_id==0){
        if(msgrcv(msgid, (void *)&receive_msg, sizeof(receive_msg.txt), 1, 0) < 0){
            perror("Error");
        }
        printf("OTP Generator: Received message '%s' from queue\n", receive_msg.txt);
        pid_t my_pid = getpid();
        sprintf(message.txt, "%d", my_pid); 
        message.type = 2;
        snt=msgsnd(msgid, &message, sizeof(message), 0);
        if(snt==-1){
            printf("error\n");
        }
        printf("OTP Generator: Message '%s' sent to login process\n", message.txt);
        message.type = 3;
        snt = msgsnd(msgid, (void *)&message, sizeof(message.txt), 0);
        if(snt == -1){
            printf("Error\n");
        }
        printf("OTP Generator: Message '%s' sent to mail process\n", message.txt);
        child_pid = fork();
        if(child_pid < 0){
            perror("fork");
        }
        else if(child_pid==0){
            struct message_buf mail_msg;
            if(msgrcv(msgid, (void *)&mail_msg, sizeof(mail_msg.txt), 3, 0) < 0){
                perror("Error");
            }
            printf("Mail process: Received message '%s' from queue\n", mail_msg.txt);
            mail_msg.type = 4;
            snt = msgsnd(msgid, (void *)&mail_msg, sizeof(mail_msg.txt), 0);
            if(snt == -1){
                printf("Error\n");
            }
            printf("Mail process: Message '%s' sent to login process\n", mail_msg.txt);
            
            exit(0);
        }
        exit(0);
    }
    else{
        wait(NULL);
        if(msgrcv(msgid, (void *)&receive_msg, sizeof(receive_msg.txt), 2, 0) < 0){
            perror("Error");
        }
        printf("Login process: Received OTP '%s' from OTP generator\n", receive_msg.txt);
        if(msgrcv(msgid, (void *)&receive_msg, sizeof(receive_msg.txt), 4, 0) < 0){
            perror("Error");
        }
        printf("Login process: Received OTP '%s' from OTP generator\n", receive_msg.txt);
        if(msgrcv(msgid, (void *)&receive_msg, sizeof(receive_msg.txt), 4, 0) < 0){
            perror("Error");
        }
        printf("Login process: Received OTP '%s' from mail process\n", receive_msg.txt);
        msgctl(msgid, IPC_RMID, 0);
        return 0;
    }
}