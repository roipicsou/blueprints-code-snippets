# Blueprints Code Snippets

Extension VS Code pour sauvegarder, organiser, insérer, afficher et supprimer des extraits de code réutilisables (Blueprints) avec :

- **Vue personnalisée dans l’Activity Bar** regroupant tous les Blueprints par langage (arborescence)
- **Vue plate dans l’Explorer** affichant uniquement les Blueprints du langage du fichier actif
- **Ajout, suppression, insertion** de Blueprints depuis les deux vues
- **Stockage local/global configurable** (choix à chaque ajout)
- **Fonctionnement silencieux** (aucune notification intrusive)
- **Gestion dynamique** selon le langage du fichier actif

## Fonctionnalités principales

- Sauvegardez n’importe quel extrait de code comme Blueprint, avec nom et description
- Organisez vos Blueprints par langage
- Insérez un Blueprint dans l’éditeur en un clic
- Supprimez ou ajoutez des Blueprints depuis l’Activity Bar ou l’Explorer
- Choisissez à chaque ajout si le Blueprint est stocké localement (dans le projet) ou globalement (pour tous vos projets)

## Installation locale

1. **Cloner le dépôt**
   ```sh
   git clone https://github.com/<votre-utilisateur>/blueprints-code-snippets.git
   cd blueprints-code-snippets
   ```
2. **Installer les dépendances et compiler**
   ```sh
   npm install
   npm run compile
   ```
3. **Générer le package VSIX** (optionnel, pour installation manuelle)
   ```sh
   npm install -g @vscode/vsce
   vsce package
   # Puis installer le .vsix dans VS Code
   # code --install-extension blueprints-code-snippets-<version>.vsix
   ```
4. **Ouverture en mode développement**
   - Ouvrez le dossier dans VS Code
   - Appuyez sur F5 pour lancer une nouvelle fenêtre VS Code avec l’extension chargée

## Publication sur GitHub

1. Initialisez un dépôt Git si besoin :
   ```sh
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. Créez un dépôt sur GitHub et poussez :
   ```sh
   git remote add origin https://github.com/<votre-utilisateur>/blueprints-code-snippets.git
   git branch -M main
   git push -u origin main
   ```

## Utilisation

- **Ajouter un Blueprint** :
  - Sélectionnez du code dans l’éditeur
  - Cliquez sur le bouton “Ajouter un Blueprint” dans la vue Blueprints ou Blueprints (Langage)
  - Renseignez le nom, la description, puis choisissez le mode de stockage (local/global)
- **Insérer un Blueprint** :
  - Cliquez sur un Blueprint dans la vue pour l’insérer à l’emplacement du curseur
- **Supprimer un Blueprint** :
  - Clic droit sur un Blueprint > Supprimer

## Configuration

- `blueprints.storageMode` : Définit le mode de stockage par défaut (local ou global). Le choix reste proposé à chaque ajout.

## Contribution

Les contributions sont les bienvenues ! Ouvrez une issue ou une pull request.

---

© 2025 - Blueprints Code Snippets
