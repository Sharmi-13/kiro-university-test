# Requirements Document

## Introduction

Link2Skill is an AI-powered community learning platform that connects learners with tutors based on subject, language, and skill level. Learners can discover and follow tutors, consume educational posts and video lessons, and receive personalized tutor recommendations. Tutors can create professional profiles, publish daily learning content, and grow their own learning community. The platform supports both Tamil and English educational content.

---

## Glossary

- **Learner**: A registered user who consumes educational content and engages with tutors on the platform.
- **Tutor**: A registered user who creates educational content, builds a profile, and mentors learners.
- **Profile**: A structured page representing a Tutor's credentials, subjects, languages, skill levels offered, and published content.
- **Post**: A short-form text or image-based educational piece published by a Tutor.
- **Video_Lesson**: A long-form video-based educational unit published by a Tutor, associated with a subject and skill level.
- **Feed**: A personalized stream of Posts and Video_Lessons shown to a Learner, derived from followed Tutors and AI recommendations.
- **Recommendation_Engine**: The AI subsystem that computes and ranks Tutor and content suggestions for Learners.
- **Follow**: A unidirectional subscription relationship where a Learner subscribes to a Tutor's content updates.
- **Search_Service**: The subsystem that indexes Tutors and content and responds to Learner queries.
- **Auth_Service**: The subsystem responsible for user registration, authentication, and session management.
- **Notification_Service**: The subsystem that delivers in-platform and push notifications to users.
- **Content_Moderator**: The subsystem that reviews and enforces content policy on published Posts and Video_Lessons.
- **Language**: The natural language in which educational content is delivered; currently Tamil or English.
- **Skill_Level**: A discrete proficiency tier assigned to content or a Tutor's offering; one of Beginner, Intermediate, or Advanced.

---

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a visitor, I want to register and log in to the platform, so that I can access personalized features as either a Learner or a Tutor.

#### Acceptance Criteria

1. WHEN a visitor submits a registration form with a valid email address, a unique username between 3 and 50 characters, and a password of at least 8 characters containing at least one uppercase letter, one lowercase letter, and one digit, THE Auth_Service SHALL create a new user account and send an email verification link to the provided address within 2 minutes.
2. WHEN a visitor submits a registration form with an email address already associated with an existing account, THE Auth_Service SHALL return an error message indicating the email is already in use without creating a duplicate account.
3. WHEN a registered user submits valid credentials, THE Auth_Service SHALL issue a session token with an expiry of 24 hours and redirect the user to the platform home page.
4. WHEN a registered user submits invalid credentials, THE Auth_Service SHALL return an authentication failure message without revealing whether the email or password was incorrect.
5. IF a registered user submits invalid credentials 5 or more consecutive times, THEN THE Auth_Service SHALL lock the account for 15 minutes and return a message indicating the account is temporarily locked.
6. WHEN a session token expires, THE Auth_Service SHALL invalidate the token and require the user to re-authenticate before accessing protected resources.
7. WHEN a registered user requests a password reset, THE Auth_Service SHALL send a one-time reset link to the user's verified email address, valid for 30 minutes, and invalidate any previously issued unexpired reset links for that account.
8. THE Auth_Service SHALL support account role selection at registration, allowing the user to register as a Learner, a Tutor, or both.
9. IF a visitor submits a registration form with a username fewer than 3 characters, more than 50 characters, or containing characters other than letters, digits, underscores, or hyphens, THEN THE Auth_Service SHALL return an error message indicating the specific username constraint that was violated without creating an account.

---

### Requirement 2: Tutor Profile Creation and Management

**User Story:** As a Tutor, I want to create and manage a professional profile, so that Learners can discover me and understand my expertise.

#### Acceptance Criteria

