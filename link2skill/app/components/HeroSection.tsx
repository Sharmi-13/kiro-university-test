// Feature: link2skill-platform
// Landing page — Hero section
// Server component

import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-white"
    >
      {/* Decorative gradient blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-300 to-purple-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          {/* Bilingual badge */}
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
              <span>Proudly bilingual</span>
              <span aria-hidden="true">·</span>
              <span lang="ta">தமிழ் &amp; English</span>
            </span>
          </div>

          <h1
            id="hero-heading"
            className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
          >
            Learn any skill from{" "}
            <span className="text-indigo-600">expert tutors</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Link2Skill connects learners and tutors across Tamil and English educational content —
            discover tutors, follow their lessons, and grow at your own pace.
          </p>

          {/* Primary CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="w-full rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:w-auto"
            >
              Start learning — it&apos;s free
            </Link>
            <Link
              href="#how-it-works"
              className="w-full rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 sm:w-auto"
            >
              See how it works
            </Link>
          </div>

          {/* Social proof stats */}
          <dl className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { label: "Active tutors", value: "500+" },
              { label: "Subjects covered", value: "80+" },
              { label: "Languages", value: "Tamil & English" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-2xl border border-gray-100 bg-gray-50 px-6 py-5"
              >
                <dt className="text-sm font-medium text-gray-500">{label}</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Bottom decorative blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
      >
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-purple-300 to-indigo-400 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
      </div>
    </section>
  );
}
