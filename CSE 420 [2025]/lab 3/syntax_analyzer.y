%{

#include "symbol_table.h"

#define YYSTYPE symbol_info*

extern FILE *yyin;
int yyparse(void);
int yylex(void);
extern YYSTYPE yylval;

// create your symbol table here.
// You can store the pointer to your symbol table in a global variable
// or you can create an object

symbol_table *st;

int lines = 1;
int error_count = 0;

// Track lines with errors to avoid counting multiple errors on same line
set<int> lines_with_errors;

ofstream outlog;
ofstream errout;

// you may declare other necessary variables here to store necessary info
// such as current variable type, variable list, function name, return type, function parameter types, parameters names etc.
string current_type;
string data_type;
int array_size;
vector<string> param_names;
vector<string> param_types;
string current_func_return_type;

// Helper function to report semantic errors
void semantic_error(int line, string message) {
    // Only increment error count if this is the first error on this line
    if(lines_with_errors.find(line) == lines_with_errors.end()) {
        lines_with_errors.insert(line);
    }
    errout << "Error at line no: " << line << " : " << message << endl;
    outlog << "Error at line no: " << line << " : " << message << endl;
}

// Helper function to type check
bool type_compatible(string type1, string type2) {
    if (type1 == type2) return true;    
    return false;
}

// Helper functions for processing variable declarations
vector<string> split(const string& str, char delim) {
    vector<string> tokens;
    stringstream ss(str);
    string token;

    while (getline(ss, token, delim)) {
        tokens.push_back(token);
    }
    return tokens;
}

void process_variable(const string& var, const string& type) {
    size_t open_bracket = var.find('[');
    size_t close_bracket = var.find(']');

    if (open_bracket != string::npos && close_bracket != string::npos && close_bracket > open_bracket + 1) {
        // Array variable
        string array_name = var.substr(0, open_bracket);
        int array_size = stoi(var.substr(open_bracket + 1, close_bracket - open_bracket - 1));

        // Check if variable is already declared in current scope
        symbol_info* existing = st->lookup(array_name);
        if (existing != NULL) {
            semantic_error(lines, "Multiple declaration of variable " + array_name);
            return;
        }

        symbol_info* new_symbol = new symbol_info(array_name, "ID", "Array");
        new_symbol->set_array_size(array_size);
        new_symbol->set_data_type(type);
        st->insert(new_symbol);
    } else {
        // Normal variable
        // Check if variable is already declared in current scope
        symbol_info* existing = st->lookup(var);
        if (existing != NULL) {
            semantic_error(lines, "Multiple declaration of variable " + var);
            return;
        }

        symbol_info* new_symbol = new symbol_info(var, "ID", "Variable");
        new_symbol->set_data_type(type);
        st->insert(new_symbol);
    }
}

void yyerror(char *s)
{
	outlog<<"At line "<<lines<<" "<<s<<endl<<endl;

    // you may need to reinitialize variables if you find an error
    param_names.clear();
    param_types.clear();
}

%}

%token IF ELSE FOR WHILE DO BREAK INT CHAR FLOAT DOUBLE VOID RETURN SWITCH CASE DEFAULT CONTINUE PRINTLN ADDOP MULOP INCOP DECOP RELOP ASSIGNOP LOGICOP NOT LPAREN RPAREN LCURL RCURL LTHIRD RTHIRD COMMA SEMICOLON CONST_INT CONST_FLOAT ID

%nonassoc LOWER_THAN_ELSE
%nonassoc ELSE

%%

start : program
	{
		outlog<<"At line no: "<<lines<<" start : program "<<endl<<endl;
		outlog<<"Symbol Table"<<endl<<endl;
		
		// Print your whole symbol table here
		st->print_all_scopes(outlog);
		outlog<<endl<<endl;
	}
	;

program : program unit
	{
		outlog<<"At line no: "<<lines<<" program : program unit "<<endl<<endl;
		outlog<<$1->get_name()+"\n"+$2->get_name()<<endl<<endl;
		
		$$ = new symbol_info($1->get_name()+"\n"+$2->get_name(),"program");
	}
	| unit
	{
		outlog<<"At line no: "<<lines<<" program : unit "<<endl<<endl;
		outlog<<$1->get_name()<<endl<<endl;
		
		$$ = new symbol_info($1->get_name(),"program");
	}
	;

unit : var_declaration
	 {
		outlog<<"At line no: "<<lines<<" unit : var_declaration "<<endl<<endl;
		outlog<<$1->get_name()<<endl<<endl;
		
		$$ = new symbol_info($1->get_name(),"unit");
	 }
     | func_definition
     {
		outlog<<"At line no: "<<lines<<" unit : func_definition "<<endl<<endl;
		outlog<<$1->get_name()<<endl<<endl;
		
		$$ = new symbol_info($1->get_name(),"unit");
	 }
     ;

