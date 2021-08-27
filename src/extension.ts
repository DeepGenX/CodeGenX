/* eslint-disable no-var */
import * as vscode from 'vscode';
import axios from 'axios';

export function activate(context: vscode.ExtensionContext) {

	const command = 'codegenx.getairesponse';	
	var out_lst = ['null'];

	const token_max_length = 512;
	const temp = 1.22;
	const top_p = 0.6;
	const top_k = 40;
	const stop_sequence = "<|endoftext|>";

	/* Get AI Response */
	const getOutput = async function(input: string) {
		const payload = { 'context': input, 'token_max_length': token_max_length, 'temperature': temp, 'top_p': top_p, 'top_k': top_k, 'stop_sequence':stop_sequence};
		const result = await axios.post(`http://api.vicgalle.net:5000/generate`, null, { params: payload });
		//console.log(result.data["compute_time"]);
		return result.data.text;
	};

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


	const files = ['c','cpp','csharp','java','javascript', 'php', 'python', 'SQL', 'HTML'];

	const provider1 = vscode.languages.registerCompletionItemProvider(files, {

		async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

			var editor = vscode.window.activeTextEditor;
			if (editor){
			var cursorPosition = editor.selection.active;
			var input = editor.document.getText(new vscode.Range(0, 0, cursorPosition.line, cursorPosition.character));
			var output = null;
			const comment = '#';
			for (let index = 0; index < out_lst.length; index++) {
				if (input.trim().endsWith(out_lst[index].trim())){
					if (editor.document.lineAt(editor.selection.active.line).text == ''){
					output = out_lst[index+1];
					}
					else {
					output = '\n'+out_lst[index+1];
					}
					//console.log("Loaded");
					break;
				}
			}
			if (output==null){
			var out = await getOutput(input.trim());
			out = out.trim();

			out_lst = break_string(out,comment);
			output = out_lst[0];
			if (editor.document.lineAt(editor.selection.active.line).text != ''){
				output = '\n'+output;
				}
			//console.log("Generated");
			}
			
			const simpleCompletion = new vscode.CompletionItem(output);
			return [simpleCompletion];
			}
		}
	});


	context.subscriptions.push(provider1);
}