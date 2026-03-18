import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
	// ==========================================
	// COMMAND 1: INIT CORE ARCHITECTURE
	// ==========================================
	let initCoreDisposable = vscode.commands.registerCommand('flutter-clean-architecture.initCore', async (uri: vscode.Uri) => {
		if (!uri) {
			vscode.window.showErrorMessage('Error: Please right-click on the "lib" folder to initialize the core structure.');
			return;
		}

		const targetPath = uri.fsPath;
		const corePath = path.join(targetPath, 'core');

		if (fs.existsSync(corePath)) {
			vscode.window.showErrorMessage('Error: The "core" folder already exists in this directory.');
			return;
		}

		// Ask if they want to install Core Packages
		const installPackages = await vscode.window.showQuickPick(
			['Yes, install core packages (dio, shared_preferences, intl, equatable)', 'No, just generate folders'],
			{ title: 'Do you want to auto-install essential Core packages?' }
		);

		if (!installPackages) return;

		try {
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: `Generating Core Architecture...`,
				cancellable: false
			}, async () => {

				fs.mkdirSync(corePath);

				// 1. Create Core Folders
				const coreFolders = [
					'theme', 'localization', 'network', 'errors', 'routing', 'utils', 'constants', 'di'
				];

				coreFolders.forEach(folder => {
					fs.mkdirSync(path.join(corePath, folder), { recursive: true });
				});

				// 2. Generate Core Files & Boilerplate
				const coreFiles = [
					// Theme
					{ path: path.join(corePath, 'theme', 'app_theme.dart'), content: getAppThemeContent() },
					{ path: path.join(corePath, 'theme', 'app_colors.dart'), content: getAppColorsContent() },
					// Errors
					{ path: path.join(corePath, 'errors', 'failures.dart'), content: getFailuresContent() },
					{ path: path.join(corePath, 'errors', 'exceptions.dart'), content: getExceptionsContent() },
					// Network
					{ path: path.join(corePath, 'network', 'api_client.dart'), content: getApiClientContent() },
					{ path: path.join(corePath, 'network', 'network_info.dart'), content: getNetworkInfoContent() },
					// Utils & Constants
					{ path: path.join(corePath, 'constants', 'api_constants.dart'), content: getApiConstantsContent() },
					{ path: path.join(corePath, 'utils', 'app_strings.dart'), content: getAppStringsContent() },
					// DI Container
					{ path: path.join(corePath, 'di', 'injection_container.dart'), content: getInjectionContainerContent() }
				];

				coreFiles.forEach(file => {
					fs.writeFileSync(file.path, file.content);
				});
			});

			// 3. Auto-Install Packages
			if (installPackages.startsWith('Yes')) {
				const packages = 'dio shared_preferences intl equatable internet_connection_checker get_it';
				const terminal = vscode.window.createTerminal(`Install Core Packages`);
				terminal.show();
				terminal.sendText(`flutter pub add ${packages}`);
				vscode.window.showInformationMessage('Core Architecture generated and installing core packages...');
			} else {
				vscode.window.showInformationMessage('Core Architecture generated successfully!');
			}

		} catch (error) {
			vscode.window.showErrorMessage(`An error occurred: ${error}`);
		}
	});

	context.subscriptions.push(initCoreDisposable);

	// ==========================================
	// COMMAND 2: GENERATE FEATURE
	// ==========================================
	let disposable = vscode.commands.registerCommand('flutter-clean-architecture.generateFeature', async (uri: vscode.Uri) => {

		if (!uri) {
			vscode.window.showErrorMessage('Error: Please right-click on a folder in the explorer to generate the feature.');
			return;
		}

		const targetPath = uri.fsPath;

		// --- Read Settings from VS Code ---
		const config = vscode.workspace.getConfiguration('flutterCleanArchitecture');
		let selectedArchitecture = config.get<string>('defaultArchitecture');
		let selectedSMValue = config.get<string>('defaultStateManagement');
		let selectedSMLabel = selectedSMValue; // Store the label for terminal and UI messages

		// 1. Select Architecture Pattern
		if (!selectedArchitecture || selectedArchitecture === 'Ask me every time') {
			const architectureOptions = ['Clean Architecture', 'MVVM', 'MVC', 'MVP'];
			selectedArchitecture = await vscode.window.showQuickPick(architectureOptions, {
				placeHolder: 'Select the Architectural Pattern for this feature',
				title: '1/3: Architecture Generator'
			});
			if (!selectedArchitecture) return;
		}

		// 2. Select State Management
		if (!selectedSMValue || selectedSMValue === 'Ask me every time') {
			const stateManagementOptions = [
				{ label: 'Bloc', description: 'Generates Bloc, Event, State (flutter_bloc, equatable)', value: 'bloc' },
				{ label: 'Cubit', description: 'Generates Cubit, State (flutter_bloc, equatable)', value: 'cubit' },
				{ label: 'Riverpod', description: 'Generates Provider (flutter_riverpod)', value: 'riverpod' },
				{ label: 'GetX', description: 'Generates Controller (get)', value: 'getx' },
				{ label: 'Provider', description: 'Generates ChangeNotifier (provider)', value: 'provider' },
				{ label: 'None', description: 'No State Management', value: 'none' }
			];

			const selectedSM = await vscode.window.showQuickPick(stateManagementOptions, {
				placeHolder: 'Select State Management',
				title: '2/3: State Management'
			});
			if (!selectedSM) return;

			selectedSMValue = selectedSM.value;
			selectedSMLabel = selectedSM.label;
		}

		// 3. Enter Feature Name
		const featureName = await vscode.window.showInputBox({
			prompt: `Generating ${selectedArchitecture} with ${selectedSMLabel}. Enter feature name (snake_case):`,
			placeHolder: 'e.g., user_profile',
			title: 'Feature Name',
			validateInput: (text) => {
				if (!text || text.trim().length === 0) return 'Feature name cannot be empty.';
				if (!/^[a-z0-9_]+$/.test(text)) return 'Please use snake_case only.';
				return null;
			}
		});
		if (!featureName) return;

		const featurePath = path.join(targetPath, featureName);
		if (fs.existsSync(featurePath)) {
			vscode.window.showErrorMessage(`Error: The folder "${featureName}" already exists.`);
			return;
		}

		const pascalClassName = featureName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
		const workspaceFolders = vscode.workspace.workspaceFolders;
		let testFeaturePath = '';
		if (workspaceFolders) {
			const rootPath = workspaceFolders[0].uri.fsPath;
			testFeaturePath = path.join(rootPath, 'test', 'features', featureName);
		}

		try {
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: `Generating ${selectedArchitecture} with ${selectedSMLabel}...`,
				cancellable: false
			}, async () => {

				fs.mkdirSync(featurePath);
				let filesToCreate: { path: string, content: string }[] = [];

				// --- FOLDER GENERATION ---
				let managerFolderPath = '';
				if (selectedArchitecture === 'Clean Architecture') {
					['data/datasources', 'data/models', 'data/repositories',
						'domain/entities', 'domain/repositories', 'domain/usecases',
						'presentation/pages', 'presentation/manager', 'presentation/widgets']
						.forEach(folder => fs.mkdirSync(path.join(featurePath, folder), { recursive: true }));

					// --- TDD GENERATION (Test Environment) ---
					if (testFeaturePath !== '') {
						const testFolders = ['domain/usecases', 'data/repositories', 'presentation/manager'];
						testFolders.forEach(folder => fs.mkdirSync(path.join(testFeaturePath, folder), { recursive: true }));

						filesToCreate.push(
							{
								path: path.join(testFeaturePath, 'domain', 'usecases', `get_${featureName}_usecase_test.dart`),
								content: getUseCaseTestContent(pascalClassName, featureName)
							}
						);
					}
					managerFolderPath = path.join(featurePath, 'presentation', 'manager');

					// Clean Architecture Base Files
					filesToCreate.push(
						{ path: path.join(featurePath, 'domain', 'entities', `${featureName}_entity.dart`), content: getEntityContent(pascalClassName) },
						{ path: path.join(featurePath, 'domain', 'repositories', `${featureName}_repository.dart`), content: getDomainRepoContent(pascalClassName, featureName) },
						{ path: path.join(featurePath, 'domain', 'usecases', `get_${featureName}_usecase.dart`), content: getUseCaseContent(pascalClassName, featureName) },
						{ path: path.join(featurePath, 'data', 'models', `${featureName}_model.dart`), content: getModelContent(pascalClassName, featureName) },
						{ path: path.join(featurePath, 'data', 'repositories', `${featureName}_repository_impl.dart`), content: getDataRepoImplContent(pascalClassName, featureName) },
						{ path: path.join(featurePath, 'data', 'datasources', `${featureName}_remote_data_source.dart`), content: getDataSourceContent(pascalClassName) },
						{ path: path.join(featurePath, 'presentation', 'pages', `${featureName}_page.dart`), content: getPageContent(pascalClassName, 'Page', selectedSMValue!, featureName) },
						{ path: path.join(featurePath, `${featureName}_injection.dart`), content: getFeatureInjectionContent(pascalClassName, featureName, selectedSMValue!) }
					);
				} else {
					// MVVM, MVC, MVP
					const logicFolder = selectedArchitecture === 'MVVM' ? 'view_models' : selectedArchitecture === 'MVC' ? 'controllers' : 'presenters';
					['models', 'views', logicFolder].forEach(folder => fs.mkdirSync(path.join(featurePath, folder), { recursive: true }));
					managerFolderPath = path.join(featurePath, logicFolder);

					filesToCreate.push(
						{ path: path.join(featurePath, 'models', `${featureName}_model.dart`), content: getSimpleModelContent(pascalClassName) },
						{ path: path.join(featurePath, 'views', `${featureName}_view.dart`), content: getPageContent(pascalClassName, 'View', selectedSMValue!, featureName) }
					);
				}

				// --- STATE MANAGEMENT GENERATION ---
				if (selectedSMValue === 'bloc') {
					filesToCreate.push(
						{ path: path.join(managerFolderPath, `${featureName}_bloc.dart`), content: getBlocContent(pascalClassName, featureName) },
						{ path: path.join(managerFolderPath, `${featureName}_event.dart`), content: getBlocEventContent(pascalClassName) },
						{ path: path.join(managerFolderPath, `${featureName}_state.dart`), content: getBlocStateContent(pascalClassName) }
					);
				} else if (selectedSMValue === 'cubit') {
					filesToCreate.push(
						{ path: path.join(managerFolderPath, `${featureName}_cubit.dart`), content: getCubitContent(pascalClassName, featureName) },
						{ path: path.join(managerFolderPath, `${featureName}_state.dart`), content: getBlocStateContent(pascalClassName) }
					);
				} else if (selectedSMValue === 'riverpod') {
					filesToCreate.push({ path: path.join(managerFolderPath, `${featureName}_provider.dart`), content: getRiverpodContent(pascalClassName) });
				} else if (selectedSMValue === 'getx') {
					filesToCreate.push({ path: path.join(managerFolderPath, `${featureName}_controller.dart`), content: getGetXContent(pascalClassName) });
				} else if (selectedSMValue === 'provider') {
					filesToCreate.push({ path: path.join(managerFolderPath, `${featureName}_provider.dart`), content: getProviderContent(pascalClassName) });
				}

				// Write Files
				filesToCreate.forEach(file => fs.writeFileSync(file.path, file.content));
			});

			// 4. Auto-Install Packages via Terminal
			let packagesToInstall = '';
			if (selectedSMValue === 'bloc' || selectedSMValue === 'cubit') packagesToInstall = 'flutter_bloc equatable';
			else if (selectedSMValue === 'riverpod') packagesToInstall = 'flutter_riverpod';
			else if (selectedSMValue === 'getx') packagesToInstall = 'get';
			else if (selectedSMValue === 'provider') packagesToInstall = 'provider';

			if (packagesToInstall !== '') {
				const terminal = vscode.window.createTerminal(`Install Packages`);
				terminal.show();
				// تثبيت الحزم الأساسية
				terminal.sendText(`flutter pub add ${packagesToInstall}`);

				// تثبيت حزم الاختبارات كـ dev_dependencies
				terminal.sendText(`flutter pub add dev:mocktail dev:bloc_test`);

				vscode.window.showInformationMessage(`Generated files and installing packages...`);
			} else {
				vscode.window.showInformationMessage(`Successfully generated ${featureName} files.`);
			}

		} catch (error) {
			vscode.window.showErrorMessage(`An error occurred: ${error}`);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }

