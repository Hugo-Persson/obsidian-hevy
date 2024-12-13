import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { HevyAPI } from "./api/api";
import EditorInteract from "./editor-interact";
import Renderer from "./renderer";

// Remember to rename these classes and interfaces!

interface Settings {
	apiToken: string;
	storedWorkoutPath: string;
}

const DEFAULT_SETTINGS: Settings = {
	apiToken: "",
	storedWorkoutPath: "hevy",
};

export default class HevyAPIPlugin extends Plugin {
	settings: Settings;

	async createFile(fileName: string, content: string) {
		const { vault } = this.app;

		// Check if the file already exists to avoid overwriting
		if (await vault.adapter.exists(fileName)) {
			console.log(`File "${fileName}" already exists.`);
			return;
		}

		if (!(await vault.adapter.exists(this.settings.storedWorkoutPath))) {
			await vault.createFolder(this.settings.storedWorkoutPath);
		}

		try {
			// Create the file with the specified content
			await vault.create(fileName, content);
			console.log(`File "${fileName}" created successfully.`);
		} catch (error) {
			console.error(`Error creating file "${fileName}":`, error);
		}
	}

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Hevy API",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("This is a notice!");
			},
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "get-workouts-for-daily-note",
			name: "Get workouts for the current daily note",
			callback: async () => {
				if (!this.settings.apiToken) {
					alert("Please set your API token in the settings.");
					return;
				}
				try {
					const view =
						this.app.workspace.getActiveViewOfType(MarkdownView);
					if (!view) {
						alert(
							"No markdown view found, please open a markdown file.",
						);
						return;
					}

					const editorInteract = new EditorInteract(view);
					editorInteract.insertLoadingText();
					console.log("Creating API instance", this.settings);
					const api = new HevyAPI(this.settings.apiToken);
					console.log("Getting workouts for today");
					const day = new Date("2024-12-12");
					const start = new Date(day);
					start.setHours(0, 0, 0, 0);
					const end = new Date(day);
					end.setHours(23, 59, 59, 999);
					const workouts = await api.fetchWorkoutsForRange(
						start,
						end,
					);
					const renderer = new Renderer(
						this.settings.storedWorkoutPath,
					);
					editorInteract.insertResponseToEditor(
						renderer.renderMultipleWorkoutSummaries(workouts),
					);
					for (const workout of workouts) {
						await this.createFile(
							`${this.settings.storedWorkoutPath}/${workout.id}.md`,
							renderer.renderWorkoutAsText(workout),
						);
					}
				} catch (error) {
					console.error(error);
					alert(
						"Error while fetching latex, please check the console for more information.",
					);
				}
			},
		});

		this.addCommand({
			id: "view-workouts",
			name: "Opens modal showing workout statistics",
			callback: () => {
				new WorkoutStatisticsModal(this.app).open();
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new PluginSettings(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class WorkoutStatisticsModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		//contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class PluginSettings extends PluginSettingTab {
	plugin: HevyAPIPlugin;

	constructor(app: App, plugin: HevyAPIPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("API Token")
			.setDesc(
				"Enter your API token, found at https://hevy.com/settings?developer=",
			)
			.addText((text) =>
				text
					.setPlaceholder("Enter...")
					.setValue(this.plugin.settings.apiToken)
					.onChange(async (value) => {
						this.plugin.settings.apiToken = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