func_definition : type_specifier ID LPAREN parameter_list RPAREN
		{
			// Create the function definition in symbol table
			symbol_info* func = new symbol_info($2->get_name(), "ID", "Function");
			func->set_data_type($1->get_name());
			
			// Get the parameter information from parameter_list
			vector<string> param_types = $4->get_param_types();
			vector<string> param_names = $4->get_param_names();
			
			func->set_param_types(param_types);
			func->set_param_names(param_names);
			
			// Check if the function is already declared in the current scope
			// Use the getter method instead of direct access
			symbol_info* existing_func = st->get_current_scope()->lookup($2->get_name());
			if(existing_func != NULL && existing_func->get_symbol_type() == "Function") {
				semantic_error(lines, "Redefinition of function: " + $2->get_name());
			} else {
				st->insert(func);
			}
			
			// Create a new scope for function body
			st->enter_scope();
			outlog << "Entered new scope with ID: " << st->get_current_scope_id() << endl;
			
			// Add parameters to the new scope
			for(size_t i = 0; i < param_types.size(); i++) {
				string param_name = param_names[i];
				if(param_name.empty()) continue; // Skip unnamed parameters
				
				// Check for duplicate parameter names within the parameter list only
				bool duplicate = false;
				for(size_t j = 0; j < i; j++) {
					if(param_names[j] == param_name) {
						semantic_error(lines, "Multiple declaration of variable " + param_name + " in parameter list");
						duplicate = true;
						break;
					}
				}
				
				if(!duplicate) {
					// Add the parameter to the symbol table
					symbol_info* param = new symbol_info(param_name, "ID", "Variable");
					param->set_data_type(param_types[i]);
					st->insert(param);
				}
			}

			// Store the current function's return type for later validation
			if($1->get_name() == "void") {
				current_func_return_type = "void";
			} else {
				current_func_return_type = $1->get_name();
			}
		}
		compound_statement
		{	
			outlog<<"At line no: "<<lines<<" func_definition : type_specifier ID LPAREN parameter_list RPAREN compound_statement "<<endl<<endl;
			outlog<<$1->get_name()<<" "<<$2->get_name()<<"("+$4->get_name()+")\n"<<$7->get_name()<<endl<<endl;
			
			$$ = new symbol_info($1->get_name()+" "+$2->get_name()+"("+$4->get_name()+")\n"+$7->get_name(),"func_def");
		}
		| type_specifier ID LPAREN RPAREN
		{
			// Create the function in symbol table
			symbol_info* func = new symbol_info($2->get_name(), "ID", "Function");
			func->set_data_type($1->get_name());
			func->set_param_types(vector<string>());
			func->set_param_names(vector<string>());
			
			// Check if the function is already declared in the current scope
			symbol_info* existing_func = st->lookup($2->get_name());
			if(existing_func != NULL && existing_func->get_symbol_type() == "Function") {
				semantic_error(lines, "Redefinition of function: " + $2->get_name());
			} else {
				st->insert(func);
			}
			
			// Create a new scope for function body
			st->enter_scope();
			outlog << "Entered new scope with ID: " << st->get_current_scope_id() << endl;

			// Store the current function's return type for later validation
			if($1->get_name() == "void") {
				current_func_return_type = "void";
			} else {
				current_func_return_type = $1->get_name();
			}
		}
		compound_statement
		{
			outlog<<"At line no: "<<lines<<" func_definition : type_specifier ID LPAREN RPAREN compound_statement "<<endl<<endl;
			outlog<<$1->get_name()<<" "<<$2->get_name()<<"()\n"<<$6->get_name()<<endl<<endl;
			
			$$ = new symbol_info($1->get_name()+" "+$2->get_name()+"()\n"+$6->get_name(),"func_def");
		}
 		;

