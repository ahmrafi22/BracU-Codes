#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#define MAX_USERS 5
#define MAX_RESOURCES 5
#define MAX_NAME_LEN 20

typedef enum{
    READ = 1,
    WRITE = 2,
    EXECUTE = 4
}Permission;

typedef struct{
    char name[MAX_NAME_LEN];
}User;

typedef struct{
    char name[MAX_NAME_LEN];
}Resource;

typedef struct{
    char userName[MAX_NAME_LEN];
    int permissions;
}ACLEntry;

typedef struct{
    Resource resource;
    ACLEntry entries[MAX_USERS];
    int entryCount;
}ACLControlledResource;

typedef struct{
    char resourceName[MAX_NAME_LEN];
    int permissions;
}Capability;

typedef struct{
    User user;
    Capability capabilities[MAX_RESOURCES];
    int capabilityCount;
}CapabilityUser;

//Utility Functions
void printPermissions(int perm){
    if(perm & READ) printf("READ ");
    if(perm & WRITE) printf("WRITE ");
    if(perm & EXECUTE) printf("EXECUTE ");
}

int hasPermission(int userPerm, int requiredPerm){
    return (userPerm & requiredPerm) == requiredPerm;
}

//ACL System
void checkACLAccess(ACLControlledResource *res, const char *userName, int perm){
    printf("ACL Check: User %s requests ", userName);
    printPermissions(perm);
    printf("on %s: Access ", res->resource.name);
    
    int i;
    for(i = 0; i < res->entryCount; i++){
        if(strcmp(res->entries[i].userName, userName) == 0){
            if(hasPermission(res->entries[i].permissions, perm)){
                printf("GRANTED\n");
            } else {
                printf("DENIED\n");
            }
            return;
        }
    }
    
    printf("DENIED\nACL Check: User %s has NO entry for resource %s: Access DENIED\n", 
           userName, res->resource.name);
}

//Capability System
void checkCapabilityAccess(CapabilityUser *user, const char *resourceName, int perm){
    printf("Capability Check: User %s requests ", user->user.name);
    printPermissions(perm);
    printf("on %s: Access ", resourceName);
    
    int i;
    for(i = 0; i < user->capabilityCount; i++){
        if(strcmp(user->capabilities[i].resourceName, resourceName) == 0){
            if(hasPermission(user->capabilities[i].permissions, perm)){
                printf("GRANTED\n");
            } else {
                printf("DENIED\n");
            }
            return;
        }
    }
    
    printf("DENIED\nCapability Check: User %s has NO capability for %s: Access DENIED\n", 
           user->user.name, resourceName);
}

