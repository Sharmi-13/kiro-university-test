// Feature: link2skill-platform
// Landing page — Dual CTA section (Learners + Tutors)
// Server component

import Link from "next/link";

export default function CTASection() {
  return (
    <section
      id="for-tutors"
      aria-labelledby="cta-heading"
      className="bg-gray-50 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* --- Learner CTA --- */}
          <div className="flex flex-col rounded-3xl border border-indigo-100 bg-white p-8 shadow-sm sm:p-10">
            {/* Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>

            <h2
              id="cta-heading"
              className="mt-5 text-2xl font-bold text-gray-900 sm:text-3xl"
            >
              Ready to start learning?
            </h2>
            <p className="mt-3 flex-1 text-base leading-7 text-gray-600">
              Discover tutors matched to your subject, language, and skill level. Follow the ones you love and get a personalised feed of their latest lessons — in Tamil, English, or both.
            </p>

            <ul role="list" className="mt-6 space-y-3">
              {[
                "AI-powered tutor recommendations",
                "Personalised feed from followed tutors",
                "Save lessons and revisit anytime",
                "Comment and engage with tutors",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <svg aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Join as a Learner — it&apos;s free
            </Link>
          </div>

          {/* --- Tutor CTA --- */}
          <div className="flex flex-col rounded-3xl border border-purple-100 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 shadow-sm sm:p-10">
            {/* Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white">
              <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 1 8.835-2.535m0 0A23.74 23.74 0 0 1 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
              </svg>
            </div>

            <h2 className="mt-5 text-2xl font-bold text-white sm:text-3xl">
              Share your knowledge
            </h2>
            <p className="mt-3 flex-1 text-base leading-7 text-indigo-200">
              Build a professional profile, publish posts and video lessons, and grow a community of engaged learners — in Tamil, English, or both. Your expertise deserves an audience.
            </p>

            <ul role="list" className="mt-6 space-y-3">
              {[
                "Professional tutor profile with subjects and skill levels",
                "Publish posts, videos, and scheduled content",
                "Build a follower community",
                "Engagement analytics and follower insights",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <svg aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-indigo-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-sm text-indigo-100">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Become a Tutor
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
