// Feature: link2skill-platform
// Landing page — How It Works section
// Server component

const steps = [
  {
    step: "01",
    title: "Create your account",
    description:
      "Register as a Learner, a Tutor, or both. Choose your preferred language — Tamil or English — and set your learning interests.",
    icon: (
      <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Discover tutors and content",
    description:
      "Search tutors by subject, skill level, and language. Follow tutors you like and get a personalised feed of their posts and video lessons.",
    icon: (
      <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Learn at your own pace",
    description:
      "Read posts, watch video lessons, and save content for later. AI-powered recommendations surface the tutors and lessons most relevant to you.",
    icon: (
      <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    ),
  },
  {
    step: "04",
    title: "Tutors grow their community",
    description:
      "Publish posts and video lessons, build a following, and track your community engagement — all from a single tutor dashboard.",
    icon: (
      <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="bg-white py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
            Simple process
          </p>
          <h2
            id="how-it-works-heading"
            className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
          >
            How Link2Skill works
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            From sign-up to first lesson in minutes — for learners and tutors alike.
          </p>
        </div>

        {/* Steps grid */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2">
          {steps.map(({ step, title, description, icon }) => (
            <div
              key={step}
              className="relative rounded-2xl border border-gray-100 bg-gray-50 p-8 transition-shadow hover:shadow-md"
            >
              {/* Step number — decorative */}
              <span
                aria-hidden="true"
                className="absolute right-6 top-6 text-5xl font-black text-gray-100 select-none"
              >
                {step}
              </span>

              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
                {icon}
              </div>

              <h3 className="mt-5 text-lg font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-base leading-7 text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