1. THE Platform SHALL allow a Tutor to create a Profile containing a display name of 2 to 50 characters, a profile photo, a biography of up to 500 characters, at least one subject, at least one Language, and at least one Skill_Level.
2. WHEN a Tutor saves Profile changes, THE Platform SHALL persist the updated Profile and make the changes visible to Learners within 5 seconds.
3. WHEN a Tutor attempts to save a Profile without a display name, without at least one subject, without at least one Language, or without at least one Skill_Level, THE Platform SHALL reject the save and return an error message indicating which required fields are missing.
4. WHEN a Tutor uploads a profile photo larger than 5 MB, THE Platform SHALL reject the upload and return an error message specifying the size limit.
5. WHEN a Tutor uploads a profile photo in an unsupported format, THE Platform SHALL reject the upload and return an error message listing the supported formats (JPEG, PNG, WebP).
6. THE Platform SHALL allow a Tutor to list up to 10 subjects on a Profile.
7. WHEN a Tutor attempts to add more than 10 subjects to a Profile, THE Platform SHALL reject the addition and return an error message indicating the 10-subject limit.
8. THE Platform SHALL allow a Tutor to set a Profile visibility to either Public or Private; a Private Profile SHALL NOT appear in Search_Service results or Recommendation_Engine outputs.
9. WHEN a Tutor deactivates an account, THE Platform SHALL hide the Tutor's Profile and associated content from all Learner-facing views within 60 seconds.

---

### Requirement 3: Learner Profile Setup

**User Story:** As a Learner, I want to set up my learning preferences, so that the platform can recommend relevant tutors and content to me.

#### Acceptance Criteria

1. THE Platform SHALL allow a Learner to specify a preferred Language (Tamil, English, or both) during onboarding.
2. THE Platform SHALL allow a Learner to specify between 1 and 10 subjects of interest during onboarding.
3. THE Platform SHALL allow a Learner to specify a Skill_Level (Beginner, Intermediate, or Advanced) per subject of interest during onboarding.
4. WHEN a Learner submits updated learning preferences, THE Recommendation_Engine SHALL incorporate the updated preferences in subsequent recommendation calculations within 10 seconds.
5. THE Platform SHALL allow a Learner to update preferred Language, subjects, and Skill_Level at any time from the account settings page.
6. IF a Learner submits onboarding preferences without selecting at least one subject of interest, THEN THE Platform SHALL reject the submission and display an error message indicating that at least one subject is required.
7. IF a Learner attempts to add more than 10 subjects of interest, THEN THE Platform SHALL reject the addition and display an error message indicating the maximum subject limit has been reached.

---

### Requirement 4: Tutor Search

**User Story:** As a Learner, I want to search for tutors by subject, language, and skill level, so that I can find educators who match my learning needs.

#### Acceptance Criteria

1. WHEN a Learner submits a search query containing at least one of subject, Language, or Skill_Level, THE Search_Service SHALL return a ranked list of matching Tutor Profiles within 2 seconds.
2. WHEN a Learner submits a search query that matches no Tutor Profiles, THE Search_Service SHALL return an empty result set accompanied by a message suggesting the Learner broaden the search criteria.
3. THE Search_Service SHALL exclude Tutor Profiles with Private visibility from all search results.
4. THE Search_Service SHALL rank Tutor Profiles by relevance to the submitted query parameters, with exact subject matches ranked above partial matches, and profiles with a higher average rating ranked above profiles of equal match relevance.
5. WHEN a Learner applies multiple filters simultaneously, THE Search_Service SHALL return only Profiles satisfying all active filters within 2 seconds.
6. WHEN a Learner enters a search query in Tamil script, THE Search_Service SHALL process the query and return results without requiring transliteration by the Learner.
7. IF a Learner submits a search query with a subject string exceeding 100 characters, or a Language or Skill_Level value not in the system-defined valid list, THEN THE Search_Service SHALL reject the query and return an error message indicating which parameter is invalid.
8. IF THE Search_Service fails to return results within 2 seconds due to a service error, THEN THE Search_Service SHALL return an error message indicating search is temporarily unavailable without returning partial results.

---

### Requirement 5: Follow Tutors

**User Story:** As a Learner, I want to follow tutors I like, so that I receive updates when they publish new content.

#### Acceptance Criteria

