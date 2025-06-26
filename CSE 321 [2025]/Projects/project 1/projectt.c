#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <signal.h>
#include <fcntl.h>
#include <errno.h> 

#define MAX_INPUT_SIZE 1024
#define MAX_TOKENS 100
#define MAX_HISTORY 20
#define MAX_PIPE_CMDS 11 

// Global variables
char *history[MAX_HISTORY];
int history_count = 0;
volatile sig_atomic_t current_foreground_pgid = -1;

// Function Prototypes 
char* read_input();
void add_to_history(char *cmd);
void show_history();
char** tokenize(char *line, char *delim, int *token_count);
int check_builtin_command(char **args);
void handle_redirection(char **args, int *in_fd, int *out_fd);
int process_command(char *cmd);
void handle_sigint(int sig);

// Signal Handler
void handle_sigint(int sig) {
    if (current_foreground_pgid > 0) {
        // Send SIGINT to the foreground process group
        kill(-current_foreground_pgid, SIGINT);
        // waitpid loop in process_command handles reaping
    } else {
        // No foreground job running
        printf("\n(Type 'exit' to quit)\nsh> "); // Print message and prompt
        fflush(stdout); // Ensure it appears immediately
    }
}

// --- Input and History ---
char* read_input() {
    char *input = malloc(MAX_INPUT_SIZE);
    if (!input) {
        perror("malloc error");
        exit(EXIT_FAILURE);
    }

    printf("sh> ");
    fflush(stdout);

    while (1) { // Loop to retry fgets on EINTR
        clearerr(stdin); // Clear potential error indicators
        if (fgets(input, MAX_INPUT_SIZE, stdin) == NULL) {
            if (feof(stdin)) { // Check for EOF (Ctrl+D)
                free(input);
                printf("\n");
                return NULL;
            }
            if (errno == EINTR) { // Check if interrupted by signal
                errno = 0; // Reset errno
                // The signal handler (handle_sigint) should have printed the prompt again
                continue; // Retry reading input
            } else {
                // Actual read error
                perror("fgets error");
                free(input);
                return NULL;
            }
        }
        // If fgets succeeded, break the retry loop
        break;
    }

    size_t len = strlen(input);
    if (len > 0 && input[len - 1] == '\n') {
        input[len - 1] = '\0';
    } else if (len == MAX_INPUT_SIZE - 1 && input[len-1] != '\n') {
         int ch;
         while ((ch = getchar()) != '\n' && ch != EOF);
         // fprintf(stderr, "Warning: Input truncated.\n"); // Optional warning
    }

    return input;
}

void add_to_history(char *cmd) {
    if (strlen(cmd) == 0 || (history_count > 0 && strcmp(history[history_count - 1], cmd) == 0)) {
        return;
    }

    if (history_count < MAX_HISTORY) {
        history[history_count] = strdup(cmd);
        if (!history[history_count]) return; // strdup failed
        history_count++;
    } else {
        free(history[0]);
        for (int i = 0; i < MAX_HISTORY - 1; i++) {
            history[i] = history[i + 1];
        }
        history[MAX_HISTORY - 1] = strdup(cmd);
        if (!history[MAX_HISTORY - 1]) { // strdup failed
             history_count = MAX_HISTORY -1; // Adjust count if allocation failed
        }
    }
}

void show_history() {
    for (int i = 0; i < history_count; i++) {
        printf("%d: %s\n", i + 1, history[i]);
    }
}

// --- Parsing and Tokenization ---
char** tokenize(char *line, char *delim, int *token_count) {
    char **tokens = malloc((MAX_TOKENS + 1) * sizeof(char*));
    if (!tokens) {
        perror("malloc error for tokens");
        exit(EXIT_FAILURE);
    }

    *token_count = 0;
    char *token = strtok(line, delim);
    while (token != NULL && *token_count < MAX_TOKENS) {
        tokens[(*token_count)++] = token;
        token = strtok(NULL, delim);
    }
    tokens[*token_count] = NULL;

    return tokens;
}

