# Flutter Architecture Generator 🚀

**The ultimate, enterprise-level VS Code extension for Flutter developers and teams.** Automate your workflow, enforce clean code standards, and generate production-ready architectures (Clean Architecture, MVVM, MVC, MVP) in seconds. Stop writing boilerplate and start focusing on your business logic.

---

## ✨ Key Features

* 🏗️ **Generate Core Architecture:** Initialize a robust project foundation from scratch with one click. Generates folders and boilerplate for Theme, Network (Dio), Errors, Constants, and Dependency Injection.
* 🚀 **Generate Features:** Instantly generate complete feature directories (Data, Domain, Presentation) with fully wired boilerplate code.
* 🧠 **State Management Integration:** Out-of-the-box support for **Bloc, Cubit, Riverpod, GetX, and Provider**. It automatically generates the required state files and wires them to your UI.
* 🧪 **TDD Ready:** Automatically generates parallel test/ folder structures with pre-configured mocktail unit test files for your UseCases and Repositories.
* 💉 **Smart Dependency Injection:** Auto-generates get_it service locator files for each feature, automatically registering your Blocs, UseCases, Repositories, and DataSources.
* 📦 **Auto Package Installation:** Opens the integrated terminal and safely runs flutter pub add for required dependencies (e.g., flutter_bloc, equatable, dio, get_it) based on your selections.
* ⚙️ **Highly Customizable:** Set your team's default architecture and state management in VS Code Settings to bypass prompts and generate features instantly.

---

## 🛠️ How to Use

### 1. Initialize Core Architecture (For New Projects)
Right-click on your `lib` folder in the VS Code Explorer and select:
**Flutter: Init Core Architecture (From Scratch)**

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
Right-click on `lib` (or a `features` folder) and select:
**Flutter: Generate Architecture Feature**

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

    test/features/user_profile/
    ├── data/repositories/
    ├── domain/usecases/        # Auto-generated unit tests with Mocktail
    └── presentation/manager/


---

## ⚙️ Extension Settings

Tired of selecting the same architecture every time? You can configure your default preferences to skip the prompts!

Go to **VS Code Settings** > **Extensions** > **Flutter Architecture Generator**:

* `flutterCleanArchitecture.defaultArchitecture`: Set your default (e.g., Clean Architecture, MVVM).
* `flutterCleanArchitecture.defaultStateManagement`: Set your default state manager (e.g., bloc, getx, riverpod).

*Tip: If you set these, the extension will only ask you for the Feature Name and generate everything instantly!*

---

## 📦 Supported State Management Options
* **Bloc / Cubit:** Installs flutter_bloc & equatable. Generates Bloc/Event/State classes.
* **Riverpod:** Installs flutter_riverpod. Generates a base Provider.
* **GetX:** Installs get. Generates a GetxController and wraps the View in GetBuilder.
* **Provider:** Installs provider. Generates a ChangeNotifier class.

---

## 🤝 Contributing
Issues and Pull Requests are highly welcome! If you want to add new architectural patterns or state management tools, feel free to contribute.

## 📄 License
This extension is licensed under the MIT License.