// ==========================================
// BOILERPLATE GENERATORS
// ==========================================

function getEntityContent(name: string): string {
	return `import 'package:equatable/equatable.dart';\n\nclass ${name}Entity extends Equatable {\n  final String id;\n\n  const ${name}Entity({required this.id});\n\n  @override\n  List<Object?> get props => [id];\n}\n`;
}

function getDomainRepoContent(name: string, snakeName: string): string {
	return `import '../entities/${snakeName}_entity.dart';\n\nabstract class ${name}Repository {\n  Future<${name}Entity> get${name}();\n}\n`;
}

function getUseCaseContent(name: string, snakeName: string): string {
	return `import '../repositories/${snakeName}_repository.dart';\nimport '../entities/${snakeName}_entity.dart';\n\nclass Get${name}UseCase {\n  final ${name}Repository repository;\n\n  Get${name}UseCase(this.repository);\n\n  Future<${name}Entity> execute() async {\n    return await repository.get${name}();\n  }\n}\n`;
}

function getModelContent(name: string, snakeName: string): string {
	return `import '../../domain/entities/${snakeName}_entity.dart';\n\nclass ${name}Model extends ${name}Entity {\n  const ${name}Model({required String id}) : super(id: id);\n\n  factory ${name}Model.fromJson(Map<String, dynamic> json) {\n    return ${name}Model(id: json['id']);\n  }\n}\n`;
}

