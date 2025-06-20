// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Blueprint data structure
interface Blueprint {
	name: string;
	description: string;
	content: string;
	language: string;
}

// TreeItem for Blueprint
class BlueprintTreeItem extends vscode.TreeItem {
	constructor(
		public readonly blueprint: Blueprint
	) {
		super(blueprint.name, vscode.TreeItemCollapsibleState.None);
		this.tooltip = `${blueprint.name}\n${blueprint.description}\n\n${blueprint.content}`;
		this.description = blueprint.description;
		this.contextValue = 'blueprint';
		// Suppression de la commande showCode pour éviter la boîte de dialogue
	}
}

// TreeDataProvider for Blueprints
class BlueprintsProvider implements vscode.TreeDataProvider<BlueprintTreeItem | vscode.TreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<BlueprintTreeItem | undefined | void> = new vscode.EventEmitter<BlueprintTreeItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<BlueprintTreeItem | undefined | void> = this._onDidChangeTreeData.event;

	private blueprints: Blueprint[] = [];

	refresh(blueprints: Blueprint[]): void {
		this.blueprints = blueprints;
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: BlueprintTreeItem | vscode.TreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: vscode.TreeItem): Thenable<(BlueprintTreeItem | vscode.TreeItem)[]> {
		if (!element) {
			// Racine : retourne un TreeItem par langage
			const languages = Array.from(new Set(this.blueprints.map(bp => bp.language)));
			return Promise.resolve(languages.map(lang => {
				const item = new vscode.TreeItem(lang, vscode.TreeItemCollapsibleState.Collapsed);
				item.contextValue = 'blueprint-language';
				return item;
			}));
		} else if (element instanceof vscode.TreeItem && element.collapsibleState === vscode.TreeItemCollapsibleState.Collapsed) {
			// Enfants : retourne les Blueprints du langage
			const lang = element.label as string;
			return Promise.resolve(this.blueprints.filter(bp => bp.language === lang).map(bp => new BlueprintTreeItem(bp)));
		}
		return Promise.resolve([]);
	}

	public getBlueprints(): Blueprint[] {
		return this.blueprints;
	}
}

function getStoragePaths(context: vscode.ExtensionContext, languageId: string): { dir: string, file: string } {
	const config = vscode.workspace.getConfiguration('blueprints');
	const storageMode = config.get<'local' | 'global'>('storageMode', 'local');
	let dir: string;
	if (storageMode === 'global') {
		dir = path.join(context.globalStorageUri.fsPath, 'blueprints');
	} else {
		const wsFolders = vscode.workspace.workspaceFolders;
		dir = wsFolders && wsFolders.length > 0
			? path.join(wsFolders[0].uri.fsPath, '.vscode', 'blueprints')
			: '';
	}
	const file = path.join(dir, `${languageId}.json`);
	return { dir, file };
}

async function loadBlueprints(context: vscode.ExtensionContext, languageId: string): Promise<Blueprint[]> {
	const { file } = getStoragePaths(context, languageId);
	try {
		if (fs.existsSync(file)) {
			const data = fs.readFileSync(file, 'utf8');
			return JSON.parse(data);
		}
	} catch (e) {
		console.error('Erreur de lecture des blueprints:', e);
	}
	return [];
}

