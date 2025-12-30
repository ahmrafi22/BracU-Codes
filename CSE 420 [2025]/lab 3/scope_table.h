#include "symbol_info.h"
#include <iostream>
#include <fstream>
#include <vector>
#include <list>
#include <string>

using namespace std;

class scope_table
{
private:
    int bucket_count;
    int unique_id;
    scope_table *parent_scope = NULL;
    vector<list<symbol_info *>> table;
    int scope_id;

    int hash_function(string name)
    {
        int hash = 0;
        for (char c : name)
        {
            hash = (hash + c) % bucket_count;
        }
        return hash;
    }

public:
    scope_table();
    scope_table(scope_table *parent_scope, int bucket_count, int unique_id);
    scope_table *get_parent_scope();
    int get_unique_id();
    symbol_info *lookup_in_scope(symbol_info* symbol);
    bool insert_in_scope(symbol_info* symbol);
    bool delete_from_scope(symbol_info* symbol);
    void print_scope_table(ofstream& outlog);
    ~scope_table();

    // you can add more methods if you need
    symbol_info *lookup(string name);
    bool delete_symbol(string name);
    int get_bucket_count();
    int get_scope_id();
};

// complete the methods of scope_table class

scope_table::scope_table(scope_table *parent_scope, int bucket_count, int unique_id)
{
    this->bucket_count = bucket_count;
    this->unique_id = unique_id;
    this->parent_scope = parent_scope;
    this->scope_id = unique_id; 
    table.resize(bucket_count);
}

scope_table::scope_table()
{
    this->bucket_count = 0;
    this->unique_id = 0;
    this->parent_scope = NULL;
}

scope_table::~scope_table()
{
    for (int i = 0; i < bucket_count; i++)
    {
        for (auto it = table[i].begin(); it != table[i].end(); ++it)
        {
            delete *it;
        }
    }
}

scope_table *scope_table::get_parent_scope()
{
    return parent_scope;
}

int scope_table::get_unique_id()
{
    return unique_id;
}

int scope_table::get_bucket_count()
{
    return bucket_count;
}

symbol_info *scope_table::lookup_in_scope(symbol_info* symbol)
{
    if (symbol == NULL)
    {
        return NULL;
    }
    return lookup(symbol->get_name());
}

symbol_info *scope_table::lookup(string name)
{
    int index = hash_function(name);
    for (auto it = table[index].begin(); it != table[index].end(); ++it)
    {
        if ((*it)->get_name() == name)
        {
            return *it;
        }
    }
    return NULL;
}

bool scope_table::insert_in_scope(symbol_info* symbol)
{
    if (symbol == NULL)
    {
        return false;
    }
    int index = hash_function(symbol->get_name());
    for (auto it = table[index].begin(); it != table[index].end(); ++it)
    {
        if ((*it)->get_name() == symbol->get_name())
        {
            return false; // Symbol already exists
        }
    }
    table[index].push_back(symbol);
    return true; // Symbol inserted successfully
}

bool scope_table::delete_from_scope(symbol_info* symbol)
{
    if (symbol == NULL)
    {
        return false;
    }
    return delete_symbol(symbol->get_name());
}

bool scope_table::delete_symbol(string name)
{
    int index = hash_function(name);
    for (auto it = table[index].begin(); it != table[index].end(); ++it)
    {
        if ((*it)->get_name() == name)
        {
            delete *it; // Free the memory of the symbol
            table[index].erase(it); // Remove from the list
            return true; 
        }
    }
    return false; // Not found
}

void scope_table::print_scope_table(ofstream& outlog)
{
    outlog << "ScopeTable # " + to_string(unique_id) << endl;

    // Iterate through the current scope table and print the symbols and all relevant information
    for (int i = 0; i < bucket_count; i++)
    {
        if (!table[i].empty())
        {
            outlog << "Index " << i << " : ";
            for (auto it = table[i].begin(); it != table[i].end(); ++it)
            {
                outlog << "< " << (*it)->get_name();  
                if ((*it)->get_data_type() != "")
                    outlog << ", " << (*it)->get_data_type();
                
                // Print symbol type (Variable, Array, Function)
                if ((*it)->get_symbol_type() != "")
                    outlog << ", " << (*it)->get_symbol_type();
                
                // If it's an array, print array size
                if ((*it)->get_symbol_type() == "Array")
                    outlog << ", size: " << (*it)->get_array_size();
                
                outlog << " > ";
            }
            outlog << endl;
        }
    }
    outlog << "--------------------------------" << endl;
}

int scope_table::get_scope_id()
{
    return scope_id;
}