function getDataRepoImplContent(name: string, snakeName: string): string {
	return `import '../../domain/repositories/${snakeName}_repository.dart';\nimport '../../domain/entities/${snakeName}_entity.dart';\nimport '../datasources/${snakeName}_remote_data_source.dart';\n\nclass ${name}RepositoryImpl implements ${name}Repository {\n  final ${name}RemoteDataSource remoteDataSource;\n\n  ${name}RepositoryImpl(this.remoteDataSource);\n\n  @override\n  Future<${name}Entity> get${name}() async {\n    return await remoteDataSource.fetch${name}();\n  }\n}\n`;
}

function getDataSourceContent(name: string): string {
	return `abstract class ${name}RemoteDataSource {\n  Future<dynamic> fetch${name}();\n}\n\nclass ${name}RemoteDataSourceImpl implements ${name}RemoteDataSource {\n  @override\n  Future<dynamic> fetch${name}() async {\n    // TODO: implement API call\n    throw UnimplementedError();\n  }\n}\n`;
}

// --- View/Page with State Management Injection ---
function getPageContent(name: string, suffix: string, sm: string, snakeName: string): string {
	let smImport = '';
	let bodyCode = `const Center(child: Text('Welcome to ${name} ${suffix}'))`;

	if (sm === 'bloc' || sm === 'cubit') {
		smImport = `import 'package:flutter_bloc/flutter_bloc.dart';\nimport '../manager/${snakeName}_${sm}.dart';\nimport '../manager/${snakeName}_state.dart';\n`;
		bodyCode = `BlocBuilder<${name}${sm === 'bloc' ? 'Bloc' : 'Cubit'}, ${name}State>(\n        builder: (context, state) {\n          if (state is ${name}Loading) return const Center(child: CircularProgressIndicator());\n          return const Center(child: Text('Loaded State'));\n        },\n      )`;
	} else if (sm === 'getx') {
		smImport = `import 'package:get/get.dart';\nimport '../controllers/${snakeName}_controller.dart';\n`;
		bodyCode = `GetBuilder<${name}Controller>(\n        init: ${name}Controller(),\n        builder: (controller) {\n          return const Center(child: Text('GetX View'));\n        },\n      )`;
	}

	return `import 'package:flutter/material.dart';\n${smImport}\nclass ${name}${suffix} extends StatelessWidget {\n  const ${name}${suffix}({Key? key}) : super(key: key);\n\n  @override\n  Widget build(BuildContext context) {\n    return Scaffold(\n      appBar: AppBar(title: const Text('${name}')),\n      body: ${bodyCode},\n    );\n  }\n}\n`;
}

