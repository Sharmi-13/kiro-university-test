// Feature: link2skill-platform
// Landing page — Explore Skills section
// Server component

type Skill = {
  name: string;
  nameTa: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  language: "Tamil" | "English" | "Both";
  tutorCount: number;
  color: string;
};

const skills: Skill[] = [
  { name: "Mathematics",   nameTa: "கணிதம்",      level: "Beginner",     language: "Both",    tutorCount: 42, color: "bg-blue-50 text-blue-700 border-blue-200" },
  { name: "Tamil Language", nameTa: "தமிழ் மொழி", level: "Beginner",     language: "Tamil",   tutorCount: 38, color: "bg-rose-50 text-rose-700 border-rose-200" },
  { name: "English",       nameTa: "ஆங்கிலம்",    level: "Intermediate", language: "Both",    tutorCount: 56, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { name: "Science",       nameTa: "அறிவியல்",    level: "Intermediate", language: "Both",    tutorCount: 29, color: "bg-amber-50 text-amber-700 border-amber-200" },
  { name: "Programming",   nameTa: "நிரலாக்கம்",  level: "Advanced",     language: "English", tutorCount: 61, color: "bg-violet-50 text-violet-700 border-violet-200" },
  { name: "History",       nameTa: "வரலாறு",      level: "Beginner",     language: "Tamil",   tutorCount: 18, color: "bg-orange-50 text-orange-700 border-orange-200" },
  { name: "Music",         nameTa: "இசை",         level: "Beginner",     language: "Both",    tutorCount: 24, color: "bg-pink-50 text-pink-700 border-pink-200" },
  { name: "Physics",       nameTa: "இயற்பியல்",   level: "Advanced",     language: "Both",    tutorCount: 33, color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
];

const levelBadgeClass: Record<Skill["level"], string> = {
  Beginner:     "bg-green-100 text-green-700",
  Intermediate: "bg-yellow-100 text-yellow-700",
  Advanced:     "bg-red-100 text-red-700",
};

export default function SkillsSection() {
  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="bg-gray-50 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
            What you can learn
          </p>
          <h2
            id="skills-heading"
            className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
          >
            Popular subjects on Link2Skill
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Every subject is available in Tamil, English, or both — you choose what fits your learning style.
          </p>
        </div>

        {/* Skills grid */}
        <ul
          role="list"
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {skills.map((skill) => (
            <li key={skill.name}>
              <a
                href="/register"
                className={`flex h-full flex-col rounded-2xl border p-5 transition-all hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${skill.color}`}
                aria-label={`Explore ${skill.name} — ${skill.tutorCount} tutors available`}
              >
                {/* Bilingual name */}
                <div>
                  <p className="font-semibold">{skill.name}</p>
                  <p lang="ta" className="mt-0.5 text-sm opacity-75">
                    {skill.nameTa}
                  </p>
                </div>

                {/* Badges */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${levelBadgeClass[skill.level]}`}>
                    {skill.level}
                  </span>
                  {skill.language === "Tamil" && (
                    <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                      தமிழ்
                    </span>
                  )}
                  {skill.language === "English" && (
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      English
                    </span>
                  )}
                  {skill.language === "Both" && (
                    <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                      Bilingual
                    </span>
                  )}
                </div>

                {/* Tutor count */}
                <p className="mt-3 text-xs font-medium opacity-70">
                  {skill.tutorCount} tutors
                </p>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-12 text-center">
          <a
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Browse all subjects
            <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