// --- Built-in Commands ---
// Returns: 0: success, 1: failure, 2: exit, 3: not built-in
int check_builtin_command(char **args) {
    if (args[0] == NULL) return 3;

    if (strcmp(args[0], "exit") == 0) return 2;
    if (strcmp(args[0], "cd") == 0) {
        char *target_dir = args[1];
        if (target_dir == NULL) target_dir = getenv("HOME");
        if (target_dir == NULL || chdir(target_dir) != 0) {
            perror("cd error");
            return 1;
        }
        return 0;
    }
    if (strcmp(args[0], "history") == 0) {
        show_history();
        return 0;
    }
    return 3;
}

// --- Redirection ---
void handle_redirection(char **args, int *in_fd, int *out_fd) {
    *in_fd = -1;
    *out_fd = -1;
    int i = 0;
    int write_idx = 0;

    // Iterate through args, process redirections and compact the array
    for (i = 0; args[i] != NULL; /* no increment here */ ) {
        int is_redirect = 0;
        if (strcmp(args[i], "<") == 0) {
            is_redirect = 1;
            if (args[i + 1] != NULL) {
                if (*in_fd != -1) close(*in_fd);
                *in_fd = open(args[i + 1], O_RDONLY);
                if (*in_fd < 0) perror("Input redirection failed");
                i += 2; // Skip '<' and filename
            } else {
                fprintf(stderr, "sh: syntax error near unexpected token `newline'\n");
                args[write_idx++] = args[i++]; // Keep the '<' to potentially signal error later
            }
        } else if (strcmp(args[i], ">") == 0) {
            is_redirect = 1;
            if (args[i + 1] != NULL) {
                if (*out_fd != -1) close(*out_fd);
                *out_fd = open(args[i + 1], O_WRONLY | O_CREAT | O_TRUNC, 0644);
                 if (*out_fd < 0) perror("Output redirection failed");
                i += 2;
            } else {
                 fprintf(stderr, "sh: syntax error near unexpected token `newline'\n");
                 args[write_idx++] = args[i++];
            }
        } else if (strcmp(args[i], ">>") == 0) {
            is_redirect = 1;
            if (args[i + 1] != NULL) {
                 if (*out_fd != -1) close(*out_fd);
                *out_fd = open(args[i + 1], O_WRONLY | O_CREAT | O_APPEND, 0644);
                 if (*out_fd < 0) perror("Append redirection failed");
                i += 2;
            } else {
                 fprintf(stderr, "sh: syntax error near unexpected token `newline'\n");
                 args[write_idx++] = args[i++];
            }
        }

        if (!is_redirect) {
            // If it's not a redirection symbol we processed, keep it
            args[write_idx++] = args[i++];
        }
    }
    args[write_idx] = NULL; // Null-terminate the compacted array
}

