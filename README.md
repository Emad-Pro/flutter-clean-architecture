# Flutter EA Toolkit: Arch & Snippets 🚀

<div align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=flutter-clean-architecture.flutter-easy-arch">
    <img src="https://img.shields.io/visual-studio-marketplace/v/flutter-clean-architecture.flutter-easy-arch?color=00B4AB&label=VS%20Code&logo=visual-studio-code&style=for-the-badge" alt="VS Code Extension">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=flutter-clean-architecture.flutter-easy-arch">
    <img src="https://img.shields.io/visual-studio-marketplace/i/flutter-clean-architecture.flutter-easy-arch?color=0078d7&logo=visual-studio-code&style=for-the-badge" alt="Installs">
  </a>
</div>

<br/>

**The ultimate, enterprise-level VS Code ecosystem for Flutter developers and teams.** Automate your workflow, enforce clean code standards, and generate production-ready architectures (Clean Architecture, MVVM, MVC, MVP) in seconds. Stop writing boilerplate, utilize smart snippets, and start focusing on your business logic.

---

## ✨ Key Features

* 🏗️ **Generate Core Architecture:** Initialize a robust project foundation from scratch with one click. Generates folders and boilerplate for Theme, Network (Dio), Errors, Constants, and Dependency Injection.
* 🚀 **Generate Features:** Instantly generate complete feature directories (Data, Domain, Presentation) with fully wired boilerplate code.
* ⌨️ **EA Smart Snippets (NEW):** Over 15+ built-in enterprise Dart snippets. Just type "ea-" to instantly generate Repositories, UseCases, Bloc States, Models, and GetIt locators with multi-cursor support.
* 🧠 **State Management Integration:** Out-of-the-box support for **Bloc, Cubit, Riverpod, GetX, and Provider**. It automatically generates the required state files and wires them to your UI.
* 🧪 **TDD Ready:** Automatically generates parallel test/ folder structures with pre-configured unit test files for your UseCases and Repositories.
* 💉 **Smart Dependency Injection:** Auto-generates get_it service locator files for each feature, automatically registering your Blocs, UseCases, Repositories, and DataSources.
* 📦 **Auto Package Installation:** Opens the integrated terminal and safely runs "flutter pub add" for required dependencies (e.g., flutter_bloc, equatable, dio, get_it) based on your selections.
* ⚙️ **Highly Customizable:** Set your team's default architecture and state management in VS Code Settings to bypass prompts and generate features instantly.

---

## 🛠️ How to Use

### 1. Initialize Core Architecture (For New Projects)
Right-click on your "lib" folder in the VS Code Explorer and select:
**Flutter EA: Init Core Architecture (From Scratch)**

This will generate the foundational structure:

    lib/
    └── core/
        ├── constants/      # API Endpoints, App Strings
        ├── di/             # Global Dependency Injection (get_it)
        ├── errors/         # Failures & Exceptions
        ├── localization/   # Multi-language setup
        ├── network/        # ApiClient (Dio) & NetworkInfo
        ├── routing/        # App Router
        ├── theme/          # App Colors & ThemeData
        └── utils/          # Helper functions

### 2. Generate a New Feature
Right-click on "lib" (or a "features" folder) and select:
**Flutter EA: Generate Architecture Feature**

Enter your feature name in snake_case (e.g., user_profile). If you select **Clean Architecture** with **Bloc**, it generates:

    lib/features/user_profile/
    ├── data/
    │   ├── datasources/        # Remote & Local Data Sources
    │   ├── models/             # Data Models (JSON serialization)
    │   └── repositories/       # Repository Implementations
    ├── domain/
    │   ├── entities/           # Pure Data Entities (Equatable)
    │   ├── repositories/       # Repository Interfaces
    │   └── usecases/           # Business Logic Use Cases
    ├── presentation/
    │   ├── manager/            # Bloc, Event, State files
    │   ├── pages/              # UI Screens
    │   └── widgets/            # Reusable UI Components
    └── user_profile_injection.dart # Feature-specific get_it setup

### 3. Use EA Smart Snippets ⚡
Open any ".dart" file, type "ea-", and hit **Enter**. The toolkit uses multi-cursor variables to fill in your feature names instantly across the generated code.
* ea-bloc / ea-bloc-state / ea-bloc-event
* ea-usecase / ea-usecase-params
* ea-repo-interface / ea-repo-impl
* ea-model / ea-entity
* ea-sl (GetIt Locator)
* ...and many more!

---

## ⚙️ Extension Settings

Tired of selecting the same architecture every time? You can configure your default preferences to skip the prompts!

Go to **VS Code Settings** > **Extensions** > **Flutter EA Toolkit Settings**:

* Default Architecture: Set your default (e.g., Clean Architecture, MVVM).
* Default State Management: Set your default state manager (e.g., bloc, getx, riverpod).

*Tip: If you set these, the extension will only ask you for the Feature Name and generate everything instantly!*

---

## 📦 Supported State Management Options
* **Bloc / Cubit:** Installs flutter_bloc & equatable. Generates Bloc/Event/State classes.
* **Riverpod:** Installs flutter_riverpod. Generates a base Notifier.
* **GetX:** Installs get. Generates a GetxController.
* **Provider:** Installs provider. Generates a ChangeNotifier class.

---

## 🤝 Contributing
Issues and Pull Requests are highly welcome! If you want to add new architectural patterns or state management tools, feel free to contribute to the [GitHub Repository](https://github.com/Emad-Pro/flutter-clean-architecture).

## 📄 License
This extension is licensed under the [MIT License](LICENSE).