parameter_list : parameter_list COMMA type_specifier ID
		{
 		  	outlog<<"At line no: "<<lines<<" parameter_list : parameter_list COMMA type_specifier ID "<<endl<<endl;
 		  	outlog<<$1->get_name()<<","<<$3->get_name()<<" "<<$4->get_name()<<endl<<endl;
					
			$$ = new symbol_info($1->get_name()+","+$3->get_name()+" "+$4->get_name(),"param_list");
			
			// Check for duplicate parameter names within THIS parameter list only (not across entire scope)
			bool duplicate = false;
			vector<string> param_names = $1->get_param_names();
			for(const auto& param_name : param_names) {
				if(param_name == $4->get_name()) {
					semantic_error(lines, "Multiple declaration of variable " + $4->get_name() + " in parameter list");
					duplicate = true;
					break;
				}
			}
			
            // store the necessary information about the function parameters
			$$->set_param_types($1->get_param_types());
			$$->set_param_names($1->get_param_names());
			$$->add_parameter($3->get_name(), $4->get_name());
		}
		| parameter_list COMMA type_specifier
		{
			outlog<<"At line no: "<<lines<<" parameter_list : parameter_list COMMA type_specifier "<<endl<<endl;
			outlog<<$1->get_name()<<","<<$3->get_name()<<endl<<endl;
			
			$$ = new symbol_info($1->get_name()+","+$3->get_name(),"param_list");
			
            // store the necessary information about the function parameters
            // They will be needed when you want to enter the function into the symbol table

			$$->set_param_types($1->get_param_types());
			$$->set_param_names($1->get_param_names());
			$$->add_parameter($3->get_name(), "");
		}
 		| type_specifier ID
 		{
			outlog<<"At line no: "<<lines<<" parameter_list : type_specifier ID "<<endl<<endl;
			outlog<<$1->get_name()<<" "<<$2->get_name()<<endl<<endl;
			
			$$ = new symbol_info($1->get_name()+" "+$2->get_name(),"param_list");
			
            // store the necessary information about the function parameters
            // They will be needed when you want to enter the function into the symbol table

			$$->add_parameter($1->get_name(), $2->get_name());
		}
		| type_specifier
		{
			outlog<<"At line no: "<<lines<<" parameter_list : type_specifier "<<endl<<endl;
			outlog<<$1->get_name()<<endl<<endl;
			
			$$ = new symbol_info($1->get_name(),"param_list");
			
            // store the necessary information about the function parameters
            // They will be needed when you want to enter the function into the symbol table
			
			$$->add_parameter($1->get_name(), "");
		}
 		;

compound_statement : LCURL statements RCURL
		{
			outlog << "At line no: " << lines << " compound_statement : LCURL statements RCURL " << endl << endl;
			outlog << "{\n" << $2->get_name() << "\n}" << endl << endl;

			$$ = new symbol_info("{\n" + $2->get_name() + "\n}", "comp_stmnt");

			// Print the ID of the scope being removed
			outlog << "Exiting scope with ID: " << st->get_current_scope_id() << endl;
			outlog << "Current state of the symbol table before exiting scope:" << endl;
			st->print_all_scopes(outlog);
			st->exit_scope();
		}
		| LCURL RCURL
		{
			outlog << "At line no: " << lines << " compound_statement : LCURL RCURL " << endl << endl;
			outlog << "{\n}" << endl << endl;

			$$ = new symbol_info("{\n}", "comp_stmnt");

			// Print the ID of the scope being removed
			outlog << "Exiting scope with ID: " << st->get_current_scope_id() << endl;
			outlog << "Current state of the symbol table before exiting scope:" << endl;
			st->print_all_scopes(outlog);
			st->exit_scope();
		}
		;
 		    
var_declaration : type_specifier declaration_list SEMICOLON
{
    outlog << "At line no: " << lines << " var_declaration : type_specifier declaration_list SEMICOLON " << endl << endl;
    outlog << $1->get_name() << " " << $2->get_name() << ";" << endl << endl;

    $$ = new symbol_info($1->get_name() + " " + $2->get_name() + ";", "var_dec");

    data_type = $1->get_name();
    
    // Check if variable type is void
    if (data_type == "void") {
        semantic_error(lines, "variable type can not be void");
    }
    
    string decl_list = $2->get_name();
    size_t start = 0, end;

    while ((end = decl_list.find(',', start)) != string::npos) {
        string var = decl_list.substr(start, end - start);
        process_variable(var, data_type);
        start = end + 1;
    }
    // Process the last variable (or the only one if no commas)
    process_variable(decl_list.substr(start), data_type);
}
;

type_specifier : INT
		{
			outlog<<"At line no: "<<lines<<" type_specifier : INT "<<endl<<endl;
			outlog<<"int"<<endl<<endl;
			
			$$ = new symbol_info("int","type");
	    }
 		| FLOAT
 		{
			outlog<<"At line no: "<<lines<<" type_specifier : FLOAT "<<endl<<endl;
			outlog<<"float"<<endl<<endl;
			
			$$ = new symbol_info("float","type");
	    }
 		| VOID
 		{
			outlog<<"At line no: "<<lines<<" type_specifier : VOID "<<endl<<endl;
			outlog<<"void"<<endl<<endl;
			
			$$ = new symbol_info("void","type");
	    }
 		;