// --- Command Execution ---
// Returns: 0: success, 1: failure, 2: exit command
int process_command(char *cmd) {
    char *original_cmd_copy = strdup(cmd);
    if (!original_cmd_copy) { perror("strdup error"); return 1; }

    if (strchr(cmd, '|') != NULL) { // Pipeline
        int cmd_count;
        char **commands = tokenize(cmd, "|", &cmd_count);
        if (cmd_count > MAX_PIPE_CMDS) {
             fprintf(stderr, "sh: Too many commands in pipeline (max %d)\n", MAX_PIPE_CMDS -1);
             free(commands); free(original_cmd_copy); return 1;
        }

        int pipes[MAX_PIPE_CMDS - 1][2];
        pid_t pids[MAX_PIPE_CMDS];
        int status = 0;
        int last_cmd_status = 1;
        int exec_failed = 0;

        for (int i = 0; i < cmd_count - 1; i++) {
            if (pipe(pipes[i]) < 0) {
                perror("Pipe creation failed");
                for (int j = 0; j < i; j++) { close(pipes[j][0]); close(pipes[j][1]); }
                free(commands); free(original_cmd_copy); return 1;
            }
        }

        for (int i = 0; i < cmd_count; i++) {
             while (*commands[i] == ' ' || *commands[i] == '\t') commands[i]++;
             char *end = commands[i] + strlen(commands[i]) - 1;
             while(end > commands[i] && (*end == ' ' || *end == '\t')) *end-- = '\0';

            int token_count;
            char **args = tokenize(commands[i], " \t", &token_count);
            int in_fd = -1, out_fd = -1;
            handle_redirection(args, &in_fd, &out_fd);

            if (args[0] == NULL && in_fd == -1 && out_fd == -1) {
                 fprintf(stderr, "sh: Invalid null command in pipeline.\n");
                 exec_failed = 1; free(args); break;
            }

            pids[i] = fork();
            if (pids[i] < 0) {
                 perror("Fork failed"); exec_failed = 1; free(args); break;
            } else if (pids[i] == 0) { // Child
                if (setpgid(0, 0) < 0) { perror("setpgid failed"); exit(EXIT_FAILURE); }

                if (i == 0 && in_fd != -1) { if (dup2(in_fd, STDIN_FILENO) < 0) perror("dup2"); close(in_fd); }
                else if (i > 0) { if (dup2(pipes[i - 1][0], STDIN_FILENO) < 0) perror("dup2"); }
                if (in_fd != -1 && i > 0) close(in_fd);

                if (i == cmd_count - 1 && out_fd != -1) { if (dup2(out_fd, STDOUT_FILENO) < 0) perror("dup2"); close(out_fd); }
                else if (i < cmd_count - 1) { if (dup2(pipes[i][1], STDOUT_FILENO) < 0) perror("dup2"); }
                if (out_fd != -1 && i < cmd_count - 1) close(out_fd);

                for (int j = 0; j < cmd_count - 1; j++) { close(pipes[j][0]); close(pipes[j][1]); }

                if (args[0] != NULL) {
                     if (execvp(args[0], args) < 0) { perror(args[0]); exit(EXIT_FAILURE); }
                } else { exit(EXIT_SUCCESS); } // Just redirection

            } else { // Parent (in loop)
                if (i == 0) current_foreground_pgid = pids[0];
                if (in_fd != -1) close(in_fd);
                if (out_fd != -1) close(out_fd);
            }
            free(args);
        }

        for (int i = 0; i < cmd_count - 1; i++) { close(pipes[i][0]); close(pipes[i][1]); }

        for (int i = 0; i < cmd_count; i++) {
             if (pids[i] > 0) {
                 int child_status;
                 waitpid(pids[i], &child_status, 0);
                 if (i == cmd_count - 1) { // Status of last command determines pipeline status
                     if (WIFEXITED(child_status)) last_cmd_status = WEXITSTATUS(child_status);
                     else last_cmd_status = 1; // Non-normal exit is failure
                 }
             } else if (exec_failed) { last_cmd_status = 1; }
        }

        current_foreground_pgid = -1;
        free(commands); free(original_cmd_copy);
        return (last_cmd_status == 0) ? 0 : 1;

    } else { // Simple Command
        int token_count;
        char **args = tokenize(cmd, " \t", &token_count);
        int in_fd = -1, out_fd = -1;
        handle_redirection(args, &in_fd, &out_fd);

        int builtin_status = check_builtin_command(args);
        if (builtin_status != 3) {
            if (in_fd != -1) close(in_fd);
            if (out_fd != -1) close(out_fd);
            free(args); free(original_cmd_copy);
            return builtin_status;
        }

        if (args[0] == NULL) { // Empty/only redirection
             if (in_fd != -1) close(in_fd);
             if (out_fd != -1) close(out_fd);
             free(args); free(original_cmd_copy);
             return 0; // No-op is success
        }

        pid_t pid = fork();
        if (pid < 0) {
            perror("Fork failed");
            if (in_fd != -1) close(in_fd); if (out_fd != -1) close(out_fd);
            free(args); free(original_cmd_copy); return 1;
        } else if (pid == 0) { // Child
            if (setpgid(0, 0) < 0) { perror("setpgid failed"); exit(EXIT_FAILURE); }
            if (in_fd != -1) { if (dup2(in_fd, STDIN_FILENO) < 0) perror("dup2"); close(in_fd); }
            if (out_fd != -1) { if (dup2(out_fd, STDOUT_FILENO) < 0) perror("dup2"); close(out_fd); }

            execvp(args[0], args);
            perror(args[0]); // Exec failed if we reach here
            exit(EXIT_FAILURE);
        } else { // Parent
            current_foreground_pgid = pid;
            if (in_fd != -1) close(in_fd);
            if (out_fd != -1) close(out_fd);

            int status;
            waitpid(pid, &status, 0);
            current_foreground_pgid = -1;
            free(args); free(original_cmd_copy);

            if (WIFEXITED(status)) return (WEXITSTATUS(status) == 0) ? 0 : 1;
            else return 1; // Abnormal termination is failure
        }
    }
}


