### Code generation:
To generate output for a given input, send a post request to http://ADDRESS:PORT/generate and specify these parameters:
- token: The token to authenticate the request
- input: The code that the user has written so far (from the start of the document to the line that the cursor is on, including that line)
- language: The language that the code is being written in, use the extension of the file (examples: C++ would be cpp, C# would be cs, Python would be py, JavaScript would be js, etc.)
- max_length (optional): The max amount of tokens to generate
- temperature (optional): I have no clue what this does, it's used for generating output with GPT-J, unless you know what it does, just leave it out and it'll be defaulted to whatever it is in the config file
- top_p (optional): Same thing as temperature, no clue, if left empty, it's set to the default in the config file

### Response format:
The response format is a json string containing these values:
- success: Success contains a boolean that specifies whether the processing of the request went well or failed, if it's true, it means that everything is fine and you should be able to read the output, if not, take a look at the error value
- error (only present when success is false): When success is false the error value will be set to a json object containing a code and a string giving a basic description of what went wrong
- message (only present when success is true): When success is true the message value will be set to whatever GPT-J outputted after it has been parsed
Examples:
{"success": true, "message": ["abjiwjiodaoijdw"]}
{"success", false, "error": {"code": "MISSING_PARAMETER", "message": "Missing input parameter."}}

### Errors and their meanings (outdated):
When something goes wrong the error value will be set, here is a list of what every error means:
- LANGUAGE_NOT_SUPPORTED: The language specified in the request is not supported by the text processing functions and thus the code for it can not be generated
- TOKEN_INVALID: The token specified in the request is invalid, maybe someone made a typo or maybe the user did not generate a token yet
- TOKEN_DISABLED: The token specified in the request has been disabled because it has been used in a way that is not permitted

### Misc:
- Token format: {Hash function used}.{64 Random characters}.{Hashed email}
- The path to the token file should be stored in an environment variable called `CODEGENX_TOKEN_FILE` and the email and password used to verify users should be in an environment variable called `CODEGENX_EMAIL` and `CODEGENX_EMAIL_PASS`