declaration_list : declaration_list COMMA ID
		  {
 		  	outlog<<"At line no: "<<lines<<" declaration_list : declaration_list COMMA ID "<<endl<<endl;
 		  	outlog<<$1->get_name()+","<<$3->get_name()<<endl<<endl;

            // you may need to store the variable names to insert them in symbol table here or later
			$$ = new symbol_info($1->get_name()+","+$3->get_name(),"declaration_list");
 		  }
 		  | declaration_list COMMA ID LTHIRD CONST_INT RTHIRD //array after some declaration
 		  {
 		  	outlog<<"At line no: "<<lines<<" declaration_list : declaration_list COMMA ID LTHIRD CONST_INT RTHIRD "<<endl<<endl;
 		  	outlog<<$1->get_name()+","<<$3->get_name()<<"["<<$5->get_name()<<"]"<<endl<<endl;
			
			current_type = "array";
			array_size = stoi($5->get_name()); // Convert string to int
            // Store array name and size
			$$ = new symbol_info($1->get_name()+","+$3->get_name()+"["+ $5->get_name()+"]","declaration_list");
 		  }
 		  | declaration_list COMMA ID LTHIRD CONST_FLOAT RTHIRD //array after some declaration with float index
 		  {
 		  	outlog<<"At line no: "<<lines<<" declaration_list : declaration_list COMMA ID LTHIRD CONST_FLOAT RTHIRD "<<endl<<endl;
 		  	outlog<<$1->get_name()+","<<$3->get_name()<<"["<<$5->get_name()<<"]"<<endl<<endl;
			
            // Report error for float array size
            semantic_error(lines, "Array size must be an integer, not float");
			
			current_type = "array";
			array_size = 0; // Invalid array size
			$$ = new symbol_info($1->get_name()+","+$3->get_name()+"["+ $5->get_name()+"]","declaration_list");
 		  }
 		  |ID
 		  {
 		  	outlog<<"At line no: "<<lines<<" declaration_list : ID "<<endl<<endl;
			outlog<<$1->get_name()<<endl<<endl;

            // you may need to store the variable names to insert them in symbol table here or later
			$$ = new symbol_info($1->get_name(),"declaration_list");
 		  }
 		  | ID LTHIRD CONST_INT RTHIRD //array
 		  {
 		  	outlog<<"At line no: "<<lines<<" declaration_list : ID LTHIRD CONST_INT RTHIRD "<<endl<<endl;
			outlog<<$1->get_name()<<"["<<$3->get_name()<<"]"<<endl<<endl;

            // Store array name and size
			$$ = new symbol_info($1->get_name()+"["+ $3->get_name()+"]","declaration_list");
 		  }
 		  | ID LTHIRD CONST_FLOAT RTHIRD //array with float index
 		  {
 		  	outlog<<"At line no: "<<lines<<" declaration_list : ID LTHIRD CONST_FLOAT RTHIRD "<<endl<<endl;
			outlog<<$1->get_name()<<"["<<$3->get_name()<<"]"<<endl<<endl;

            semantic_error(lines, "Array size must be an integer, not float");
			
			$$ = new symbol_info($1->get_name()+"["+ $3->get_name()+"]","declaration_list");
 		  }
 		  ;
 		  

statements : statement
	   {
	    	outlog<<"At line no: "<<lines<<" statements : statement "<<endl<<endl;
			outlog<<$1->get_name()<<endl<<endl;
			
			$$ = new symbol_info($1->get_name(),"stmnts");
	   }
	   | statements statement
	   {
	    	outlog<<"At line no: "<<lines<<" statements : statements statement "<<endl<<endl;
			outlog<<$1->get_name()<<"\n"<<$2->get_name()<<endl<<endl;
			
			$$ = new symbol_info($1->get_name()+"\n"+$2->get_name(),"stmnts");
	   }
	   ;
	   