1. WHEN a Learner activates the Follow action on a Tutor's Profile, THE Platform SHALL record the Follow relationship and add Posts and Video_Lessons published by that Tutor after the follow timestamp to the Learner's Feed.
2. IF the Follow action fails due to a system error, THEN THE Platform SHALL display an error message indicating the follow could not be completed and SHALL NOT record a Follow relationship.
3. WHEN a Learner activates the Unfollow action on a Tutor's Profile, THE Platform SHALL remove the Follow relationship and exclude Posts and Video_Lessons published by that Tutor after the unfollow timestamp from the Learner's Feed.
4. IF the Unfollow action fails due to a system error, THEN THE Platform SHALL display an error message indicating the unfollow could not be completed and SHALL NOT remove the existing Follow relationship.
5. WHEN a Learner activates the Follow or Unfollow action on a Tutor's Profile, THE Platform SHALL update the displayed follower count on that Tutor's Profile to reflect the change within 10 seconds of the action completing.
6. WHEN a Tutor publishes a new Post or Video_Lesson, THE Notification_Service SHALL deliver an in-platform notification to all Learners who have an active Follow relationship with that Tutor within 60 seconds of publication.
7. IF THE Notification_Service is unavailable when a Tutor publishes a new Post or Video_Lesson, THEN THE Platform SHALL deliver the pending notifications to affected Learners within 60 seconds of the Notification_Service becoming available again.
8. THE Platform SHALL prevent a Learner from following the same Tutor more than once; a duplicate Follow action SHALL be silently ignored with no change to the existing Follow relationship or follower count.

---

### Requirement 6: Educational Content Publishing by Tutors

**User Story:** As a Tutor, I want to publish educational posts and video lessons, so that I can share knowledge with my community of learners.

#### Acceptance Criteria

1. THE Platform SHALL allow a Tutor to create a Post containing a title of 1 to 150 characters, body text of 1 to 2000 characters, an optional image attachment no larger than 10 MB in JPEG, PNG, or WebP format, exactly one subject tag, exactly one Language tag, and exactly one Skill_Level tag.
2. THE Platform SHALL allow a Tutor to publish a Video_Lesson by providing a YouTube video URL, a title, a description, one subject tag, one language tag, and one skill level tag.
3. WHEN a Tutor submits an invalid or unsupported YouTube URL, THE Platform SHALL reject the submission and display an error message.
4. WHEN a valid YouTube URL is submitted, THE Platform SHALL embed the video on the Tutor's profile and make it available to Learners.
5. IF a Tutor submits a Post or Video_Lesson with a required field empty or a field value exceeding its character or size limit, THEN THE Platform SHALL reject the submission without saving any content and return an error message identifying each invalid field.
6. WHEN a Tutor publishes a Post or Video_Lesson, THE Content_Moderator SHALL evaluate the content against the platform content policy within 5 minutes of publication and flag content that violates the policy for human review.
7. WHEN the Content_Moderator flags a Post or Video_Lesson, THE Platform SHALL set the content status to Under_Review and hide it from all Learner-facing views within 30 seconds of the flag being raised, until a human reviewer resolves the flag.
8. THE Platform SHALL allow a Tutor to edit a published Post or Video_Lesson at any time, provided the content status is not Under_Review.
9. WHEN a Tutor deletes a Post or Video_Lesson, THE Platform SHALL remove the content from all Learner Feeds and from the Tutor's Profile within 30 seconds and set the content status to Deleted.
10. WHEN a Tutor specifies a future publish date and time for a Post or Video_Lesson and saves it, THE Platform SHALL store the content with a Scheduled status and publish it automatically within 60 seconds of the scheduled time being reached.
11. IF the automatic publication of a Scheduled Post or Video_Lesson fails, THEN THE Platform SHALL retain the content in Scheduled status and notify the Tutor with an error message indicating that publication did not occur.

---

### Requirement 7: Personalized Feed

**User Story:** As a Learner, I want to see a personalized feed of educational content, so that I can discover relevant posts and lessons without manual searching.

#### Acceptance Criteria

