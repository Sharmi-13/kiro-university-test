// Feature: link2skill-platform
// Landing page — Bilingual (Tamil + English) emphasis section
// Server component

export default function BilingualSection() {
  return (
    <section
      aria-labelledby="bilingual-heading"
      className="bg-white py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left — English side */}
            <div className="px-8 py-12 sm:px-12 lg:py-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-200">
                English learners
              </p>
              <h2
                id="bilingual-heading"
                className="mt-3 text-3xl font-extrabold text-white sm:text-4xl"
              >
                Learn in the language you think in
              </h2>
              <p className="mt-4 text-lg leading-8 text-indigo-200">
                Every post, lesson, and tutor on Link2Skill is tagged with a language. Find
                English-medium tutors covering any subject — from mathematics to music.
              </p>
              <ul className="mt-6 space-y-3" role="list">
                {[
                  "All skill levels: Beginner, Intermediate, Advanced",
                  "English-medium tutors across all subjects",
                  "AI recommendations in your preferred language",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span className="text-sm text-indigo-100">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — Tamil side */}
            <div className="border-t border-white/20 bg-white/10 px-8 py-12 sm:px-12 lg:border-l lg:border-t-0 lg:py-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-rose-200">
                தமிழ் கற்போர்
              </p>
              <h2
                lang="ta"
                className="mt-3 text-3xl font-extrabold text-white sm:text-4xl"
              >
                உங்கள் மொழியில் கற்றுக்கொள்ளுங்கள்
              </h2>
              <p lang="ta" className="mt-4 text-lg leading-8 text-indigo-200">
                Link2Skill-இல் ஒவ்வொரு பாடமும் மொழிக் குறிச்சொல்லுடன் வரும். தமிழ் வழியில்
                கணிதம் முதல் இசை வரை கற்றுக்கொள்ளுங்கள்.
              </p>
              <ul className="mt-6 space-y-3" role="list">
                {[
                  { en: "Tamil-medium tutors for every subject", ta: "எல்லாப் பாடத்திலும் தமிழ் ஆசிரியர்கள்" },
                  { en: "Tamil Unicode support throughout the platform", ta: "முழு தமிழ் யூனிகோட் ஆதரவு" },
                  { en: "Search in Tamil script — no transliteration needed", ta: "தமிழில் தேடுங்கள் — மொழிமாற்றம் தேவையில்லை" },
                ].map(({ en, ta }) => (
                  <li key={en} className="flex items-start gap-3">
                    <svg aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span lang="ta" className="text-sm text-indigo-100">{ta}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