statement : var_declaration
	  {
	    	outlog<<"At line no: "<<lines<<" statement : var_declaration "<<endl<<endl;
			outlog<<$1->get_name()<<endl<<endl;
			
			$$ = new symbol_info($1->get_name(),"stmnt");
	  }
	  | func_definition
	  {
	  		outlog<<"At line no: "<<lines<<" statement : func_definition "<<endl<<endl;
            outlog<<$1->get_name()<<endl<<endl;

            $$ = new symbol_info($1->get_name(),"stmnt");
	  		
	  }
	  | expression_statement
	  {
	    	outlog<<"At line no: "<<lines<<" statement : expression_statement "<<endl<<endl;
			outlog<<$1->get_name()<<endl<<endl;
			
			$$ = new symbol_info($1->get_name(),"stmnt");
	  }
	  | compound_statement
	  {
	    	outlog<<"At line no: "<<lines<<" statement : compound_statement "<<endl<<endl;
			outlog<<$1->get_name()<<endl<<endl;
			
			$$ = new symbol_info($1->get_name(),"stmnt");
	  }
	  | FOR LPAREN expression_statement expression_statement expression RPAREN statement
	  {
	    	outlog<<"At line no: "<<lines<<" statement : FOR LPAREN expression_statement expression_statement expression RPAREN statement "<<endl<<endl;
			outlog<<"for("<<$3->get_name()<<$4->get_name()<<$5->get_name()<<")\n"<<$7->get_name()<<endl<<endl;
			
			$$ = new symbol_info("for("+$3->get_name()+$4->get_name()+$5->get_name()+")\n"+$7->get_name(),"stmnt");
	  }
	  | IF LPAREN expression RPAREN statement %prec LOWER_THAN_ELSE
	  {
	    	outlog<<"At line no: "<<lines<<" statement : IF LPAREN expression RPAREN statement "<<endl<<endl;
			outlog<<"if("<<$3->get_name()<<")\n"<<$5->get_name()<<endl<<endl;
			
			$$ = new symbol_info("if("+$3->get_name()+")\n"+$5->get_name(),"stmnt");
	  }
	  | IF LPAREN expression RPAREN statement ELSE statement
	  {
	    	outlog<<"At line no: "<<lines<<" statement : IF LPAREN expression RPAREN statement ELSE statement "<<endl<<endl;
			outlog<<"if("<<$3->get_name()<<")\n"<<$5->get_name()<<"\nelse\n"<<$7->get_name()<<endl<<endl;
			
			$$ = new symbol_info("if("+$3->get_name()+")\n"+$5->get_name()+"\nelse\n"+$7->get_name(),"stmnt");
	  }
	  | WHILE LPAREN expression RPAREN statement
	  {
	    	outlog<<"At line no: "<<lines<<" statement : WHILE LPAREN expression RPAREN statement "<<endl<<endl;
			outlog<<"while("<<$3->get_name()<<")\n"<<$5->get_name()<<endl<<endl;
			
			$$ = new symbol_info("while("+$3->get_name()+")\n"+$5->get_name(),"stmnt");
	  }
	  | PRINTLN LPAREN ID RPAREN SEMICOLON
	  {
	    	outlog<<"At line no: "<<lines<<" statement : PRINTLN LPAREN ID RPAREN SEMICOLON "<<endl<<endl;
			outlog<<"printf("<<$3->get_name()<<");"<<endl<<endl; 
			
			// Check if the variable exists
			symbol_info* var = st->lookup($3->get_name());
			if(var == NULL) {
				semantic_error(lines, "Undeclared variable " + $3->get_name());
			}
			
			$$ = new symbol_info("printf("+$3->get_name()+");","stmnt");
	  }
	  | RETURN expression SEMICOLON
	  {
	    	outlog<<"At line no: "<<lines<<" statement : RETURN expression SEMICOLON "<<endl<<endl;
			outlog<<"return "<<$2->get_name()<<";"<<endl<<endl;
			
			$$ = new symbol_info("return "+$2->get_name()+";","stmnt");
			
			// Check if return type is compatible with function return type
			if (current_func_return_type == "void" && $2->get_name() != "") {
				semantic_error(lines, "Void function cannot return a value");
			}
			else if (current_func_return_type == "int" && $2->get_data_type() == "float") {
				semantic_error(lines, "Error: Possible loss of precision when returning float from an int function");
			}
	  }
	  ;
	  
expression_statement : SEMICOLON
			{
				outlog<<"At line no: "<<lines<<" expression_statement : SEMICOLON "<<endl<<endl;
				outlog<<";"<<endl<<endl;
				
				$$ = new symbol_info(";","expr_stmt");
	        }			
			| expression SEMICOLON 
			{
				outlog<<"At line no: "<<lines<<" expression_statement : expression SEMICOLON "<<endl<<endl;
				outlog<<$1->get_name()<<";"<<endl<<endl;
				
				$$ = new symbol_info($1->get_name()+";","expr_stmt");
	        }
			;
	  
variable : ID 	
      {
	    outlog<<"At line no: "<<lines<<" variable : ID "<<endl<<endl;
		outlog<<$1->get_name()<<endl<<endl;
			
		$$ = new symbol_info($1->get_name(),"varbl");
		
		// Check if the variable is declared - in ANY scope (includes global scope)
		symbol_info* var = st->lookup($1->get_name());
		if(var == NULL) {
			semantic_error(lines, "Undeclared variable " + $1->get_name());
			$$->set_data_type("error");
		} else {
			$$->set_data_type(var->get_data_type());
			$$->set_symbol_type(var->get_symbol_type());
			
			// Check if it's an array being used without index
			if(var->is_array()) {
				semantic_error(lines, "variable is of array type : " + $1->get_name());
			}
		}
	 }	
	 | ID LTHIRD expression RTHIRD 
	 {
	 	outlog<<"At line no: "<<lines<<" variable : ID LTHIRD expression RTHIRD "<<endl<<endl;
		outlog<<$1->get_name()<<"["<<$3->get_name()<<"]"<<endl<<endl;
		
		$$ = new symbol_info($1->get_name()+"["+$3->get_name()+"]","varbl");
		
		// Check if the array is declared
		symbol_info* var = st->lookup($1->get_name());
		if(var == NULL) {
			semantic_error(lines, "Undeclared variable " + $1->get_name());
			$$->set_data_type("error");
		} else {
			// Check if it's actually an array
			if(!var->is_array()) {
				semantic_error(lines, "variable is not of array type : " + $1->get_name());
				$$->set_data_type(var->get_data_type());
			} else {
				$$->set_data_type(var->get_data_type());
				$$->set_symbol_type("Array");
				
				// Check if index is integer
				if($3->get_data_type() != "int") {
					semantic_error(lines, "array index is not of integer type : " + $1->get_name());
					$$->set_data_type("error"); // Mark as error to prevent further operations
				}
				
				// Check if the index is a float literal by looking for a decimal point
				if($3->get_name().find('.') != string::npos) {
				    semantic_error(lines, "array index is not an integer : " + $1->get_name());
				    $$->set_data_type("error"); // Mark as error to prevent further operations
				}
			}
		}
	 }
	 ;
	 
