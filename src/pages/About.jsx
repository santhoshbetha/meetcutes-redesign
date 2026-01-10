import React from "react";

export function About() {
  return (
    <main className="max-w-5xl mx-auto px-4 md:px-8 py-4 md:py-6">
      <h2 className="text-2xl md:text-2xl font-bold text-center mb-3 md:mb-4 text-balance">
        About MeetCutes.us
      </h2>

      <div className="space-y-2">
        {/* What is this section */}
        <section className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl p-6 md:p-8 shadow-sm border border-blue-100 dark:border-blue-900/30">
          <h2 className="text-xl md:text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">
            What is this
          </h2>
          <div className="space-y-3 text-sm md:text-base text-blue-900/90 dark:text-blue-100/90 leading-relaxed">
            <p>
              This is an app to make people meet in a organic way. Created to
              bring approachable people together.
            </p>
            <p>
              No more searching at bars or wasting time with forever messages.
              Schedule events at local stores/malls/coffee shops/parks. Others
              in your vicinity will be notified. Make organic conversations and
              have a shot.
            </p>
            <p>
              It is a mix of "dating" and "meetup" apps. Create a profile with
              basic info here. Look up events in your area. Make contact with
              other people who are willing to be approached.
            </p>
            <p>
              Meet someone "first" in the events. Verify their profile in this
              app using there handle/email "next". Move forward.
            </p>
          </div>
        </section>

        {/* How it Works section */}
        <section className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-6 md:p-8 shadow-sm border border-amber-100 dark:border-amber-900/30">
          <h2 className="text-xl md:text-2xl font-bold text-amber-900 dark:text-amber-100 mb-4">
            How it Works
          </h2>
          <div className="space-y-3 text-sm md:text-base text-amber-900/90 dark:text-amber-100/90 leading-relaxed">
            <ul className="space-y-2 list-disc list-inside">
              <li>Register for events in your area, create one if required.</li>
              <li>
                Just hang around at event location and make contact to only
                people you find interested or who shows you interest.
              </li>
              <li>
                No pressure to talk to all the people attending the events.
              </li>
              <li>Bring a friend as a wingman if needed.</li>
            </ul>
            <p className="mt-4">
              To distinguish from other people at the event locations, be well
              dressed, or you may purchase and wear one of the rings of you
              choice from below options:
            </p>
            <ul className="space-y-2 ml-4">
              <li>💍 approach ring 1</li>
              <li>💍 option 2</li>
              <li>💍 option 3</li>
            </ul>
            <p className="mt-4 font-medium">
              Recommended color of the ring: Aqua or Teal.
            </p>
            <p>
              Notice others with above ring or well dressed and start
              conversations.
            </p>
          </div>
        </section>

        {/* Who is it for section */}
        <section className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-6 md:p-8 shadow-sm border border-emerald-100 dark:border-emerald-900/30">
          <h2 className="text-xl md:text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-4">
            Who is it for
          </h2>
          <div className="space-y-3 text-sm md:text-base text-emerald-900/90 dark:text-emerald-100/90 leading-relaxed">
            <p>
              This app is for people with realistic expectations and end goal is
              having family/kids. Not for players and 304s.
            </p>
            <p>
              This app is made for hardworking (working class) people who have
              little time to waste. This app is to help working class people (in
              9 to 5 jobs or similar (blue and white collar)) people who have
              few holidays and time to meet people to move forward in life.
            </p>
            <p>
              This app is people who are looking to date with intentions. Not
              for short term seekers. Not for single mothers/fathers. Not for
              divorcees.
            </p>
            <p>
              People in any fast money businesses need not apply.
              Celebrities/Rappers/Sports people/Crypto people/Influencers/OF
              girls/Trust fund babies/people with inherited wealth or any other
              fast money businesses need not apply.
            </p>
          </div>
        </section>

        {/* What this is not section */}
        <section className="bg-rose-50 dark:bg-rose-950/20 rounded-2xl p-6 md:p-8 shadow-sm border border-rose-100 dark:border-rose-900/30">
          <h2 className="text-xl md:text-2xl font-bold text-rose-900 dark:text-rose-100 mb-4">
            What this is not
          </h2>
          <div className="space-y-3 text-sm md:text-base text-rose-900/90 dark:text-rose-100/90 leading-relaxed">
            <p>This is not speed dating events creation platform.</p>
            <p>
              This platform is not for any kind of middlemen like dating
              coaches/event organizers/hosts who organize dating events. this is
              a peer-to-peer platform.
            </p>
            <p>
              Do not use this platform to create events at bars or pubs, because
              that is not where you find spouses.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
