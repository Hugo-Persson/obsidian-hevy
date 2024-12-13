export interface WorkoutsResponse {
	page: number;
	page_count: number;
	workouts: Workout[];
}

export interface Workout {
	id: string;
	title: string;
	description: string;
	start_time: string;
	end_time: string;
	updated_at: string;
	created_at: string;
	exercises: Exercise[];
}

export interface Exercise {
	index: number;
	title: string;
	notes: string;
	exercise_template_id: string;
	superset_id?: number;
	sets: Set[];
}

export interface Set {
	index: number;
	type: string;
	weight_kg?: number;
	reps: number;
	distance_meters: any;
	duration_seconds: any;
	rpe: any;
}