1. WHEN a Learner opens the home page, THE Platform SHALL display a Feed containing Posts and Video_Lessons from followed Tutors and Recommendation_Engine suggestions, sorted by a combination of recency and relevance score, with the initial Feed page containing at least 10 items.
2. THE Feed SHALL exclude content in a Language not included in the Learner's preferred languages list.
3. THE Feed SHALL prioritize content whose Skill_Level exactly matches the Learner's specified Skill_Level for the corresponding subject by ranking matching-Skill_Level items above non-matching-Skill_Level items of equal recency and relevance score.
4. WHEN a Learner scrolls to the end of the currently loaded Feed, THE Platform SHALL load the next page of Feed items, containing at least 10 items, within 2 seconds.
5. WHEN a Learner has no Follow relationships and no learning preferences set, THE Platform SHALL populate the Feed with the top 20 globally trending Posts and Video_Lessons ranked by engagement count over the previous 7 days, across all subjects and languages.
6. WHEN a Post or Video_Lesson is deleted by its author, THE Platform SHALL remove it from all active Learner Feeds within 30 seconds.
7. IF the Recommendation_Engine fails to return suggestions within 5 seconds, THEN THE Platform SHALL display the Feed populated solely with Posts and Video_Lessons from the Learner's followed Tutors, sorted by recency descending, without displaying an error state to the Learner.
8. IF a Learner has Follow relationships or learning preferences set but the resulting Feed contains fewer than 5 items, THEN THE Platform SHALL supplement the Feed with globally trending Posts and Video_Lessons to reach a minimum of 10 displayed items.

---

### Requirement 8: AI-Powered Tutor Recommendations

**User Story:** As a Learner, I want the platform to recommend tutors that match my interests, so that I can discover new educators without extensive searching.

#### Acceptance Criteria

1. THE Recommendation_Engine SHALL generate a ranked list of up to 10 Tutor recommendations for each Learner, based on the Learner's preferred subjects, Language, Skill_Level, and Follow history, where each recommended Tutor matches at least one of the Learner's preferred subjects or Language.
2. WHEN a Learner updates learning preferences, THE Recommendation_Engine SHALL regenerate recommendations and display the updated list to the Learner within 10 seconds.
3. WHEN a Learner follows or unfollows a Tutor, THE Recommendation_Engine SHALL update the recommendation list to exclude all Tutors the Learner currently follows within 10 seconds.
4. THE Recommendation_Engine SHALL exclude Tutor Profiles with Private visibility from all recommendation outputs.
5. THE Recommendation_Engine SHALL NOT recommend a Tutor to a Learner who has already followed that Tutor.
6. WHEN fewer than 10 eligible Tutors exist for a Learner's preferences, THE Recommendation_Engine SHALL return all eligible Tutors without padding the list with irrelevant results.
7. WHEN no eligible Tutors exist for a Learner's preferences, THE Recommendation_Engine SHALL return an empty list and display a message prompting the Learner to update their learning preferences.
8. IF the Recommendation_Engine fails to generate recommendations within 10 seconds, THEN THE Platform SHALL display the Learner's last known recommendation list marked as potentially stale, without displaying an error state.

---

### Requirement 9: Bilingual Content Support (Tamil and English)

**User Story:** As a Learner or Tutor, I want to use the platform in Tamil or English, so that I can engage with content in my preferred language.

#### Acceptance Criteria

1. THE Platform SHALL render all platform UI labels, navigation elements, error messages, and instructional text in English by default.
2. WHEN a user selects Tamil as the display language, THE Platform SHALL render all platform UI labels, navigation elements, error messages, and instructional text in Tamil within 2 seconds of the selection.
3. WHEN a Tutor attempts to publish a Post or Video_Lesson without selecting a Language tag, THE Platform SHALL reject the submission and return an error message indicating that a Language tag is required.
4. WHEN a Learner submits a search query in Tamil script or Latin script, THE Search_Service SHALL process the query and return matching results within 3 seconds without requiring the user to switch input modes.
5. THE Platform SHALL store and display Tamil text using Unicode encoding such that the characters retrieved and rendered match the Unicode code points as stored, and SHALL NOT alter Tamil characters during storage, retrieval, or rendering.
6. THE Platform SHALL allow a Learner to filter the Feed and Browse results by Language, displaying only Posts and Video_Lessons tagged with the selected Language.
7. THE Platform SHALL persist a user's selected display language across sessions so that subsequent logins restore the previously selected language without requiring re-selection.

---

### Requirement 10: Content Discovery and Browsing

**User Story:** As a Learner, I want to browse educational content by subject and language, so that I can explore topics beyond my current follow list.

#### Acceptance Criteria

