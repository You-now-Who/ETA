# Progressive Profiling with Auth0 Implementation

This implementation provides progressive profiling using Auth0 Actions and user metadata.

## Features

- ✅ **Progressive Profiling**: Collects user preferences on the 3rd login
- ✅ **Auth0 Actions Integration**: Uses PostLogin trigger to track login count
- ✅ **User Metadata Storage**: Stores preferences in Auth0 user_metadata
- ✅ **Management API**: Updates user metadata from the frontend
- ✅ **Dashboard Integration**: Displays user profile information
- ✅ **Conditional Redirects**: Automatically redirects to profile setup when needed

## Setup Instructions

### 1. Auth0 Configuration

#### Create Management API Application
1. Go to Auth0 Dashboard > Applications
2. Create a new "Machine to Machine" application
3. Authorize it for the "Auth0 Management API"
4. Grant the following scopes:
   - `read:users`
   - `update:users`
5. Copy the Client ID and Client Secret to your `.env.local`

#### Add PostLogin Action
1. Go to Auth0 Dashboard > Actions > Flows
2. Select "Login" flow
3. Create a new action with the code from `auth0-actions/postlogin-progressive-profiling.js`
4. Add it to your Login flow

### 2. Environment Variables

Add to your `.env.local`:
```env
AUTH0_MANAGEMENT_CLIENT_ID=your_management_api_client_id
AUTH0_MANAGEMENT_CLIENT_SECRET=your_management_api_client_secret
```

### 3. Application Flow

#### First/Second Login
- User logs in normally
- Auth0 Action increments login count
- User sees regular dashboard

#### Third Login
- Auth0 Action detects it's the 3rd login
- If user hasn't completed profile setup, redirects to `/profile-setup`
- User fills out:
  - Task types they usually track
  - Self-rated confidence level (1-10)
- Data is saved to Auth0 user_metadata
- User is redirected to dashboard

#### Subsequent Logins
- Profile data is displayed in dashboard
- Option to update profile (you can add an "Edit Profile" link)

## API Endpoints

### POST `/api/user/metadata`
Updates user metadata with profile information.

**Request:**
```json
{
  "taskTypes": ["Software Development", "Project Management"],
  "confidenceLevel": 7
}
```

**Response:**
```json
{
  "success": true,
  "metadata": {
    "task_types": ["Software Development", "Project Management"],
    "confidence_level": 7,
    "profile_setup_completed": true,
    "profile_setup_date": "2025-01-27T..."
  }
}
```

### GET `/api/user/metadata`
Retrieves user metadata.

## Components

### UserProfileCard
- Displays welcome message with login count
- Shows profile completion status
- Displays task types and confidence level
- Provides link to complete profile if not done

### Profile Setup Page (`/profile-setup`)
- Collects task types (multi-select)
- Collects confidence level (1-10 slider)
- Validates and saves to Auth0
- Redirects to dashboard on completion

## Data Structure

User metadata stored in Auth0:
```json
{
  "task_types": ["Software Development", "Design Work"],
  "confidence_level": 8,
  "profile_setup_completed": true,
  "profile_setup_date": "2025-01-27T10:30:00.000Z"
}
```

App metadata (managed by Auth0 Action):
```json
{
  "login_count": 5
}
```

## Customization

### Adding More Profile Fields
1. Update the form in `/profile-setup/page.js`
2. Add fields to the API endpoint validation
3. Update the display in `UserProfileCard.jsx`

### Changing Trigger Conditions
Modify the Auth0 Action to trigger on different login counts or conditions.

### Styling
All components use Tailwind CSS and match your existing design system.

## Testing

1. Clear your browser's localStorage and Auth0 session
2. Log in - should see login count #1
3. Log out and log in again - should see login count #2
4. Log out and log in a third time - should redirect to profile setup
5. Complete profile - should redirect to dashboard with profile displayed

## Troubleshooting

### Profile Setup Not Triggering
- Check Auth0 Action is properly added to Login flow
- Verify the redirect URL matches your domain
- Check browser console for errors

### Management API Errors
- Verify Management API application has correct scopes
- Check Client ID and Secret in environment variables
- Ensure the application is authorized for Management API

### User Metadata Not Showing
- Check that Auth0 Action is adding custom claims to ID token
- Verify the namespace URL matches in both Action and frontend code
- Check browser network tab for API errors
