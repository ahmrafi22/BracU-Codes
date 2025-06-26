#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/ipc.h>
#include <sys/msg.h>
#include <sys/wait.h>

struct queue_message {
    long int type;
    char txt[7]; 
};

#define WORKSPACE_MSG 1
#define OTP_TO_LOGIN_MSG 2
#define OTP_TO_MAIL_MSG 3
#define MAIL_TO_LOGIN_MSG 4

int main() {
    int message_queue_id;
    key_t key_value;
    pid_t otp_generator_pid, mail_process_pid;
    int status;
    char workspace_input[50];
    struct queue_message msg_buffer;

    key_value = ftok(".", 'X');
    if (key_value == -1) {
        perror("Key generation failed");
        exit(EXIT_FAILURE);
    }

    message_queue_id = msgget(key_value, IPC_CREAT | 0666);
    if (message_queue_id == -1) {
        perror("Message queue creation failed");
        exit(EXIT_FAILURE);
    }

    printf("Please enter the workspace name:\n");
    scanf("%s", workspace_input);

    if (strcmp(workspace_input, "cse321") != 0) {
        printf("Invalid workspace name\n");
        msgctl(message_queue_id, IPC_RMID, NULL);
        exit(EXIT_SUCCESS);
    }

    memset(&msg_buffer, 0, sizeof(msg_buffer));
    msg_buffer.type = WORKSPACE_MSG;
    strncpy(msg_buffer.txt, workspace_input, sizeof(msg_buffer.txt));
    msg_buffer.txt[sizeof(msg_buffer.txt) - 1] = '\0'; 

    if (msgsnd(message_queue_id, &msg_buffer, sizeof(msg_buffer.txt), 0) == -1) {
        perror("Message sending failed");
        exit(EXIT_FAILURE);
    }
    printf("Workspace name sent to otp generator from log in: %s\n", msg_buffer.txt);

    otp_generator_pid = fork();

    if (otp_generator_pid < 0) {
        perror("OTP generator process creation failed");
        exit(EXIT_FAILURE);
    } 
    else if (otp_generator_pid == 0) {
        struct queue_message otp_msg;
        if (msgrcv(message_queue_id, &otp_msg, sizeof(otp_msg.txt), WORKSPACE_MSG, 0) == -1) {
            perror("Message receive failed in OTP generator");
            exit(EXIT_FAILURE);
        }
        printf("OTP generator received workspace name from log in: %s\n", otp_msg.txt);

        pid_t current_pid = getpid();
        memset(&otp_msg, 0, sizeof(otp_msg));
        snprintf(otp_msg.txt, sizeof(otp_msg.txt), "%d", current_pid % 10000);

        otp_msg.type = OTP_TO_LOGIN_MSG;
        if (msgsnd(message_queue_id, &otp_msg, sizeof(otp_msg.txt), 0) == -1) {
            perror("OTP sending to login failed");
            exit(EXIT_FAILURE);
        }
        printf("OTP sent to log in from OTP generator: %s\n", otp_msg.txt);

        otp_msg.type = OTP_TO_MAIL_MSG;
        if (msgsnd(message_queue_id, &otp_msg, sizeof(otp_msg.txt), 0) == -1) {
            perror("OTP sending to mail failed");
            exit(EXIT_FAILURE);
        }
        printf("OTP sent to mail from OTP generator: %s\n", otp_msg.txt);

        mail_process_pid = fork();

        if (mail_process_pid < 0) {
            perror("Mail process creation failed");
            exit(EXIT_FAILURE);
        } 
        else if (mail_process_pid == 0) {
            struct queue_message mail_msg;
            if (msgrcv(message_queue_id, &mail_msg, sizeof(mail_msg.txt), OTP_TO_MAIL_MSG, 0) == -1) {
                perror("Message receive failed in mail process");
                exit(EXIT_FAILURE);
            }
            printf("Mail received OTP from OTP generator: %s\n", mail_msg.txt);

            mail_msg.type = MAIL_TO_LOGIN_MSG;
            if (msgsnd(message_queue_id, &mail_msg, sizeof(mail_msg.txt), 0) == -1) {
                perror("OTP forwarding to login failed");
                exit(EXIT_FAILURE);
            }
            printf("OTP sent to log in from mail: %s\n", mail_msg.txt);

            exit(EXIT_SUCCESS);
        } 
        else {
            waitpid(mail_process_pid, &status, 0);
            exit(EXIT_SUCCESS);
        }
    } 
    else {
        struct queue_message otp_from_generator, otp_from_mail;
        waitpid(otp_generator_pid, &status, 0);

        if (msgrcv(message_queue_id, &otp_from_generator, sizeof(otp_from_generator.txt), OTP_TO_LOGIN_MSG, 0) == -1) {
            perror("OTP receive from generator failed");
            exit(EXIT_FAILURE);
        }
        printf("Log in received OTP from OTP generator: %s\n", otp_from_generator.txt);

        if (msgrcv(message_queue_id, &otp_from_mail, sizeof(otp_from_mail.txt), MAIL_TO_LOGIN_MSG, 0) == -1) {
            perror("OTP receive from mail failed");
            exit(EXIT_FAILURE);
        }
        printf("Log in received OTP from mail: %s\n", otp_from_mail.txt);

        if (strcmp(otp_from_generator.txt, otp_from_mail.txt) == 0) {
            printf("OTP Verified\n");
        } else {
            printf("OTP Incorrect\n");
        }

        if (msgctl(message_queue_id, IPC_RMID, NULL) == -1) {
            perror("Message queue removal failed");
            exit(EXIT_FAILURE);
        }
    }

    return EXIT_SUCCESS;
}