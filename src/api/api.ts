import { Workout, WorkoutsResponse } from "./types";

export class HevyAPI {
	apiKey: string;
	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	async fetchWorkouts(
		page: number = 1,
		pageSize: number = 5,
	): Promise<Workout[]> {
		const url = `https://api.hevyapp.com/v1/workouts?page=${page}&pageSize=${pageSize}`;
		const headers = {
			accept: "application/json",
			"api-key": this.apiKey,
		};

		try {
			const response = await fetch(url, { method: "GET", headers });
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data: WorkoutsResponse =
				(await response.json()) as WorkoutsResponse;
			return data.workouts;
		} catch (error) {
			console.error("Error fetching workouts:", error);
			throw error;
		}
	}

	async fetchWorkoutsForRange(start: Date, end: Date) {
		const shouldAddWorkout = (workout: Workout) => {
			const workoutStart = new Date(workout.start_time);
			const workoutEnd = new Date(workout.end_time);
			return (
				(workoutStart >= start && workoutStart <= end) ||
				(workoutEnd >= start && workoutEnd <= end)
			);
		};
		const daysSinceEnd = Math.floor(
			(Date.now() - end.getTime()) / (1000 * 60 * 60 * 24),
		);
		let workouts: Workout[] = [];
		let page = 1;
		let pageSize = Math.max(5, daysSinceEnd);
		let i = 0;
		let foundStart = false;
		while (!foundStart) {
			const data = await this.fetchWorkouts(page, pageSize);

			console.log("Got data", data);
			if (data.length == 0) {
				return workouts;
			}

			page++;
			if (i == 0) {
				pageSize = 5;
			}
			i++;
			for (let workout of data) {
				if (new Date(workout.end_time) <= end) {
					foundStart = true;
					workouts = data.filter(shouldAddWorkout);
					break;
				}
			}
		}
		while (true) {
			let data = await this.fetchWorkouts(page, pageSize);
			data = data.filter(shouldAddWorkout);
			if (data.length == 0) {
				return workouts;
			}

			page++;
		}
	}
}
