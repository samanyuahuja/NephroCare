CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password text NOT NULL
);

CREATE TABLE IF NOT EXISTS ckd_assessments (
  id serial PRIMARY KEY,
  patient_name text NOT NULL,
  age integer NOT NULL,
  blood_pressure integer NOT NULL,
  albumin integer NOT NULL,
  sugar integer NOT NULL,
  red_blood_cells text NOT NULL,
  pus_cell text NOT NULL,
  blood_glucose_random integer NOT NULL,
  blood_urea integer NOT NULL,
  serum_creatinine real NOT NULL,
  sodium integer NOT NULL,
  potassium real NOT NULL,
  hemoglobin real NOT NULL,
  wbc_count integer NOT NULL,
  rbc_count real NOT NULL,
  hypertension text NOT NULL,
  diabetes_mellitus text NOT NULL,
  appetite text NOT NULL,
  pedal_edema text NOT NULL,
  anemia text NOT NULL,
  risk_score real,
  risk_level text,
  shap_features text,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS diet_plans (
  id serial PRIMARY KEY,
  assessment_id integer REFERENCES ckd_assessments(id),
  diet_type text NOT NULL,
  foods_to_eat text NOT NULL,
  foods_to_avoid text NOT NULL,
  water_intake_advice text NOT NULL,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id serial PRIMARY KEY,
  message text NOT NULL,
  response text NOT NULL,
  created_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ckd_assessments_created_at_idx
  ON ckd_assessments (created_at DESC);

CREATE INDEX IF NOT EXISTS diet_plans_assessment_id_idx
  ON diet_plans (assessment_id);

CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx
  ON chat_messages (created_at DESC);