function getSimpleModelContent(name: string): string {
	return `class ${name}Model {\n  final String id;\n  ${name}Model({required this.id});\n}\n`;
}

// --- State Management Files ---
function getBlocEventContent(name: string): string {
	return `import 'package:equatable/equatable.dart';\n\nabstract class ${name}Event extends Equatable {\n  const ${name}Event();\n\n  @override\n  List<Object> get props => [];\n}\n\nclass Load${name}Event extends ${name}Event {}\n`;
}

function getBlocStateContent(name: string): string {
	return `import 'package:equatable/equatable.dart';\n\nabstract class ${name}State extends Equatable {\n  const ${name}State();\n\n  @override\n  List<Object> get props => [];\n}\n\nclass ${name}Initial extends ${name}State {}\nclass ${name}Loading extends ${name}State {}\nclass ${name}Loaded extends ${name}State {}\nclass ${name}Error extends ${name}State {\n  final String message;\n  const ${name}Error(this.message);\n  @override\n  List<Object> get props => [message];\n}\n`;
}

function getBlocContent(name: string, snakeName: string): string {
	return `import 'package:flutter_bloc/flutter_bloc.dart';\nimport '${snakeName}_event.dart';\nimport '${snakeName}_state.dart';\n\nclass ${name}Bloc extends Bloc<${name}Event, ${name}State> {\n  ${name}Bloc() : super(${name}Initial()) {\n    on<Load${name}Event>((event, emit) async {\n      emit(${name}Loading());\n      // TODO: implement logic\n      emit(${name}Loaded());\n    });\n  }\n}\n`;
}

