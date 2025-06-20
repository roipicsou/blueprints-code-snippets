# Blueprints Code Snippets

Blueprints Code Snippets est une extension VS Code permettant de sauvegarder, organiser et insérer rapidement des extraits de code réutilisables (Blueprints).

## Fonctionnalités principales
- **Vue personnalisée dans l’Activity Bar** : Accès rapide à vos Blueprints.
- **Filtrage dynamique** : Affiche uniquement les Blueprints du langage du fichier actif.
- **Ajout rapide** : Commande et bouton pour sauvegarder la sélection courante comme Blueprint.
- **Insertion en un clic** : Cliquez sur un Blueprint pour l’insérer à l’emplacement du curseur.
- **Stockage configurable** : Choisissez entre stockage local (.vscode/blueprints) ou global (globalStorage).

## Paramètres de l’extension
- `blueprints.storageMode` :
  - `local` (défaut) : Stocke les Blueprints dans `.vscode/blueprints/` du projet.
  - `global` : Stocke les Blueprints dans le dossier globalStorage de VS Code.

## Commandes
- `blueprints.saveSnippet` : Sauvegarder la sélection comme Blueprint.
- `blueprints.insertSnippet` : Insérer un Blueprint sélectionné.
- `blueprints.refreshView` : Actualiser la vue Blueprints.

## Structure de fichiers
- **Local** : `.vscode/blueprints/<langage>.json`
- **Global** : `globalStorage/<extension-id>/blueprints/<langage>.json`

## Prochaines étapes
- Implémentation de la vue TreeView et des commandes.
- Gestion du stockage et de la configuration.

Pour toute contribution ou suggestion, ouvrez une issue sur le dépôt du projet.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