1. THE Platform SHALL provide a Browse view organized by subject categories, where each category displays its name and the total count of available Posts and Video_Lessons.
2. WHEN a Learner selects a subject category in the Browse view, THE Platform SHALL display up to 50 of the most recent and highest-rated Posts and Video_Lessons in that subject within 2 seconds, ranked first by rating descending and then by publication date descending where ratings are equal.
3. THE Platform SHALL allow a Learner to filter Browse results by Language, Skill_Level, or content type (Post or Video_Lesson), where each filter accepts one value at a time and filters are combinable.
4. WHEN a Learner applies Browse filters, THE Platform SHALL update the displayed results within 1 second.
5. IF a Learner applies Browse filters that match no available Posts or Video_Lessons, THEN THE Platform SHALL display a message indicating no results were found for the selected filters.
6. THE Platform SHALL allow a Learner to save a Post or Video_Lesson to a personal Saved Items collection, where the Saved Items collection holds a maximum of 500 items per Learner.
7. IF a Learner attempts to save an item to a Saved Items collection that has reached the 500-item limit, THEN THE Platform SHALL display an error message indicating the collection is full and the item was not saved.
8. WHEN a Learner opens the Saved Items collection, THE Platform SHALL display all saved content sorted by the date each item was saved, with the most recently saved item first.

---

### Requirement 11: Tutor Community Building

**User Story:** As a Tutor, I want to build and engage with my own learning community, so that I can grow my audience and foster interaction among my followers.

#### Acceptance Criteria

1. THE Platform SHALL provide each Tutor with a Community page displaying the Tutor's published Posts, Video_Lessons, total follower count, and a list of the 20 most recent followers sorted by follow date descending.
2. THE Platform SHALL allow a Tutor to view aggregate engagement metrics (total views, total saves, and net follower growth) on the Community page, calculated over a rolling 30-day window ending at the current date.
3. WHEN a Learner saves a Tutor's Post or Video_Lesson, THE Platform SHALL increment the save count for that content item and reflect the updated count on the content item within 10 seconds.
4. THE Platform SHALL allow Learners to post comments on a Tutor's Post or Video_Lesson, where each comment is between 1 and 1000 characters in length.
5. IF a Learner submits a comment exceeding 1000 characters or containing 0 characters, THEN THE Platform SHALL reject the comment and display an error message indicating the character limit requirement without saving the comment.
6. WHEN a Learner posts a comment, THE Notification_Service SHALL deliver a notification to the Tutor indicating the commenter's identity and the content item title within 60 seconds.
7. WHEN a Tutor deletes a comment posted on the Tutor's own content, THE Platform SHALL remove the comment from the content item's comment list within 10 seconds and display a confirmation to the Tutor.
8. IF a Learner attempts to post a comment while not authenticated, THEN THE Platform SHALL reject the comment and display an error message indicating that authentication is required.

---

### Requirement 12: Notifications

**User Story:** As a user, I want to receive timely notifications about relevant activity, so that I stay informed without constantly checking the platform.

#### Acceptance Criteria

1. WHEN a followed Tutor publishes a new Post or Video_Lesson, THE Notification_Service SHALL deliver an in-platform notification to the Learner within 60 seconds.
2. WHEN a Learner posts a comment on a Tutor's content, THE Notification_Service SHALL deliver an in-platform notification to the Tutor within 60 seconds.
3. WHEN a new Learner follows a Tutor, THE Notification_Service SHALL deliver an in-platform notification to the Tutor within 60 seconds.
4. THE Platform SHALL allow a user to configure notification preferences to enable or disable each notification type independently, where notification types include: new post or video by followed Tutor, comment on own content, and new follower.
5. WHEN a user disables a specific notification type, THE Notification_Service SHALL cease delivering that notification type to the user until the user re-enables it.
6. THE Platform SHALL provide a Notifications inbox displaying all unread notifications sorted by descending publication timestamp, accessible from the main navigation, showing at most 100 unread notifications.
7. WHEN a user opens or marks a notification as read, THE Platform SHALL update that notification's status from unread to read and remove it from the unread count within 5 seconds.
8. IF the Notification_Service fails to deliver a notification within 60 seconds due to a service error, THEN THE Notification_Service SHALL retry delivery at least once within 120 seconds of the original trigger event.
