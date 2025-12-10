# Requirements Document

## Introduction

V10.2 "The Weakness Hunter" introduces a sophisticated Analytics Dashboard that transforms raw study data into actionable insights. This release focuses on two pillars: data aggregation that calculates accuracy by topic/tag, and visual charts that reveal strengths and weaknesses. The goal is to help users identify their weakest areas and take targeted action to improve.

## Glossary

- **Accuracy**: The percentage of correct answers out of total attempts for a given scope (tag, deck, or overall)
- **Topic Tag**: A tag categorizing cards by medical subject area (e.g., Anatomy, Endocrinology, Pharmacology)
- **Radar Chart**: A circular chart displaying multiple variables (topics) as axes radiating from a center point
- **Bar Chart**: A chart using rectangular bars to show values over time periods
- **Focus Recommendation**: An AI-driven suggestion identifying the user's weakest topic for targeted study
- **Custom Session**: A study session filtered by specific criteria (tag, deck, or difficulty)
- **Cards Learned**: Cards that have been reviewed at least once by the user
- **Strength Score**: Normalized accuracy percentage (0-100%) for a given topic

## Requirements

### Requirement 1

**User Story:** As a medical student, I want to see my accuracy broken down by topic, so that I can identify which subjects need more attention.

#### Acceptance Criteria

1. WHEN the getUserAnalytics Server Action is called THEN the System SHALL join user_card_progress with card_templates and tags tables
2. WHEN calculating accuracy per topic THEN the System SHALL compute (correct_count / total_attempts) * 100 for each tag
3. WHEN a topic has zero attempts THEN the System SHALL return null or exclude the topic from accuracy calculations
4. WHEN aggregating data THEN the System SHALL use a SQL view or optimized query to avoid fetching thousands of individual rows
5. WHEN returning analytics data THEN the System SHALL include total cards learned versus total cards available per deck

### Requirement 2

**User Story:** As a user, I want to access an analytics dashboard from the navigation, so that I can easily view my study performance.

#### Acceptance Criteria

1. WHEN the user navigates to /stats THEN the System SHALL display the Analytics Dashboard page
2. WHEN the MobileNavBar is rendered THEN the System SHALL include a Stats navigation item with chart icon
3. WHEN the Sidebar is rendered on desktop THEN the System SHALL include a Stats navigation item
4. WHEN the Stats navigation item is active THEN the System SHALL visually highlight the active state
5. WHEN the dashboard loads THEN the System SHALL display a loading state while fetching analytics data

### Requirement 3

**User Story:** As a user, I want to see a radar chart of my topic strengths, so that I can visualize my performance across all subjects at a glance.

#### Acceptance Criteria

1. WHEN the radar chart is rendered THEN the System SHALL display accuracy percentages for each topic tag as axes
2. WHEN displaying accuracy values THEN the System SHALL normalize data to a 0-100 scale
3. WHEN a topic has insufficient data (fewer than 5 attempts) THEN the System SHALL display the data point with a visual indicator of low confidence
4. WHEN the radar chart is rendered THEN the System SHALL use the recharts library for visualization
5. WHEN hovering over a data point THEN the System SHALL display a tooltip with exact accuracy percentage and attempt count

### Requirement 4

**User Story:** As a user, I want to see my study activity over the past week, so that I can track my consistency and effort.

#### Acceptance Criteria

1. WHEN the bar chart is rendered THEN the System SHALL display cards reviewed per day for the last 7 days
2. WHEN displaying daily activity THEN the System SHALL show the day name (Mon, Tue, etc.) on the x-axis
3. WHEN a day has zero reviews THEN the System SHALL display a bar with zero height
4. WHEN the bar chart is rendered THEN the System SHALL use consistent styling with the glassmorphic theme
5. WHEN hovering over a bar THEN the System SHALL display a tooltip with the exact count of cards reviewed

### Requirement 5

**User Story:** As a user, I want to receive a recommendation for my weakest topic, so that I can take immediate action to improve.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the System SHALL identify the topic with the lowest accuracy percentage
2. WHEN displaying the Focus Recommendation THEN the System SHALL show the weakest topic name and its accuracy percentage
3. WHEN the user clicks "Improve [Topic]" button THEN the System SHALL navigate to a Custom Session filtered by that tag ID
4. WHEN multiple topics have the same lowest accuracy THEN the System SHALL select the one with the most attempts
5. WHEN no topics have sufficient data THEN the System SHALL display a message encouraging more study activity

## Non-Functional Requirements

- **Performance**: Analytics queries execute in under 500ms using optimized SQL views
- **Accessibility**: Charts include aria-labels and keyboard navigation support
- **Responsiveness**: Dashboard adapts to mobile viewport with stacked chart layout
- **Data Freshness**: Analytics reflect the most recent study session data

## Out of Scope

- Historical trend analysis beyond 7 days
- Comparison with other users (leaderboards)
- Export functionality for analytics data
- Push notifications for study reminders

## Dependencies

- `recharts` package for chart visualization
- Existing tag system with topic categorization
- user_card_progress table with correct/incorrect tracking
- Custom Session builder with tag filtering capability
