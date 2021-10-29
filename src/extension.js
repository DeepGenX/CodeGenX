/* TODO LIST
- Display errors when the api returns an error
- Clean up this code
*/


const vscode = require('vscode');
const axios = require('axios');
const fs = require('fs');
const {
	URLSearchParams
} = require('url');
const { config } = require('process');

const website = "https://deepgenx.com/codegenx"

// Accessing settings from vscode:
const currentDocument = vscode.window.activeTextEditor.document;
const configuration = vscode.workspace.getConfiguration('', currentDocument.uri);
const temp = Number(configuration.get('Codegenx.Temperature', {}));
const top_p = Number(configuration.get('Codegenx.Top_P', {}));
const token = String(configuration.get('Codegenx.Token', {}));
const token_max_length_str = String(configuration.get('Codegenx.MaxLength', {}));
const enable_selection = Boolean(configuration.get('Codegenx.EnableSelection', {}));

// Converting token_max_length from string to length (128 (fast) -> 128):
const token_max_length = parseInt(token_max_length_str)
console.log("token_max_length:", token_max_length)

// The comment proxy whcih replaces the hashtag (#)
const comment_proxy = "cgx_hashtag_comment"

async function activate(context) {
	let selectedEditor; //The editor to insert the completion into
	let selected_text;

	// vscode.window.showInformationMessage("Token length: " + token.length);

	if (token == "")
	{
		vscode.window.showInformationMessage("It looks like you do not have an API token. You can go to "+website+" for instructions on how to get one.")
	}

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
			console.log(document.getText(selection))
			selected_text = false;
		}

		selectedEditor = editor; //Save to be used when the completion is inserted
		selectedRange = selection;

		var language = {
			"python": "py",
			"javascript": "js"
		}[document.languageId]; // TODO: Figure out a way to actually get the extension and not just the language name

		console.log("selected_text:",selected_text)
		var word = document.getText(selection); //The word in the selection
		word = word.replaceAll("#", comment_proxy);
		await open_CodeGenX(word.trim(), language);

	}));

	const myScheme = 'clonePilot';
	const textDocumentProvider = new class { //Provides a text document for the window
		async provideTextDocumentContent(uri) {
			const params = new URLSearchParams(uri.query);
			if (params.get('loading') === 'true') {
				return `/* CodeGenX is generating the output */\n`;
			}

			var word = params.get('word');
			var language = params.get('lang');

			try {
				word = word.replaceAll(comment_proxy, "#");
				const payload = { 'input': word, 'max_length': token_max_length, 'temperature': temp, 'top_p': top_p, 'token': token, 'language': language};

				const result = await axios.post(`https://api.deepgenx.com/generate`, payload);
				const content = getGPTText(result.data.message);

				return content + "\n" + getSOText(result.data.text);
			} catch (err) {
				console.log('Error sending request', err);
				return 'There was an error sending the request\n' + err;
			}
		}
	}();
	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(myScheme, textDocumentProvider));

	//Open the ClonePilot window to display the functions
	const open_CodeGenX = async (word, language) => {
		//A uri to send to the document
		let loadingUri = vscode.Uri.parse(`${myScheme}:Clone Pilot?word=${word}&lang=${language}&loading=true`, true);
		await showUri(loadingUri); //Open a loading window
		let uri = vscode.Uri.parse(`${myScheme}:Clone Pilot?word=${word}&lang=${language}&loading=false`, true);
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

	const getGPTText = (text) => {
		codelensProvider.clearPositions();
		let content = `/* CodeGenX is suggesting the following */\n\n`;
		let splitted_text = eval(text);
		for (let i = 0; i < splitted_text.length; i++) {
			const lineNum = content.split('\n').length; //The line to insert the codelens on
			codelensProvider.addPosition(lineNum, splitted_text[i]); //Add a codelens on that line
			content += splitted_text[i]; //Display the entire function in the ClonePilot window
			if (i < splitted_text.length - 1) content += '\n\n';
		}
		return content;
	}

	const getSOText = (text) => {
		let content = `/* Stack Overflow Answers */\n\nWORK IN PROGRESS`;

		// Do stuff

		return content;
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
