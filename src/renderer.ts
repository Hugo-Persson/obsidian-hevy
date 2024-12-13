import { Workout } from "./api/types";

export default class Renderer {
	storedWorkoutPath: string;

	constructor(storedWorkoutPath: string) {
		this.storedWorkoutPath = storedWorkoutPath;
	}

	renderWorkoutAsText(workout: Workout) {
		let txt = "";
		txt += `## ${workout.title}\n\n`;
		txt += `**Description:** ${workout.description}\n\n`;
		txt += `**Start Time:** ${workout.start_time}\n\n`;
		txt += `**End Time:** ${workout.end_time}\n\n`;
		txt += `**Updated At:** ${workout.updated_at}\n\n`;
		txt += `**Created At:** ${workout.created_at}\n\n`;
		txt += `### Exercises\n\n`;
		for (const exercise of workout.exercises) {
			txt += `#### ${exercise.title}\n\n`;
			txt += `**Notes:** ${exercise.notes}\n\n`;
			txt += `**Sets:**\n\n`;
			for (const set of exercise.sets) {
				txt += `* **Type:** ${set.type}\n`;
				txt += `* **Weight (kg):** ${set.weight_kg}\n`;
				txt += `* **Reps:** ${set.reps}\n`;
				txt += `* **Distance (m):** ${set.distance_meters}\n`;
				txt += `* **Duration (s):** ${set.duration_seconds}\n`;
				txt += `* **RPE:** ${set.rpe}\n\n`;
			}
		}
		return txt;
	}

	renderMultipleWorkoutsAsText(workouts: Workout[]) {
		let txt = `# Hevy Workouts\n\n`;
		for (const workout of workouts) {
			txt += `## ${workout.title}\n\n`;
			txt += `**Description:** ${workout.description}\n\n`;
			txt += `**Start Time:** ${workout.start_time}\n\n`;
			txt += `**End Time:** ${workout.end_time}\n\n`;
			txt += `**Updated At:** ${workout.updated_at}\n\n`;
			txt += `**Created At:** ${workout.created_at}\n\n`;
			txt += `### Exercises\n\n`;
			for (const exercise of workout.exercises) {
				txt += `#### ${exercise.title}\n\n`;
				txt += `**Notes:** ${exercise.notes}\n\n`;
				txt += `**Sets:**\n\n`;
				for (const set of exercise.sets) {
					txt += `* **Type:** ${set.type}\n`;
					txt += `* **Weight (kg):** ${set.weight_kg}\n`;
					txt += `* **Reps:** ${set.reps}\n`;
					txt += `* **Distance (m):** ${set.distance_meters}\n`;
					txt += `* **Duration (s):** ${set.duration_seconds}\n`;
					txt += `* **RPE:** ${set.rpe}\n\n`;
				}
			}
		}
		return txt;
	}

	prettifyDuration(duration: number) {
		const hours = Math.floor(duration / 3600);
		const minutes = Math.floor((duration % 3600) / 60);
		const seconds = duration % 60;
		return `${hours}:${minutes}:${seconds}`;
	}

	renderWorkoutSummary(workout: Workout) {
		const duration = this.prettifyDuration(
			(new Date(workout.end_time).getTime() -
				new Date(workout.start_time).getTime()) /
				1000,
		);
		const sets = workout.exercises.reduce(
			(acc, exercise) => acc + exercise.sets.length,
			0,
		);

		let txt = `
> [!workout] [${workout.title}](hevy/${workout.id})
> **Description:** ${workout.description}
> **Start Time:** ${workout.start_time}
> **End Time:** ${workout.end_time}
> **Duration:** ${duration}
> **Sets:** ${sets}
`;
		return txt;
	}

	renderMultipleWorkoutSummaries(workouts: Workout[]) {
		let txt = `# Hevy Workouts\n\n`;
		for (const workout of workouts) {
			txt += this.renderWorkoutSummary(workout);
			txt += "\n\n";
		}
		return txt;
	}
}
