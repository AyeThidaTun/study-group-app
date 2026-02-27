# project-management-board

Starter project for ST0526 CICD

## Getting Started

1. Procure 2 Postgres Database (e.g. from Neon DB), one would be used for development and the other for test environment
2. Create 2 `.env` file named `.env.development` and `.env.test` both with the following content:

   ```
   DATABASE_URL=
   PORT=
   JWT_SECRET_KEY=
   JWT_EXPIRES_IN=
   JWT_ALGORITHM=
   ```

   2.1 `DATABASE_URL`: Paste the connection string for development and test environment into the `.env` files respectively.
   2.2 Set PORT to `3000` for `.env.development` and `3001` for `.env.test`

3. Install dependencies: `npm install`
4. Setup database: `npm run migration:reset`
5. Install Playwright: `npx playwright install`
6. Start server: `npm start`
7. Run end-2-end test: `npm test`

### Additional Useful Scripts

1. `npm run lint` It helps maintain code quality and consistency by identifying syntax errors, potential bugs, and stylistic issues.
2. `npm run migration:dev` This script uses dotenv to load environment variables from the .env.development file and runs npx prisma migrate dev, which applies any new migrations to the database. It ensures that the development database schema stays in sync with the current state of the Prisma schema.

# App's Main Purpose

The application is a studying app for the SP students by the SP students.
To help SP students work efficiently and productively through collaboration,
quizzes to practice, motivation through gamification, streamlined resources, forums and more.

## App's Main Features 

### Isaac's Features
1. User Authentication: User registration and login implemented with bcrypt for secure password hashing.
2. Profile Management: Users can update their profile details, including profile picture, password, and name.
3. Data Visualization: Homepage displays user stats, quiz completion trends, and top 5 users by points.
4. Quiz Functionality: Users can take quizzes by selecting a school and module, and view quiz history and results.
5. Suggestions: Users can create app suggestions, saved as drafts until submitted for admin review.
6. Admin Controls: Admins can approve or reject user suggestions with reasons provided.

### Alice's Features
1. Resources feature: Allow user to see all resources as well as through categories. 
2. Manage resources: User can create resources and they can also update,delete, add tags to the resources that they created.
3. Popular resources: This shows most popular resources within a week.
4. Bookmark: User can read their bookmarks and delete them.
5. State management for progress: User can choose to continue reading later. They can mark them as unread or read which will update the progress to 0% and 100% respectively.

6. Matching system: Based on all of the characteristics of the tutor and tutee, they will get matched and recommended.
7. Your tutors page: It includes the calendar intergrated feature including different sections for different booking statuses.
8. All tutors page: User can filter tutors here based on three criteria.
9. Tutor dashboard: It includes two pages where tutors can add slots and view their tutees. Session management is applied so that only tutors can access these pages.
10. TutorSlot page: tutor can add and edit, delete slots. but they cannot modify the slots that tutees have taken.
11. Tutees page: Users can view tutees who requested to book their slots and take actions like cancel or approve.


### Anna's Features
1. Study Group Management: Create, join, leave, or delete study groups while viewing group details, including descriptions and member lists.
2. Study Room Booking: Browse and book available study rooms with filters for room types and real-time slot availability.
3. Booking State Management: Handle booking statuses (pending, confirmed, or cancelled) with automated timeout-based updates.
4. Advanced UI Features: Utilize an interactive calendar, dynamic booking forms, and responsive card-based layouts for an enhanced user experience.
5. Event listeners: Event listeners dynamically handle user interactions like date selection, button clicks, form submissions, and dropdown changes to ensure a responsive and seamless user experience.

### Redwans's Features
Users will be able to see Question & answers with author name & date posted by navigating to Q&A page.
Here is the brief explanation of the complete features related the Question & Answer feature:
1. Posting Question: Logged in user can post question by inluding Question title, Question content, selecting module & user also can upload image/docs. 
2. Ansering Question: Logged in user can answer the posted questions.
3. Manage Q&A: Owner of the content will be able to update or delete their content.
4. Filter Questions: User will be able filter questions by popularity, date posted, module name etc.
5. Like Questions & Answer: Logged in user can like or unlike any question or answer
6. Save Questions: Loggedin user can save question to track it later on.
7. Changing States of content: User can change their own question status from active to solved & it will be auto archived if no interaction in the question for more than 90 days. User will also be able to keep their answer as draft or can directly publish it to make it visible for other users.