function getCubitContent(name: string, snakeName: string): string {
	return `import 'package:flutter_bloc/flutter_bloc.dart';\nimport '${snakeName}_state.dart';\n\nclass ${name}Cubit extends Cubit<${name}State> {\n  ${name}Cubit() : super(${name}Initial());\n\n  Future<void> loadData() async {\n    emit(${name}Loading());\n    // TODO: implement logic\n    emit(${name}Loaded());\n  }\n}\n`;
}

function getGetXContent(name: string): string {
	return `import 'package:get/get.dart';\n\nclass ${name}Controller extends GetxController {\n  var isLoading = false.obs;\n\n  @override\n  void onInit() {\n    super.onInit();\n    loadData();\n  }\n\n  void loadData() {\n    isLoading.value = true;\n    // TODO: implement logic\n    isLoading.value = false;\n  }\n}\n`;
}

function getRiverpodContent(name: string): string {
	return `import 'package:flutter_riverpod/flutter_riverpod.dart';\n\nfinal ${name.toLowerCase()}Provider = StateProvider<bool>((ref) => false);\n`;
}

function getProviderContent(name: string): string {
	return `import 'package:flutter/material.dart';\n\nclass ${name}Provider extends ChangeNotifier {\n  bool isLoading = false;\n\n  void loadData() {\n    isLoading = true;\n    notifyListeners();\n    // TODO: implement logic\n    isLoading = false;\n    notifyListeners();\n  }\n}\n`;
}
// ==========================================
// CORE BOILERPLATE GENERATORS
// ==========================================

function getAppThemeContent(): string {
	return `import 'package:flutter/material.dart';\nimport 'app_colors.dart';\n\nclass AppTheme {\n  static ThemeData get lightTheme {\n    return ThemeData(\n      primaryColor: AppColors.primary,\n      scaffoldBackgroundColor: AppColors.background,\n      appBarTheme: const AppBarTheme(\n        color: AppColors.primary,\n        elevation: 0,\n      ),\n    );\n  }\n}\n`;
}

function getAppColorsContent(): string {
	return `import 'package:flutter/material.dart';\n\nclass AppColors {\n  static const Color primary = Color(0xFF000000);\n  static const Color secondary = Color(0xFFFFFFFF);\n  static const Color background = Color(0xFFF5F5F5);\n  static const Color error = Colors.red;\n}\n`;
}

function getFailuresContent(): string {
	return `import 'package:equatable/equatable.dart';\n\nabstract class Failure extends Equatable {\n  final String message;\n  const Failure(this.message);\n\n  @override\n  List<Object> get props => [message];\n}\n\nclass ServerFailure extends Failure {\n  const ServerFailure(super.message);\n}\n\nclass NetworkFailure extends Failure {\n  const NetworkFailure(super.message);\n}\n`;
}

function getExceptionsContent(): string {
	return `class ServerException implements Exception {\n  final String message;\n  ServerException({required this.message});\n}\n\nclass CacheException implements Exception {}\n`;
}

function getApiClientContent(): string {
	return `// Using Dio for network requests\nimport 'package:dio/dio.dart';\nimport '../constants/api_constants.dart';\n\nclass ApiClient {\n  late Dio dio;\n\n  ApiClient() {\n    dio = Dio(BaseOptions(\n      baseUrl: ApiConstants.baseUrl,\n      receiveTimeout: const Duration(seconds: 15),\n      connectTimeout: const Duration(seconds: 15),\n      headers: {'Content-Type': 'application/json'},\n    ));\n    \n    // Add interceptors here\n    dio.interceptors.add(LogInterceptor(responseBody: true, requestBody: true));\n  }\n}\n`;
}