expression : logic_expression
	   {
	    	outlog<<"At line no: "<<lines<<" expression : logic_expression "<<endl<<endl;
			outlog<<$1->get_name()<<endl<<endl;
			
			$$ = new symbol_info($1->get_name(),"expr");
			$$->set_data_type($1->get_data_type());
	   }
	   | variable ASSIGNOP logic_expression 	
	   {
	    	outlog<<"At line no: "<<lines<<" expression : variable ASSIGNOP logic_expression "<<endl<<endl;
			outlog<<$1->get_name()<<"="<<$3->get_name()<<endl<<endl;

			$$ = new symbol_info($1->get_name()+"="+$3->get_name(),"expr");
			
			// Check if types are compatible
			if($1->get_data_type() != "error" && $3->get_data_type() != "error") {
				string var_type = $1->get_data_type();
				string expr_type = $3->get_data_type();
				string expr_val = $3->get_name();
				
				// Check if the expression is a void function call
				if(expr_type == "void") {
					semantic_error(lines, "Void function used in expression");
					$$->set_data_type("error");
				}
				else if(var_type == "int" && (expr_type == "float" || expr_val.find('.') != string::npos)) {
					semantic_error(lines, "Warning: Assignment of float value into variable of integer type");
					if(lines_with_errors.find(lines) == lines_with_errors.end()) {
						lines_with_errors.insert(lines);
					}
					
					$$->set_data_type(var_type);
				}
				// Handle empty (null) expression values
				else if(expr_type == "") {
					$$->set_data_type(var_type);
				}
				
				// Regular type compatibility check for other cases
				else if(!type_compatible(var_type, expr_type)) {
					semantic_error(lines, "Type mismatch in assignment. " + var_type + " variable cannot be assigned " + expr_type + " value");
					$$->set_data_type(var_type); 
				} 
				else {
					$$->set_data_type(var_type);
				}
			} else {
				$$->set_data_type("error");
			}
	   }
	   ;
			
logic_expression : rel_expression
	     {
	    	outlog<<"At line no: "<<lines<<" logic_expression : rel_expression "<<endl<<endl;
			outlog<<$1->get_name()<<endl<<endl;
			
			$$ = new symbol_info($1->get_name(),"lgc_expr");
			$$->set_data_type($1->get_data_type());
	     }	
		 | rel_expression LOGICOP rel_expression 
		 {
	    	outlog<<"At line no: "<<lines<<" logic_expression : rel_expression LOGICOP rel_expression "<<endl<<endl;
			outlog<<$1->get_name()<<$2->get_name()<<$3->get_name()<<endl<<endl;
			
			$$ = new symbol_info($1->get_name()+$2->get_name()+$3->get_name(),"lgc_expr");
			
			// Result of logical operation should always be int
			$$->set_data_type("int");
	     }	
		 ;
			
rel_expression	: simple_expression
		{
	    	outlog<<"At line no: "<<lines<<" rel_expression : simple_expression "<<endl<<endl;
			outlog<<$1->get_name()<<endl<<endl;
			
			$$ = new symbol_info($1->get_name(),"rel_expr");
			$$->set_data_type($1->get_data_type());
	    }
		| simple_expression RELOP simple_expression
		{
	    	outlog<<"At line no: "<<lines<<" rel_expression : simple_expression RELOP simple_expression "<<endl<<endl;
			outlog<<$1->get_name()<<$2->get_name()<<$3->get_name()<<endl<<endl;
			
			$$ = new symbol_info($1->get_name()+$2->get_name()+$3->get_name(),"rel_expr");
			
			// Result of relational operation should always be int
			$$->set_data_type("int");
	    }
		;
				
