export const UNIVERSITIES = [
  "Institute of National Importance (IIT / NIT / IIIT / AIIMS / IIM)",
  "Central University",
  "State Public University / Affiliated College",
  "Deemed-to-be University",
  "Private University",
  "Autonomous Engineering & Technology Institute",
  "Medical & Health Sciences College",
  "Management & Business Studies Institute",
  "Liberal Arts, Science & Commerce College",
  "Law & Social Sciences University",
  "Other Higher Education Institution"
];

export const DEPARTMENTS = [
  "Engineering - CS / CSE / CSC / Similar to CS",
  "Business and Entrepreneurship Studies",
  "Engineering - EEE/ ECE / Similar to EEE",
  "Biological Sciences",
  "Other",
  "Engineering - Mechanical Engineering / Similar to ME",
  "Engineering - Civil Engineering / Similar to CE",
  "Environmental and Life Sciences",
  "Engineering - Other",
  "Pharmacy and Public Health",
  "Liberal Arts and Social Sciences",
  "Law and Human Rights"
];

export const ACADEMIC_YEARS = [
  "First Year or Equivalent",
  "Second Year or Equivalent",
  "Third Year or Equivalent",
  "Fourth Year or Equivalent",
  "Other"
];

export const CGPA_RANGES = [
  "9.00 - 10.00",
  "8.00 - 8.99",
  "7.00 - 7.99",
  "6.00 - 6.99",
  "5.00 - 5.99",
  "Below 5.00",
  "Other"
];

export const AGE_BRACKETS = [
  "Below 18",
  "18-22",
  "23-26",
  "27-30",
  "Above 30"
];

export const PSS_QUESTIONS = [
  { id: 1, text: "In a semester, how often have you felt upset due to something that happened in your academic affairs?" },
  { id: 2, text: "In a semester, how often you felt as if you were unable to control important things in your academic affairs?" },
  { id: 3, text: "In a semester, how often you felt nervous and stressed because of academic pressure?" },
  { id: 4, text: "In a semester, how often you felt as if you could not cope with all the mandatory academic activities?" },
  { id: 5, text: "In a semester, how often you felt confident about your ability to handle your academic / university problems?", reversed: true },
  { id: 6, text: "In a semester, how often you felt as if things in your academic life is going on your way?", reversed: true },
  { id: 7, text: "In a semester, how often are you able to control irritations in your academic / university affairs?", reversed: true },
  { id: 8, text: "In a semester, how often you felt as if your academic performance was on top?", reversed: true },
  { id: 9, text: "In a semester, how often you got angered due to bad performance or low grades that is beyond your control?" },
  { id: 10, text: "In a semester, how often you felt as if academic difficulties are piling up so high that you could not overcome them?" }
];

export const PSS_OPTIONS = [
  { label: "Never", value: 0 },
  { label: "Almost Never", value: 1 },
  { label: "Sometimes", value: 2 },
  { label: "Fairly Often", value: 3 },
  { label: "Very Often", value: 4 }
];

export const PHQ9_QUESTIONS = [
  { id: 1, text: "Little interest or pleasure in doing things?" },
  { id: 2, text: "Feeling down, depressed, or hopeless?" },
  { id: 3, text: "Trouble falling or staying asleep, or sleeping too much?" },
  { id: 4, text: "Feeling tired or having little energy?" },
  { id: 5, text: "Poor appetite or overeating?" },
  { id: 6, text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down?" },
  { id: 7, text: "Trouble concentrating on things, such as reading books or coursework?" },
  { id: 8, text: "Moving or speaking so slowly that other people noticed, or being fidgety/restless?" },
  { id: 9, text: "Thoughts that you would be better off dead, or of hurting yourself in some way?", safety_critical: true }
];

export const GAD7_QUESTIONS = [
  { id: 1, text: "Feeling nervous, anxious, or on edge due to academic pressure?" },
  { id: 2, text: "Not being able to stop or control worrying about academic affairs?" },
  { id: 3, text: "Worrying too much about different university matters?" },
  { id: 4, text: "Trouble relaxing due to academic demands?" },
  { id: 5, text: "Being so restless that it is hard to sit still?" },
  { id: 6, text: "Becoming easily annoyed or irritable because of academic pressure?" },
  { id: 7, text: "Feeling afraid, as if something awful might happen?" }
];

export const PHQ_GAD_OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 }
];
