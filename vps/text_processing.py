from typing import *

COMMENTS = {
    "py": "#", # Python
    "c": "//", # C
    "cpp": "//", # C++
    "cs": "//", # C#
    "java": "//", # Java
    "js": "//", # JavaScript
    "ts": "//", # TypeScript
    "html": "<!--", # HTML
    "css": "/*", # CSS
}

def count_leading_spaces(line: str) -> int:
    "Counts the amount of leading spaces in a line."

    count = 0

    for char in line: # Loop through the characters in the line
        if char == " ": # If we encouter a space, add 1 to the count
            count += 1
        else: # Else, we've run out of leading spaces and we can now stop counting
            break
    
    return count

def text_to_blocks(text: str, comment: str) -> List[str]:
    "Turns text into blocks of text, split by the comments."

    blocks = []
    start = 0

    while len("".join(blocks)) < len(text):
        out = ""

        start_indent = count_leading_spaces(text.splitlines()[start])

        for i, line in enumerate(text.splitlines()[start:]):
            current_indent = count_leading_spaces(line)

            out += line + "\n"
            start += 1

            if line.strip().startswith(comment) and current_indent == start_indent and not all([l.strip().startswith(comment) for l in out.splitlines()]):
                if start + i + 1 < len(text.splitlines()[start:]) and not text.splitlines()[start + i + 1].strip().startswith(comment):
                    break
        
        blocks.append(out)
    
    return blocks

def process_input(input: str, language: str) -> str:
    "Processes the input so that GPT-J can understand it better and generate more relevant text."

    return input.replace("\t", "    ")

def process_output(input: str, output: str, extension: str) -> str:
    "Processes the GPT-J output so that it only contains relevant text."
    
    if "\t" in output:
        output = output.replace("\t", "    ") # Replace tabs with 4 spaces so we know we don't have to deal with both types of indentation
    original_output = output

    last_line = input.splitlines()[-1] # Last line of the input
    start_indent = count_leading_spaces(last_line) # Count the amount of leading spaces in the last line of the input
    
    max_indent = 0
    processed_output = ""
    for line in output.splitlines(): # Loop through the lines in the output
        if line == "" or line.isspace(): # If we get an empty line, skip the checks and just write it to the processed output
            processed_output += line + "\n"
            continue

        current_indent = count_leading_spaces(line) # Get the leading space count of the current line

        if current_indent > max_indent: # Keep track of the maximum indent (leading space count)
            max_indent = current_indent

        if current_indent < start_indent:
            return [processed_output]

        processed_output += line + "\n" # Add the line to the processed output

        if current_indent == start_indent and max_indent != start_indent: # If we're back to the same amount of indentation as the user was at when asking the ai to generate code (and we have been at a higher indentation than that), we know that the ai is done writing the function
            break # Stop looping through the lines

    if len(processed_output.strip()) == len(original_output.strip()) or all([count_leading_spaces(original_output_line) == start_indent for original_output_line in original_output.splitlines()[:2]]): # or we're not writing a function
        return text_to_blocks(original_output, COMMENTS[extension])

    # Add the remaining pieces of code
    processed_output = [processed_output]
    processed_output.extend(process_output(input, original_output[len(processed_output[0]):], extension))

    return processed_output

def process_blocks(blocks: List[str], start_indent: int, comment: str) -> List[str]:
    "Processes blocks of strings to filter out the ones we don't want."

    processed_blocks = []

    for block in blocks:
        processed_block = ""

        for line in block.splitlines():
            if line == "" or line.isspace(): # If we encounter an empty line, add it and continue
                processed_block += line + "\n"
                continue
            
            if line.strip() == "A:" or count_leading_spaces(line) < start_indent: # Stop adding blocks if gpt-j is starting to write an answer ("A:"), or if the current line is indented less than the first one
                processed_blocks.append(processed_block)
                return processed_blocks
            
            processed_block += line + "\n"
        
        processed_blocks.append(processed_block)
    
    return processed_blocks