simple_expression : term
          {
	    	outlog<<"At line no: "<<lines<<" simple_expression : term "<<endl<<endl;
			outlog<<$1->get_name()<<endl<<endl;
			
			$$ = new symbol_info($1->get_name(),"simp_expr");
			$$->set_data_type($1->get_data_type());
	      }
		  | simple_expression ADDOP term 
		  {
	    	outlog<<"At line no: "<<lines<<" simple_expression : simple_expression ADDOP term "<<endl<<endl;
			outlog<<$1->get_name()<<$2->get_name()<<$3->get_name()<<endl<<endl;
			
			$$ = new symbol_info($1->get_name()+$2->get_name()+$3->get_name(),"simp_expr");
			
			// Type check for ADDOP
			if($1->get_data_type() == "float" || $3->get_data_type() == "float") {
				$$->set_data_type("float");
			} else {
				$$->set_data_type("int");
			}
	      }
		  ;
					
term :	unary_expression
     {
	    	outlog<<"At line no: "<<lines<<" term : unary_expression "<<endl<<endl;
			outlog<<$1->get_name()<<endl<<endl;
			
			$$ = new symbol_info($1->get_name(),"term");
			$$->set_data_type($1->get_data_type());
	 }
     |  term MULOP unary_expression
     {
	    	outlog<<"At line no: "<<lines<<" term : term MULOP unary_expression "<<endl<<endl;
			outlog<<$1->get_name()<<$2->get_name()<<$3->get_name()<<endl<<endl;
			
			$$ = new symbol_info($1->get_name()+$2->get_name()+$3->get_name(),"term");
			
			// Type checks for multiplication, division, and modulus
			string op = $2->get_name();
			
			// Both operands should be integers for modulus
			if(op == "%") {
				if($1->get_data_type() != "int" || $3->get_data_type() != "int") {
					semantic_error(lines, "Modulus operator on non integer type");
					$$->set_data_type("error");
				} else {
					$$->set_data_type("int");
				}
				if($3->get_name() == "0") {
					semantic_error(lines, "Modulus by 0 ");
					$$->set_data_type("error");
				}
			} 
			// Check for division by zero (for constants)
			else if(op == "/" || op == "%") {
				if($3->get_name() == "0") {
					semantic_error(lines, "Division by zero");
					$$->set_data_type("error");
				} 
				else {
					if(op == "/" && ($1->get_data_type() == "float" || $3->get_data_type() == "float")) {
						$$->set_data_type("float");
					} else {
						$$->set_data_type("int");
					}
				}
			}
			// For multiplication
			else {
				if($1->get_data_type() == "float" || $3->get_data_type() == "float") {
					$$->set_data_type("float");
				} else {
					$$->set_data_type("int");
				}
			}
	 }
     ;

unary_expression : ADDOP unary_expression  // un_expr can be void because of factor
		 {
	    	outlog<<"At line no: "<<lines<<" unary_expression : ADDOP unary_expression "<<endl<<endl;
			outlog<<$1->get_name()<<$2->get_name()<<endl<<endl;
			
			$$ = new symbol_info($1->get_name()+$2->get_name(),"un_expr");
	     }
		 | NOT unary_expression 
		 {
	    	outlog<<"At line no: "<<lines<<" unary_expression : NOT unary_expression "<<endl<<endl;
			outlog<<"!"<<$2->get_name()<<endl<<endl;
			
			$$ = new symbol_info("!"+$2->get_name(),"un_expr");
	     }
		 | factor 
		 {
	    	outlog<<"At line no: "<<lines<<" unary_expression : factor "<<endl<<endl;
			outlog<<$1->get_name()<<endl<<endl;
			
			$$ = new symbol_info($1->get_name(),"un_expr");
	     }
		 ;
	
