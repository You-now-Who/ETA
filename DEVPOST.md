![meme](https://logmyhours.com/blog/wp-content/uploads/2019/04/6.jpg)

### For a breakdown of how I implemented Auth0, please scroll down 👇

## ✨ Inspiration:

What's a task you want to complete, of late? How much time do you think it'll take to complete? Did you think of a number?

Cool. Now pause for a second and ask yourself: how did you arrive at that number? Gut feeling? Vibes? Last time it took 3 hours, so you’re saying 2 this time for some reason?

Chances are, unless you've been rigorously refining your intuition, the number that you gave is based off of... vibes.

Humans are notoriously BAD at accurately predicting time. In a famous experiment by Roger Buehler & Dale Griffin (1994):

- A group of psychology students predicted how long it would take them to complete their senior theses.

- On average, they estimated 33.9 days.

- When asked for best-case and worst-case ranges:

    - Best case: 27.4 days

    - Worst case: 48.6 days

- But the reality? Most students finished in 55.5 days, often exceeding even their “worst case” estimate


From this, we thought of creating a project that could help us become better at estimating time for our work.

## 📝 What it does

ETA (Estimated Time of Arrival) is your personal time estimation trainer - think of it as a gym membership for your brain, but instead of building muscle, you're building the ability to not lie to yourself about deadlines.

Here's how it works:

Step 1: Make Your Prediction You tell ETA how long you think a task will take. Not just a single number, but confidence intervals so that you can be much more accurate about your predictions. "I'm 75% confident this will take between 2-4 hours, and 95% confident it won't exceed 6 hours."

Step 2: Do The Thing You actually complete the task (revolutionary concept, we know). Then you come back and log how long it actually took, plus reflect on why your estimate was probably wrong. Spoiler alert: it usually is.

Step 3: Face The Truth ETA shows you beautiful, soul-crushing charts that visualize exactly how bad you are at predicting time. But here's the magic - over time, these charts start showing improvement as you calibrate your internal clock.

Step 4: Improve

We've tried to provide actionable insights to aid in rapid improvements. These are in the form of scientific terminology and resources. We hope this can be useful to you!

## 💻 How we built it

The application was built using next js, and the authentication was handled by Auth0. We were interacting with Auth0 after a long time, and the docs were completely new. We were very interested by the low code setup the Auth0 provided, and it was incredibly fun to play around with them.

### Auth0

We used Auth0 for user authentication and data management. Honestly, this was both incredibly fun and incredibly stressful.

#### Authentication Flow:

- Universal Login with Google, GitHub, and email options

- Users stay logged in across sessions

- All prediction data syncs across devices

#### Custom Onboarding Forms: We built forms that collect user info on signup:

- User type (student, professional, freelancer, manager)

- Confidence level in time estimates (1-10 scale)

- Work environment and team size

- Project complexity preferences

This data personalizes the app experience.

#### Management API:

- Stores user preferences and calibration settings

- Custom /api/user/[user] endpoint fetches complete user profiles

- Tracks historical accuracy patterns

- Handles data export and privacy controls

#### Automation:

- New users get onboarding forms automatically

- Login triggers update user streaks and engagement data

- JWT tokens include custom claims for user tiers and preferences

Result: Users get a personalized experience that remembers their data across sessions.

😓 Challenges I ran into

If this hackathon submission was a movie, it would be a gripping thriller. It had it all, laptop crashes, bugs, wrong documentation, Devpost issues and several incomplete features. 10/10 for entertainment, but 0/10 if you were an actor in the movie 😔.

Aside from those, implementing flows and actions with Auth0 was kind of hard, and I needed some time to understand how to get it working.

## 🏆 Accomplishments that I'm proud of

Completing and submitting this. Having insightful conversations with my team mates. Generally having fun.

## 🎯 What's next

In short:

- Bayesian updation methods

- Better tagging

- An achievement system (which I had to scrap)
