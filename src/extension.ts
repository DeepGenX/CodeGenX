/* eslint-disable no-var */

// importing packages:
import * as vscode from 'vscode';
import axios from 'axios';

// The main function which will be called:
export function activate(context: vscode.ExtensionContext) {

	var out_lst = ['null']; 

	// The parameters given to the model
	const token_max_length = 512;
	const temp = 1.22;
	const top_p = 0.6;
	const top_k = 40;
	const stop_sequence = "<|endoftext|>";

	// Function to get response from GPT-J
	const getOutput = async function(input: string) {
		const payload = { 'context': input, 'token_max_length': token_max_length, 'temperature': temp, 'top_p': top_p, 'top_k': top_k, 'stop_sequence':stop_sequence};
		const result = await axios.post(`http://api.vicgalle.net:5000/generate`, null, { params: payload });
		return result.data.text;
	};

	// Function that breaks output text into blocks:
	function break_string(text:string, comment:string) {
		const blocks = [];
		var start = 0;
	
		while (blocks.join("").length < text.length) {
			var out = "";
			const lines = text.split("\n");
			for (var i = start; i < lines.length; i++) {
				out += lines[i] + "\n";
				start += 1;
				if (lines[i].startsWith(comment)) {
					break;
					
				}
			}
			blocks.push(out);
	
		}
		return blocks;}

	// Files supported by CodeGenX 
	// (see https://code.visualstudio.com/docs/languages/identifiers#_known-language-identifiers):
	const files = ['c','cpp','csharp','java','javascript', 'php', 'python', 'SQL', 'HTML'];

	// Mapping of file extensions to comments:
	const comment_map = Object({'py':'#', 'cpp':"//", "cs":"//", "java":"//", "js":"//", 'sql':"//", "html":["-->"], "htm":["-->"]});

	const provider1 = vscode.languages.registerCompletionItemProvider(files, {

		async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

			var editor = vscode.window.activeTextEditor;
			if (editor){
			
			// Getting text before cursor:
			var cursorPosition = editor.selection.active;
			var input = editor.document.getText(new vscode.Range(0, 0, cursorPosition.line, cursorPosition.character));
			
			var output = null;

			const filename = editor.document.uri.fsPath;
			const extension = 	filename.split('.').slice(-1)[0];
			const comment = comment_map[extension];

			// Going through the blocks of text in out_lst:
			for (let index = 0; index < out_lst.length; index++) {

				// If there are no changes in the file after the last completion give the next item in out_lst:
				if (input.trim().endsWith(out_lst[index].trim())){

					// Adding newline to output if users cursor is on a line with text:
					if (editor.document.lineAt(editor.selection.active.line).text == ''){
					output = out_lst[index+1];
					}
					else {
					output = '\n'+out_lst[index+1];
					}
					break;
				}
			}

			// If the output if null then run the model again:
			if (output==null){
			var out = await getOutput(input.trim());
			out = out.trim();

			// Choose the appropriate comment symbol:
			out_lst = break_string(out,comment);
			output = out_lst[0];

			// Adding newline to output if users cursor is on a line with text:
			if (editor.document.lineAt(editor.selection.active.line).text != ''){
				output = '\n'+output;
				}
			}
			
			// Converting the text into a VScode CompletionItem:
			const simpleCompletion = new vscode.CompletionItem(output);

			return [simpleCompletion];
			}
		}
	});

	// Displaying the suggestions to the user:
	context.subscriptions.push(provider1);
}