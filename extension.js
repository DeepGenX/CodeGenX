const vscode = require('vscode');
const axios = require('axios');
const {
	URLSearchParams
} = require('url');

const token_max_length = 512;
const temp = 1.0;
const top_p = 0.6;
const top_k = 40;

function activate(context) {
	let selectedEditor; //The editor to insert the completion into
	let selectedRange; //The range to insert the completion into

	//A command to open the ClonePilot window
	context.subscriptions.push(vscode.commands.registerCommand('codegenx.open_CodeGenX', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('Please open an editor to use ClonePilot.');
			return;
		}

		const document = editor.document;
		let selection = editor.selection;

		if (editor.selection.isEmpty) { //If nothing is highlited, get the word at the cursor
			const cursorWordRange = editor.document.getWordRangeAtPosition(editor.selection.active);
			if (!cursorWordRange) {
				vscode.window.showInformationMessage('Please select or place your cursor on a word to use ClonePilot');
				return; //Cursor not on a word
			}
			selection = new vscode.Selection(0, 0, cursorWordRange.end.line, cursorWordRange.end.character);
		}

		selectedEditor = editor; //Save to be used when the completion is inserted
		selectedRange = selection;

		const word = document.getText(selection); //The word in the selection
		console.log("word: " + word);
		await openClonePilot(word);

	}));

	const myScheme = 'clonePilot';
	const textDocumentProvider = new class { //Provides a text document for the window
		async provideTextDocumentContent(uri) {
			const params = new URLSearchParams(uri.query);
			const word = params.get('word');
			if (params.get('loading') === 'true') {
				return `/* CodeGenX is generating the output */\n`;
			}

			try {
				const payload = { 'context': word, 'token_max_length': token_max_length, 'temperature': temp, 'top_p': top_p, 'top_k': top_k};
				const result = await axios.post(`http://api.vicgalle.net:5000/generate`, null, {params: payload});
				const content = getGPTText(result.data.text, word);
				// const response = await axios.get(`https://clone-pilot.herokuapp.com/getFunction/${word}`); //Get the functions for that word
				// const fns = response.data.sort((a, b) => b.postScore - a.postScore); //Show the highest score first
				// const content = getClonePilotText(fns, word);
				// console.log(content);

				return content;
			} catch (err) {
				console.log('Error sending request', err);
				return 'There was an error sending the request\n' + err;
			}
		}
	}();
	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(myScheme, textDocumentProvider));

	//Open the ClonePilot window to display the functions
	const openClonePilot = async (word) => {
		//A uri to send to the document
		let loadingUri = vscode.Uri.parse(`${myScheme}:Clone Pilot?word=${word}&loading=true`, true);
		await showUri(loadingUri); //Open a loading window
		let uri = vscode.Uri.parse(`${myScheme}:Clone Pilot?word=${word}&loading=false`, true);
		//TODO If the uri has already been loaded, the codelense breaks
		await showUri(uri); //Show the actual content, once got from the server
	}

	const showUri = async (uri) => {
		const doc = await vscode.workspace.openTextDocument(uri); //Calls back into the provider
		await vscode.window.showTextDocument(doc, {
			viewColumn: vscode.ViewColumn.Beside,
			preview: true, //Don't replace the current window
			preserveFocus: true,
		});
		vscode.languages.setTextDocumentLanguage(doc, 'python'); //Enables syntax highlighting
	}

	const getGPTText = (text, word) => {
		codelensProvider.clearPositions();
		let content = `/* CodeGenX is suggesting the following */\n\n`;
		// content += word;
		// let splitted_text = text.split("\n\n"); //maybe use scopes to split the generated to text
		text = word + text;
		console.log("text: " + text);
		let splitted_text = splitCode(text);
		for (let i = 0; i < splitted_text.length; i++) {
			const lineNum = content.split('\n').length; //The line to insert the codelens on
			codelensProvider.addPosition(lineNum, splitted_text[i]); //Add a codelens on that line
			content += splitted_text[i]; //Display the entire function in the ClonePilot window
			if (i < splitted_text.length - 1) content += '\n\n';
		}
		return content;
	}

	const splitCode = (text) => {
		var splitted = text.replace(/    /g, "\t").split("\n");
		var result = [];
		var final_result = [];
		var temp = "";
		var scope = false;
		var comment_scope = false;

		for (const element of splitted) {
			if (element == "") {
				continue
			}
			if(!scope && !comment_scope) {
				if (element.startsWith("def") || element.startsWith("class")) {
					if (temp != "" && !element.startsWith("@")) {
						result.push(temp);
						temp = "";
					}
					temp += element;
					temp += "\n";
					scope = true;
					continue;
				} else if(element.startsWith("#")) {
					if (temp != "") {
						result.push(temp);
						temp = "";
					}
					temp += element;
					temp += "\n";
					comment_scope = true;
					continue
				}
			}
			if (scope) {
				if (element.startsWith("\t")) {
					temp += element;
					temp += "\n";
					continue
				} else if(element.startsWith("def") || element.startsWith("class") || element.startsWith("@")) {
					if (temp.startsWith("@")) {
						temp += element;
						temp += "\n";
						continue
					}
					result.push(temp);
					temp = element;
					temp += "\n";
					continue
				} else {
					scope = false;
					result.push(temp);
					temp = element;
					temp += "\n";
					continue
				}
			} else if(comment_scope) {
				if(element.startsWith("def") || element.startsWith("class") || element.startsWith("@") || element.startsWith("#")) {
					comment_scope = false;
					result.push(temp);
					temp = element;
					temp += "\n";
					continue
				} else {
					temp += element;
					temp += "\n";
					continue
				}
			}
			temp += element;
			temp += "\n"
		}
		if(temp != "") {
			result.push(temp)
		}
		for (const element of result) {
			if (!(element in ["\r\n", "\n\r", "\r", "\n", "\n\n"])) {
				final_result.push(element);
			}
		}
		console.log(final_result);
		return final_result;
	}

	//When the user clicks on a codelens for a function
	context.subscriptions.push(vscode.commands.registerCommand('clone-pilot.chooseOption', fn => {
		if (!selectedEditor) return;
		try {
			selectedEditor.edit(editBuilder => {
				// const formatted = formatFunction(fn);
				// editBuilder.replace(selectedRange, beautify(formatted.header + formatted.body, beautifyOptions)); //Insert the function into the text
				// var editor = vscode.window.activeTextEditor;
				// var lastLine = editor.document.lineAt(editor.document.lineCount - 1);
				// let s = new vscode.Selection(lastLine.range.end, lastLine.range.end);

				// const cursorWordRange = selectedEditor.document.getWordRangeAtPosition(selectedEditor.selection.active);
				// console.log(cursorWordRange.start.line, cursorWordRange.start.character, cursorWordRange.end.line, cursorWordRange.end.character)
				// console.log(selectedEditor.selection.active)
				var s = selectedEditor.selection

				editBuilder.replace(s, fn); //Insert the function into the text
			});
			// Close the ClonePilot window. The hide function is deprecated, so it must be shown then closed as the active editor.
			// vscode.window.showTextDocument(myScheme, {
			// 		preview: true,
			// 		preserveFocus: false
			// 	})
			// 	.then(() => {
			// 		return vscode.commands.executeCommand('workbench.action.closeActiveEditor');
			// 	});
		} catch (e) {
			//The editor isn't open
		}
	}));

	const codelensProvider = new class { //Keeps track of and provides codelenses
		constructor() {
			this.codelenses = [];
		}
		addPosition(lineNum, fn) {
			const range = new vscode.Range(lineNum, 0, lineNum, 0); //Display it on that line
			this.codelenses.push(new vscode.CodeLens(range, {
				title: 'Use code',
				command: 'clone-pilot.chooseOption',
				arguments: [
					fn + '\n\n'
				],
				tooltip: 'Insert this snippet into your code'
			}));
		}
		clearPositions() {
			this.codelenses = [];
		}

		provideCodeLenses(document) {
			return this.codelenses;
		}

		//TODO Use resolveCodeLens() instead of making the command in addPosition?
	}();
	context.subscriptions.push(vscode.languages.registerCodeLensProvider({
		scheme: myScheme //Only adds codelens to ClonePilot windows
	}, codelensProvider));
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}