function getNetworkInfoContent(): string {
	return `import 'package:internet_connection_checker/internet_connection_checker.dart';\n\nabstract class NetworkInfo {\n  Future<bool> get isConnected;\n}\n\nclass NetworkInfoImpl implements NetworkInfo {\n  final InternetConnectionChecker connectionChecker;\n\n  NetworkInfoImpl(this.connectionChecker);\n\n  @override\n  Future<bool> get isConnected => connectionChecker.hasConnection;\n}\n`;
}

function getApiConstantsContent(): string {
	return `class ApiConstants {\n  static const String baseUrl = 'https://api.example.com/v1/';\n}\n`;
}

function getAppStringsContent(): string {
	return `class AppStrings {\n  static const String appName = 'My App';\n  static const String noInternet = 'No Internet Connection';\n  static const String serverError = 'Server Error Occurred';\n}\n`;
}
// ==========================================
// DEPENDENCY INJECTION GENERATORS
// ==========================================

// 1. Core Injection Container
function getInjectionContainerContent(): string {
	return `import 'package:get_it/get_it.dart';
import '../network/api_client.dart';
import '../network/network_info.dart';
import 'package:internet_connection_checker/internet_connection_checker.dart';

final sl = GetIt.instance; // sl = Service Locator

Future<void> initCore() async {
  // Core
  sl.registerLazySingleton<NetworkInfo>(() => NetworkInfoImpl(sl()));
  sl.registerLazySingleton(() => ApiClient());
  
  // External
  sl.registerLazySingleton(() => InternetConnectionChecker.instance);
}
`;
}

// 2. Feature-Specific Injection
function getFeatureInjectionContent(name: string, snakeName: string, sm: string): string {
	let smRegistration = '';

	// تسجيل الـ Bloc أو الـ Cubit كـ Factory (لأنه يتم تدميره وإعادة بنائه مع الواجهة)
	if (sm === 'bloc') {
		smRegistration = `  sl.registerFactory(() => ${name}Bloc(sl()));\n`;
	} else if (sm === 'cubit') {
		smRegistration = `  sl.registerFactory(() => ${name}Cubit(sl()));\n`;
	} else if (sm === 'provider') {
		smRegistration = `  sl.registerFactory(() => ${name}Provider(sl()));\n`;
	}

	return `import 'package:get_it/get_it.dart';

import 'presentation/manager/${snakeName}_${sm === 'cubit' ? 'cubit' : sm === 'bloc' ? 'bloc' : 'provider'}.dart';
import 'domain/usecases/get_${snakeName}_usecase.dart';
import 'domain/repositories/${snakeName}_repository.dart';
import 'data/repositories/${snakeName}_repository_impl.dart';
import 'data/datasources/${snakeName}_remote_data_source.dart';

final sl = GetIt.instance;

void init${name}() {
  // State Management
${smRegistration}
  // Use Cases
  sl.registerLazySingleton(() => Get${name}UseCase(sl()));

  // Repository
  sl.registerLazySingleton<${name}Repository>(
    () => ${name}RepositoryImpl(sl()),
  );

  // Data Sources
  sl.registerLazySingleton<${name}RemoteDataSource>(
    () => ${name}RemoteDataSourceImpl(),
  );
}
`;
}
// ==========================================
// TDD (TESTING) GENERATORS
// ==========================================

function getUseCaseTestContent(name: string, snakeName: string): string {
	return `import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import '../../../../lib/features/${snakeName}/domain/repositories/${snakeName}_repository.dart';
import '../../../../lib/features/${snakeName}/domain/usecases/get_${snakeName}_usecase.dart';
import '../../../../lib/features/${snakeName}/domain/entities/${snakeName}_entity.dart';


class Mock${name}Repository extends Mock implements ${name}Repository {}

void main() {
  late Get${name}UseCase usecase;
  late Mock${name}Repository mockRepository;

  setUp(() {
    mockRepository = Mock${name}Repository();
    usecase = Get${name}UseCase(mockRepository);
  });

  const t${name}Entity = ${name}Entity(id: '1');

  test(
    'should get ${name.toLowerCase()} entity from the repository',
    () async {
      // arrange
      when(() => mockRepository.get${name}())
          .thenAnswer((_) async => t${name}Entity);
          
      // act
      final result = await usecase.execute();
      
      // assert
      expect(result, t${name}Entity);
      verify(() => mockRepository.get${name}());
      verifyNoMoreInteractions(mockRepository);
    },
  );
}
`;
}