// --- Main Function ---
int main() {
    // Print the welcome message once at the start
    printf("welcome to shell program\n");

    struct sigaction sa;
    sa.sa_handler = handle_sigint;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = 0; // Important: Do NOT set SA_RESTART, we want EINTR on fgets
    if (sigaction(SIGINT, &sa, NULL) == -1) {
        perror("sigaction failed"); exit(EXIT_FAILURE);
    }

    // Ignore other job control signals for simplicity
    signal(SIGTSTP, SIG_IGN);
    signal(SIGTTIN, SIG_IGN);
    signal(SIGTTOU, SIG_IGN);

    int shell_status = 0;

    while (shell_status != 2) {
        char *input = read_input();
        if (input == NULL) { shell_status = 2; break; } // EOF (Ctrl+D) or read error

        if (strlen(input) > 0) { add_to_history(input); }
        else { free(input); continue; }

        char *input_copy_for_semicolon = strdup(input);
        if (!input_copy_for_semicolon) { perror("strdup"); free(input); continue; }

        int cmd_seq_count;
        char **cmds = tokenize(input_copy_for_semicolon, ";", &cmd_seq_count);

        for (int i = 0; i < cmd_seq_count; i++) {
            char *cmd = cmds[i];
            while (*cmd == ' ' || *cmd == '\t') cmd++;
            char *end = cmd + strlen(cmd) - 1;
            while(end > cmd && (*end == ' ' || *end == '\t')) *end-- = '\0';
            if (strlen(cmd) == 0) continue;

            char *cmd_copy_for_and = strdup(cmd); // Need copy for && check/tokenize
            if (!cmd_copy_for_and) { perror("strdup"); continue; }

            if (strstr(cmd_copy_for_and, "&&") != NULL) { // Handle &&
                int subcmd_count;
                char **subcmds = tokenize(cmd_copy_for_and, "&&", &subcmd_count);
                int last_status = 0; // Success for && chain start

                for (int j = 0; j < subcmd_count; j++) {
                    char *subcmd = subcmds[j];
                    while (*subcmd == ' ' || *subcmd == '\t') subcmd++;
                    char *sub_end = subcmd + strlen(subcmd) - 1;
                    while(sub_end > subcmd && (*sub_end == ' ' || *sub_end == '\t')) *sub_end-- = '\0';
                    if (strlen(subcmd) == 0) continue;

                    if (last_status == 0) { // Only run if previous succeeded
                         char *subcmd_copy_for_process = strdup(subcmd);
                         if (!subcmd_copy_for_process) { perror("strdup"); last_status = 1; }
                         else {
                              last_status = process_command(subcmd_copy_for_process);
                              free(subcmd_copy_for_process);
                         }
                         if (last_status == 2) { shell_status = 2; break; } // exit command
                    } else { break; } // Skip rest of && chain on failure
                }
                free(subcmds);
            } else { // Handle simple command (no &&)
                 char *cmd_copy_for_process = strdup(cmd);
                 if (!cmd_copy_for_process) { perror("strdup"); shell_status = 1; }
                 else {
                      shell_status = process_command(cmd_copy_for_process);
                      free(cmd_copy_for_process);
                 }
            }
            free(cmd_copy_for_and);
            if (shell_status == 2) break; // exit command processed
        }
        free(cmds);
        free(input_copy_for_semicolon);
        free(input);
    }

    for (int i = 0; i < history_count; i++) { free(history[i]); }
    printf("Exiting shell.\n"); // Added exit message
    return EXIT_SUCCESS;
}