factor	: variable
    {
	    outlog<<"At line no: "<<lines<<" factor : variable "<<endl<<endl;
		outlog<<$1->get_name()<<endl<<endl;
			
		$$ = new symbol_info($1->get_name(),"fctr");
		$$->set_data_type($1->get_data_type());
	}
	| ID LPAREN argument_list RPAREN
	{
	    outlog<<"At line no: "<<lines<<" factor : ID LPAREN argument_list RPAREN "<<endl<<endl;
		outlog<<$1->get_name()<<"("<<$3->get_name()<<")"<<endl<<endl;

		$$ = new symbol_info($1->get_name()+"("+$3->get_name()+")","fctr");
		
		// Check if the function exists
		symbol_info* func = st->lookup($1->get_name());
		if(func == NULL) {
			semantic_error(lines, "Undeclared function: " + $1->get_name());
			$$->set_data_type("error");
		} else {
			// Check if it's actually a function
			if(!func->is_function()) {
				semantic_error(lines, $1->get_name() + " is not a function");
				$$->set_data_type("error");
			} else {
				// Check if it's a void function used in an expression
				if(func->get_data_type() == "void") {
					semantic_error(lines, "operation on void type");
					$$->set_data_type("error");
				} else {
					$$->set_data_type(func->get_data_type());
				}
				
				// Parse arguments
				vector<string> arg_types;
				string args = $3->get_name();
				if(!args.empty()) {
					size_t start = 0, end;
					while((end = args.find(',', start)) != string::npos) {
						arg_types.push_back("int"); // track actual types
						start = end + 1;
					}
					arg_types.push_back("int"); 
				}
				
				// Check number of arguments
				vector<string> param_types = func->get_param_types();
				if(arg_types.size() != param_types.size()) {
					semantic_error(lines, "Inconsistencies in number of arguments in function call: " + $1->get_name());
				}
				
				// Check argument types (simplified)
				for(size_t i = 0; i < min(arg_types.size(), param_types.size()); i++) {
					if(param_types[i] == "int" && arg_types[i] != "int") {
						semantic_error(lines, "argument " + to_string(i+1) + " type mismatch in function call: " + $1->get_name());
					}
				}
			}
		}
	}
	| LPAREN expression RPAREN
	{
	   	outlog<<"At line no: "<<lines<<" factor : LPAREN expression RPAREN "<<endl<<endl;
		outlog<<"("<<$2->get_name()<<")"<<endl<<endl;
		
		$$ = new symbol_info("("+$2->get_name()+")","fctr");
		$$->set_data_type($2->get_data_type());
	}
	| CONST_INT 
	{
	    outlog<<"At line no: "<<lines<<" factor : CONST_INT "<<endl<<endl;
		outlog<<$1->get_name()<<endl<<endl;
			
		$$ = new symbol_info($1->get_name(),"fctr");
		$$->set_data_type("int");
	}
	| CONST_FLOAT
	{
	    outlog<<"At line no: "<<lines<<" factor : CONST_FLOAT "<<endl<<endl;
		outlog<<$1->get_name()<<endl<<endl;
			
		$$ = new symbol_info($1->get_name(),"fctr");
		$$->set_data_type("float");
	}
	| variable INCOP 
	{
	    outlog<<"At line no: "<<lines<<" factor : variable INCOP "<<endl<<endl;
		outlog<<$1->get_name()<<"++"<<endl<<endl;
			
			$$ = new symbol_info($1->get_name()+"++","fctr");
			$$->set_data_type($1->get_data_type());
	}
	| variable DECOP
	{
	    outlog<<"At line no: "<<lines<<" factor : variable DECOP "<<endl<<endl;
		outlog<<$1->get_name()<<"--"<<endl<<endl;
			
			$$ = new symbol_info($1->get_name()+"--","fctr");
			$$->set_data_type($1->get_data_type());
	}
	;
	
argument_list : arguments
			  {
					outlog<<"At line no: "<<lines<<" argument_list : arguments "<<endl<<endl;
					outlog<<$1->get_name()<<endl<<endl;
						
					$$ = new symbol_info($1->get_name(),"arg_list");
			  }
			  |
			  {
					outlog<<"At line no: "<<lines<<" argument_list :  "<<endl<<endl;
					outlog<<""<<endl<<endl;
						
					$$ = new symbol_info("","arg_list");
			  }
			  ;
	
arguments : arguments COMMA logic_expression
		  {
				outlog<<"At line no: "<<lines<<" arguments : arguments COMMA logic_expression "<<endl<<endl;
				outlog<<$1->get_name()<<","<<$3->get_name()<<endl<<endl;
						
				$$ = new symbol_info($1->get_name()+","+$3->get_name(),"arg");
		  }
	      | logic_expression
	      {
				outlog<<"At line no: "<<lines<<" arguments : logic_expression "<<endl<<endl;
				outlog<<$1->get_name()<<endl<<endl;
						
				$$ = new symbol_info($1->get_name(),"arg");
	      }
	      ;
 

%%

int main(int argc, char *argv[])
{
	if(argc != 2) 
	{
		cout<<"Please provide input file name"<<endl;
		return 0;
	}
	yyin = fopen(argv[1], "r");
	
	// Extract student ID from filename and create output file names
	string inputfile = argv[1];
	
	outlog.open("log.txt", ios::trunc);
	errout.open("error.txt", ios::trunc);
	
	if(yyin == NULL)
	{
		cout<<"Couldn't open input file"<<endl;
		return 0;
	}
	// Enter the global or the first scope here
	st = new symbol_table(10);
	st->enter_scope();
	outlog << "Entered new scope with ID: " << st->get_current_scope_id() << endl;

	yyparse();
	
	// Reset error count based on unique lines with errors
	error_count = lines_with_errors.size();

	outlog<<endl<<"Total lines: "<<lines<<endl;
	outlog<<"Total error lines: "<<error_count<<endl;

	// Add error count to error file too
	errout<<endl<<"Total error lines: "<<error_count<<endl;
	
	outlog.close();
	errout.close();
	
	fclose(yyin);
	
	return 0;
}