/* eslint-disable no-var */

// importing packages:
import * as vscode from 'vscode';
import axios from 'axios';

// The main function which will be called:
export function activate(context: vscode.ExtensionContext) {

	var out_lst = ['null']; 


	// Function to get response from GPT-J
	const getOutput = async function(input: string, token_max_length: number, temp: number, top_p: number, top_k: number,stop_sequence: string) {
		const payload = { 'context': input, 'token_max_length': token_max_length, 'temperature': temp, 'top_p': top_p, 'top_k': top_k, 'stop_sequence':stop_sequence};
		const result = await axios.post(`http://api.vicgalle.net:5000/generate`, null, { params: payload });
		return result.data.text;
	};

	// Function that breaks output text into blocks:
	function break_string(text:string, comment:string) {
		const blocks = [];
	
		while (blocks.join().trim().length < text.trim().length) {
			var out = "";
			const lines = text.split(/\r?\n/);
			for (var i = 0; i < lines.length; i++) {
				if (comment=="\"\"\"" || comment=="'''"){
					out += lines[i] + "\n";
				if (lines[i].trim().endsWith(comment)) {
					break;}
				}
				else{
					out += lines[i] + "\n";
				if (lines[i].trim().startsWith(comment)) {
					break;}}
				}
			blocks.push(out);
	
		}
		return blocks;}

	// Files supported by CodeGenX 
	// (see https://code.visualstudio.com/docs/languages/identifiers#_known-language-identifiers):
	const files = ['c','cpp','csharp','java','javascript', 'php', 'python', 'SQL', 'HTML', 'typescript'];

	// Mapping of file extensions to comments:
	const comment_map = Object({'py':'#', 'cpp':"//", "cs":"//", "java":"//", "js":"//", 'sql':"//", "html":"-->", "htm":"-->", "ts":'//'});

	const provider1 = vscode.languages.registerCompletionItemProvider(files, {

		async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

			var editor = vscode.window.activeTextEditor;
			if (editor){
			
			// Getting text before cursor:
			var cursorPosition = editor.selection.active;
			var input = editor.document.getText(new vscode.Range(0, 0, cursorPosition.line, cursorPosition.character));
			
			// Getting the settings:
			const currentDocument = editor.document;
			const configuration = vscode.workspace.getConfiguration('', currentDocument.uri);

			const temp = Number(configuration.get('Codegenx.Temperature', {}));
			const top_p = Number(configuration.get('Codegenx.Top_P', {}));
			const top_k = Number(configuration.get('Codegenx.Top_K', {}));
			const max_length = Number(configuration.get('Codegenx.MaxLength', {}));
			const stop_sequence = String(configuration.get('Codegenx.StopSequence', {}));


			var output = null;

			const filename = editor.document.uri.fsPath;
			const extension = 	filename.split('.').slice(-1)[0];
			var comment = comment_map[extension];

			if (extension=="py"){
				var temp_input = input.trim();
				var last_line = temp_input.split(/\r?\n/).slice(-1)[0].trim();
				if (last_line.endsWith("\"\"\"")){
					comment = "\"\"\"";
				}
				else if (last_line.endsWith("'''")){
					comment = "'''";
				}}
			

			// Going through the blocks of text in out_lst:
			for (let index = 0; index < out_lst.length; index++) {

				// If there are no changes in the file after the last completion give the next item in out_lst:
				if (input.trim().endsWith(out_lst[index].trim())){

					// Adding newline to output if users cursor is on a line with text:
					if (editor.document.lineAt(editor.selection.active.line).text == ''){
					output = out_lst[index+1];
					output = " "+output;
					}
					else {
					output = '\n'+out_lst[index+1];
					}
					break;
				}
			}

			// If the output is null then run the model again:
			if (output==null){
			var out = await getOutput(input.trim(), max_length, top_p, temp, top_k, stop_sequence);
			out = out.trim();

			// Choose the appropriate comment symbol:
			out_lst = break_string(out,comment);
			output = out_lst[0];

			// Adding newline to output if users cursor is on a line with text:
			if (editor.document.lineAt(editor.selection.active.line).text != ''){
				output = '\n'+output;
				}
			else{
				output = " "+output;
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