async function saveBlueprints(context: vscode.ExtensionContext, languageId: string, blueprints: Blueprint[]): Promise<void> {
	const { dir, file } = getStoragePaths(context, languageId);
	try {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		fs.writeFileSync(file, JSON.stringify(blueprints, null, 2), 'utf8');
	} catch (e) {
		console.error('Erreur d\'écriture des blueprints:', e);
	}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "blueprints-code-snippets" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('blueprints-code-snippets.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Blueprints Code Snippets!');
	});

	context.subscriptions.push(disposable);

	const blueprintsProvider = new BlueprintsProvider();
	// Charge tous les blueprints de tous les langages
	async function loadAllBlueprints(context: vscode.ExtensionContext): Promise<Blueprint[]> {
		const wsFolders = vscode.workspace.workspaceFolders;
		let dir = '';
		if (wsFolders && wsFolders.length > 0) {
			dir = path.join(wsFolders[0].uri.fsPath, '.vscode', 'blueprints');
		} else {
			dir = path.join(context.globalStorageUri.fsPath, 'blueprints');
		}
		if (!fs.existsSync(dir)) { return []; }
		const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
		let all: Blueprint[] = [];
		for (const file of files) {
			try {
				const data = fs.readFileSync(path.join(dir, file), 'utf8');
				const blueprints: Blueprint[] = JSON.parse(data);
				all = all.concat(blueprints);
			} catch {}
		}
		return all;
	}
	loadAllBlueprints(context).then(blueprints => blueprintsProvider.refresh(blueprints));
	const blueprintsView = vscode.window.createTreeView('blueprintsView', { treeDataProvider: blueprintsProvider });

	// Insertion d'un Blueprint au clic
	const insertBlueprintDisposable = vscode.commands.registerCommand('blueprints.insertSnippet', async (item: BlueprintTreeItem) => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		const snippet = new vscode.SnippetString(item.blueprint.content);
		editor.insertSnippet(snippet, editor.selection.start);
		// Notification supprimée
	});
	context.subscriptions.push(insertBlueprintDisposable);

	// Ajout du handler sur l'item de la TreeView
	blueprintsView.onDidChangeSelection(e => {
		const item = e.selection[0];
		if (item) {
			// Suppression de reveal pour éviter l'erreur, simple insertion
			vscode.commands.executeCommand('blueprints.insertSnippet', item);
		}
	});

	// Actualisation dynamique lors du changement de fichier actif
	vscode.window.onDidChangeActiveTextEditor(async (editor) => {
		const languageId = editor?.document.languageId || 'plaintext';
		const blueprints = await loadBlueprints(context, languageId);
		blueprintsProvider.refresh(blueprints);
	}, null, context.subscriptions);

	// Commande pour ajouter un Blueprint
	const addBlueprintDisposable = vscode.commands.registerCommand('blueprints.saveSnippet', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);
		if (!selectedText) {
			return;
		}
		const name = await vscode.window.showInputBox({ prompt: 'Nom du Blueprint' });
		if (!name) { return; }
		const description = await vscode.window.showInputBox({ prompt: 'Description du Blueprint' });
		if (description === undefined) { return; }
		const language = editor.document.languageId;
		const storageMode = await vscode.window.showQuickPick(['local', 'global'], { placeHolder: 'Où souhaitez-vous sauvegarder ce Blueprint ?' });
		if (!storageMode) { return; }
		const blueprint: Blueprint = { name, description, content: selectedText, language };
		const currentBlueprints = blueprintsProvider.getBlueprints();
		const newBlueprints = [...currentBlueprints, blueprint];
		await saveBlueprintsWithMode(context, language, newBlueprints, storageMode as 'local' | 'global');
		blueprintsProvider.refresh(newBlueprints);
		// Notification supprimée
	});
	context.subscriptions.push(addBlueprintDisposable);

	// TreeView secondaire pour l'explorer : Blueprints (Langage)
	class BlueprintsLanguageProvider implements vscode.TreeDataProvider<BlueprintTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<BlueprintTreeItem | undefined | void> = new vscode.EventEmitter<BlueprintTreeItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<BlueprintTreeItem | undefined | void> = this._onDidChangeTreeData.event;

	private blueprints: Blueprint[] = [];
	private currentLanguage: string = 'plaintext';

	refresh(blueprints: Blueprint[], language: string): void {
		this.blueprints = blueprints;
		this.currentLanguage = language;
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: BlueprintTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(): Thenable<BlueprintTreeItem[]> {
		if (!this.currentLanguage) {
			return Promise.resolve([]);
		}
		const filtered = this.blueprints.filter(bp => bp.language === this.currentLanguage);
		return Promise.resolve(filtered.map(bp => new BlueprintTreeItem(bp)));
	}

	public getBlueprints(): Blueprint[] {
		return this.blueprints;
	}
}

	// Remplace le provider de la vue secondaire par la version non-arborescente
	const blueprintsLanguageProvider = new BlueprintsLanguageProvider();
	let explorerLanguageId = vscode.window.activeTextEditor?.document.languageId || 'plaintext';
	loadBlueprints(context, explorerLanguageId).then(blueprints => blueprintsLanguageProvider.refresh(blueprints, explorerLanguageId));
	const blueprintsLanguageView = vscode.window.createTreeView('blueprintsLanguageView', { treeDataProvider: blueprintsLanguageProvider });
	blueprintsLanguageView.onDidChangeSelection((e: vscode.TreeViewSelectionChangeEvent<BlueprintTreeItem>) => {
		const item = e.selection[0];
		if (item) {
			vscode.commands.executeCommand('blueprints.insertSnippet', item);
		}
	});

	vscode.window.onDidChangeActiveTextEditor(async (editor) => {
		const languageId = editor?.document.languageId || 'plaintext';
		explorerLanguageId = languageId;
		const blueprints = await loadBlueprints(context, languageId);
		blueprintsLanguageProvider.refresh(blueprints, languageId);
	}, null, context.subscriptions);

	// Insertion d'un Blueprint depuis la vue secondaire
	const insertFromLanguageViewDisposable = vscode.commands.registerCommand('blueprints.insertSnippetFromLanguageView', async (item: BlueprintTreeItem) => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		const snippet = new vscode.SnippetString(item.blueprint.content);
		editor.insertSnippet(snippet, editor.selection.start);
		// Notification supprimée
	});
	context.subscriptions.push(insertFromLanguageViewDisposable);

	// Commande pour supprimer un Blueprint
	const deleteBlueprintDisposable = vscode.commands.registerCommand('blueprints.deleteSnippet', async (item: BlueprintTreeItem) => {
		const languageId = vscode.window.activeTextEditor?.document.languageId || 'plaintext';
		const currentBlueprints = blueprintsProvider.getBlueprints();
		const filtered = currentBlueprints.filter(bp => bp.name !== item.blueprint.name || bp.description !== item.blueprint.description || bp.content !== item.blueprint.content);
		await saveBlueprints(context, languageId, filtered);
		blueprintsProvider.refresh(filtered);
		// Notification supprimée
	});
	context.subscriptions.push(deleteBlueprintDisposable);

	// Ajout d'une commande pour ajouter un Blueprint depuis la vue Explorer
	const addBlueprintFromExplorerDisposable = vscode.commands.registerCommand('blueprints.saveSnippetFromExplorer', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);
		if (!selectedText) {
			return;
		}
		const name = await vscode.window.showInputBox({ prompt: 'Nom du Blueprint' });
		if (!name) { return; }
		const description = await vscode.window.showInputBox({ prompt: 'Description du Blueprint' });
		if (description === undefined) { return; }
		const language = editor.document.languageId;
		const storageMode = await vscode.window.showQuickPick(['local', 'global'], { placeHolder: 'Où souhaitez-vous sauvegarder ce Blueprint ?' });
		if (!storageMode) { return; }
		const blueprint: Blueprint = { name, description, content: selectedText, language };
		const currentBlueprints = blueprintsLanguageProvider.getBlueprints();
		const newBlueprints = [...currentBlueprints, blueprint];
		await saveBlueprintsWithMode(context, language, newBlueprints, storageMode as 'local' | 'global');
		blueprintsLanguageProvider.refresh(newBlueprints, language);
		// Notification supprimée
	});
	context.subscriptions.push(addBlueprintFromExplorerDisposable);

	// Ajout d'une commande pour supprimer un Blueprint depuis la vue Explorer
	const deleteBlueprintFromExplorerDisposable = vscode.commands.registerCommand('blueprints.deleteSnippetFromExplorer', async (item: BlueprintTreeItem) => {
		const languageId = vscode.window.activeTextEditor?.document.languageId || 'plaintext';
		const currentBlueprints = blueprintsLanguageProvider.getBlueprints();
		const filtered = currentBlueprints.filter(bp => bp.name !== item.blueprint.name || bp.description !== item.blueprint.description || bp.content !== item.blueprint.content);
		await saveBlueprints(context, languageId, filtered);
		blueprintsLanguageProvider.refresh(filtered, languageId);
		// Notification supprimée
	});
	context.subscriptions.push(deleteBlueprintFromExplorerDisposable);

	// Nouvelle fonction utilitaire pour sauvegarder selon le mode choisi
	async function saveBlueprintsWithMode(context: vscode.ExtensionContext, languageId: string, blueprints: Blueprint[], storageMode: 'local' | 'global') {
		const config = vscode.workspace.getConfiguration('blueprints');
		const originalMode = config.get<'local' | 'global'>('storageMode', 'local');
		// On force le mode pour cette sauvegarde
		const getStoragePathsCustom = (context: vscode.ExtensionContext, languageId: string): { dir: string, file: string } => {
			let dir: string;
			if (storageMode === 'global') {
				dir = path.join(context.globalStorageUri.fsPath, 'blueprints');
			} else {
				const wsFolders = vscode.workspace.workspaceFolders;
				dir = wsFolders && wsFolders.length > 0
					? path.join(wsFolders[0].uri.fsPath, '.vscode', 'blueprints')
					: '';
			}
			const file = path.join(dir, `${languageId}.json`);
			return { dir, file };
		};
		const { dir, file } = getStoragePathsCustom(context, languageId);
		try {
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true });
			}
			fs.writeFileSync(file, JSON.stringify(blueprints, null, 2), 'utf8');
		} catch (e) {
			console.error('Erreur d\'écriture des blueprints:', e);
		}
	}
}

// This method is called when your extension is deactivated
export function deactivate() { }