int main(){
    User users[MAX_USERS] = {
        {"Alice"}, 
        {"Bob"}, 
        {"Charlie"}, 
        {"Rafi1"},
        {"Rafi2"}
    };
    
    Resource resources[MAX_RESOURCES] = {
        {"File1"}, 
        {"File2"}, 
        {"File3"},
        {"File4"},
        {"File5"}
    };
    
    //ACL Setup
    ACLControlledResource aclResources[MAX_RESOURCES];
    
    for(int i = 0; i < MAX_RESOURCES; i++){
        aclResources[i].resource = resources[i];
        aclResources[i].entryCount = 0;
    }
    
    strcpy(aclResources[0].entries[0].userName, "Alice");
    aclResources[0].entries[0].permissions = READ | WRITE;
    strcpy(aclResources[0].entries[1].userName, "Bob");
    aclResources[0].entries[1].permissions = READ;
    aclResources[0].entryCount = 2;
    
    strcpy(aclResources[1].entries[0].userName, "Bob");
    aclResources[1].entries[0].permissions = READ | EXECUTE;
    strcpy(aclResources[1].entries[1].userName, "Charlie");
    aclResources[1].entries[1].permissions = WRITE;
    aclResources[1].entryCount = 2;
    
    strcpy(aclResources[2].entries[0].userName, "Alice");
    aclResources[2].entries[0].permissions = READ | WRITE | EXECUTE;
    strcpy(aclResources[2].entries[1].userName, "Charlie");
    aclResources[2].entries[1].permissions = READ;
    aclResources[2].entryCount = 2;
    
    strcpy(aclResources[3].entries[0].userName, "Rafi1");
    aclResources[3].entries[0].permissions = READ | WRITE;
    strcpy(aclResources[3].entries[1].userName, "Rafi2");
    aclResources[3].entries[1].permissions = READ | EXECUTE;
    aclResources[3].entryCount = 2;
    
    strcpy(aclResources[4].entries[0].userName, "Rafi2");
    aclResources[4].entries[0].permissions = READ | WRITE | EXECUTE;
    strcpy(aclResources[4].entries[1].userName, "Alice");
    aclResources[4].entries[1].permissions = READ;
    aclResources[4].entryCount = 2;
    
     //Capability Setup
    CapabilityUser capUsers[MAX_USERS];
    
    for(int i = 0; i < MAX_USERS; i++){
        capUsers[i].user = users[i];
        capUsers[i].capabilityCount = 0;
    }
    
    strcpy(capUsers[0].capabilities[0].resourceName, "File1");
    capUsers[0].capabilities[0].permissions = READ | WRITE;
    strcpy(capUsers[0].capabilities[1].resourceName, "File3");
    capUsers[0].capabilities[1].permissions = READ | WRITE | EXECUTE;
    strcpy(capUsers[0].capabilities[2].resourceName, "File5");
    capUsers[0].capabilities[2].permissions = READ;
    capUsers[0].capabilityCount = 3;
    
    strcpy(capUsers[1].capabilities[0].resourceName, "File1");
    capUsers[1].capabilities[0].permissions = READ;
    strcpy(capUsers[1].capabilities[1].resourceName, "File2");
    capUsers[1].capabilities[1].permissions = READ | EXECUTE;
    capUsers[1].capabilityCount = 2;
    
    strcpy(capUsers[2].capabilities[0].resourceName, "File2");
    capUsers[2].capabilities[0].permissions = WRITE;
    strcpy(capUsers[2].capabilities[1].resourceName, "File3");
    capUsers[2].capabilities[1].permissions = READ;
    capUsers[2].capabilityCount = 2;
    
    strcpy(capUsers[3].capabilities[0].resourceName, "File4");
    capUsers[3].capabilities[0].permissions = READ | WRITE;
    capUsers[3].capabilityCount = 1;
    
    strcpy(capUsers[4].capabilities[0].resourceName, "File4");
    capUsers[4].capabilities[0].permissions = READ | EXECUTE;
    strcpy(capUsers[4].capabilities[1].resourceName, "File5");
    capUsers[4].capabilities[1].permissions = READ | WRITE | EXECUTE;
    capUsers[4].capabilityCount = 2;
    
    // Test ACL
    checkACLAccess(&aclResources[0], "Alice", READ);
    checkACLAccess(&aclResources[0], "Bob", WRITE);
    checkACLAccess(&aclResources[0], "Charlie", READ);
    
    checkACLAccess(&aclResources[1], "Bob", EXECUTE);
    checkACLAccess(&aclResources[1], "Charlie", READ);
    
    checkACLAccess(&aclResources[2], "Alice", WRITE | EXECUTE);
    
    checkACLAccess(&aclResources[3], "Rafi1", WRITE);
    checkACLAccess(&aclResources[3], "Rafi2", WRITE);
    checkACLAccess(&aclResources[4], "Rafi2", EXECUTE);
    
    // Test Capability
    checkCapabilityAccess(&capUsers[0], "File1", WRITE);
    checkCapabilityAccess(&capUsers[1], "File1", WRITE);
    checkCapabilityAccess(&capUsers[2], "File2", WRITE);
    
    checkCapabilityAccess(&capUsers[2], "File1", READ);
    checkCapabilityAccess(&capUsers[3], "File4", WRITE);
    checkCapabilityAccess(&capUsers[4], "File5", EXECUTE);
    
    return 0;
}