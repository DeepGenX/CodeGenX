const vscode = require('vscode');
const axios = require('axios');
const fs = require('fs');
const {
	URLSearchParams
} = require('url');


// Accessing settings from vscode:
const currentDocument = vscode.window.activeTextEditor.document;
const configuration = vscode.workspace.getConfiguration('', currentDocument.uri);
const temp = Number(configuration.get('Codegenx.Temperature', {}));
const top_p = Number(configuration.get('Codegenx.Top_P', {}));
const top_k = Number(configuration.get('Codegenx.Top_K', {}));
const token_max_length_str = String(configuration.get('Codegenx.MaxLength', {}));
const stop_sequence = String(configuration.get('Codegenx.StopSequence', {}));
const enable_selection = Boolean(configuration.get('Codegenx.EnableSelection', {}));

// Converting token_max_length from string to length (128 (fast) -> 128):
const token_max_length = parseInt(token_max_length_str.slice(0,3))
console.log("token_max_length:", token_max_length)

// The comment proxy whcih replaces the hashtag (#)
const comment_proxy = "cgx_hashtag_comment"

function activate(context) {
	let selectedEditor; //The editor to insert the completion into
	let selected_text;

	//A command to open the ClonePilot window
	context.subscriptions.push(vscode.commands.registerCommand('codegenx.open_CodeGenX', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('Please open an editor to use CodeGenX.');
			return;
		}

		const document = editor.document;
		let selection;
		if(enable_selection && !editor.selection.isEmpty) {
			selection = editor.selection;
			console.log(document.getText(selection))
			selected_text = true;
		}

		else if (editor.selection.isEmpty || !enable_selection) { //If nothing is highlited, get the word at the cursor;
  			const cursorPosition = editor.selection.active;
			selection = new vscode.Selection(0,0,cursorPosition.line, cursorPosition.character);
			selected_text = false;
		}

		selectedEditor = editor; //Save to be used when the completion is inserted
		selectedRange = selection;

		console.log("selected_text:",selected_text)
		var word = document.getText(selection); //The word in the selection
		word = word.replaceAll("#", comment_proxy);
		await open_CodeGenX(word.trim());

	}));

	const myScheme = 'clonePilot';
	const textDocumentProvider = new class { //Provides a text document for the window
		async provideTextDocumentContent(uri) {
			const params = new URLSearchParams(uri.query);
			var word = params.get('word');
			if (params.get('loading') === 'true') {
				return `/* CodeGenX is generating the output */\n`;
			}

			try {
				word = word.replaceAll(comment_proxy, "#");
				const payload = { 'context': word, 'token_max_length': token_max_length, 'temperature': temp, 'top_p': top_p, 'top_k': top_k, 'stop_sequence':stop_sequence};

				const result = await axios.post(`http://api.vicgalle.net:5000/generate`, null, {params: payload});
				const content = getGPTText(result.data.text, word);

				return content;
			} catch (err) {
				console.log('Error sending request', err);
				return 'There was an error sending the request\n' + err;
			}
		}
	}();
	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(myScheme, textDocumentProvider));

	//Open the ClonePilot window to display the functions
	const open_CodeGenX = async (word) => {
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
		text = word + text;
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
		var splitted = text.replace(/    /g, "\t").split(/\n\s*\n/);
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
				var s = selectedEditor.selection

				editBuilder.replace(s, fn) //Insert the function into the text
			}).then(success => {
				var postion = selectedEditor.selection.end; 
				selectedEditor.selection = new vscode.Selection(postion, postion);
			});
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
					fn
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