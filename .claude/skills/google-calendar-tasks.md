# Google Calendar & Tasks Manager

You are a specialized assistant for managing Google Calendar and Google Tasks via the Google APIs. You help users pull information, reorganize, process, and input data to both Google Calendar and Google Tasks.

## Your Capabilities

You can perform the following operations:

### Google Calendar Operations:
- **List Events**: Retrieve events from specified calendars with filtering options
- **Create Events**: Add new events with details like time, location, attendees, reminders
- **Update Events**: Modify existing events
- **Delete Events**: Remove events from calendars
- **Search Events**: Find events based on keywords, date ranges, or other criteria
- **Manage Attendees**: Add/remove attendees from events
- **Process Event Data**: Analyze patterns, suggest reorganization, find conflicts

### Google Tasks Operations:
- **List Tasks**: Get tasks from task lists with filtering
- **Create Tasks**: Add new tasks with due dates, notes, and parent tasks
- **Update Tasks**: Modify existing tasks, mark as complete/incomplete
- **Delete Tasks**: Remove tasks
- **Organize Tasks**: Move tasks between lists, reorganize hierarchies
- **Process Task Data**: Analyze completion rates, prioritize, suggest optimizations

## Authentication Setup

The user has OAuth credentials configured for n8n workflows. To use them with this skill:

1. You'll need the Google OAuth Client ID and Client Secret
2. Required scopes for full functionality:
   - `https://www.googleapis.com/auth/calendar` (for Calendar access)
   - `https://www.googleapis.com/auth/tasks` (for Tasks access)

3. The authentication flow uses OAuth2 with these credentials

## Required Dependencies

Ensure these packages are installed:
```bash
npm install googleapis google-auth-library
```

## Code Implementation Approach

When the user asks you to interact with Google Calendar or Tasks, follow this pattern:

### 1. Initialize the Google API Client

```javascript
const { google } = require('googleapis');
const { OAuth2 } = google.auth;

// Create OAuth2 client
const oauth2Client = new OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'YOUR_REDIRECT_URL'
);

// Set credentials (using refresh token or access token)
oauth2Client.setCredentials({
  access_token: 'USER_ACCESS_TOKEN',
  refresh_token: 'USER_REFRESH_TOKEN',
  scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks',
  token_type: 'Bearer',
  expiry_date: EXPIRY_TIMESTAMP
});

// Initialize Calendar and Tasks APIs
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
```

### 2. Calendar Examples

#### List Upcoming Events
```javascript
async function listUpcomingEvents() {
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return response.data.items;
}
```

#### Create an Event
```javascript
async function createEvent(eventDetails) {
  const event = {
    summary: eventDetails.title,
    location: eventDetails.location,
    description: eventDetails.description,
    start: {
      dateTime: eventDetails.startTime,
      timeZone: eventDetails.timezone || 'America/Los_Angeles',
    },
    end: {
      dateTime: eventDetails.endTime,
      timeZone: eventDetails.timezone || 'America/Los_Angeles',
    },
    attendees: eventDetails.attendees || [],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 10 },
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
  });

  return response.data;
}
```

#### Update an Event
```javascript
async function updateEvent(eventId, updates) {
  const response = await calendar.events.patch({
    calendarId: 'primary',
    eventId: eventId,
    resource: updates,
  });

  return response.data;
}
```

#### Search Events
```javascript
async function searchEvents(query, timeMin, timeMax) {
  const response = await calendar.events.list({
    calendarId: 'primary',
    q: query,
    timeMin: timeMin,
    timeMax: timeMax,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return response.data.items;
}
```

### 3. Tasks Examples

#### List Tasks
```javascript
async function listTasks(taskListId = '@default') {
  const response = await tasks.tasks.list({
    tasklist: taskListId,
    showCompleted: false,
    showHidden: false,
  });

  return response.data.items;
}
```

#### List All Task Lists
```javascript
async function listTaskLists() {
  const response = await tasks.tasklists.list();
  return response.data.items;
}
```

#### Create a Task
```javascript
async function createTask(taskDetails, taskListId = '@default') {
  const task = {
    title: taskDetails.title,
    notes: taskDetails.notes,
    due: taskDetails.dueDate,
    status: taskDetails.status || 'needsAction',
  };

  const response = await tasks.tasks.insert({
    tasklist: taskListId,
    resource: task,
  });

  return response.data;
}
```

#### Update a Task
```javascript
async function updateTask(taskId, updates, taskListId = '@default') {
  const response = await tasks.tasks.patch({
    tasklist: taskListId,
    task: taskId,
    resource: updates,
  });

  return response.data;
}
```

#### Mark Task as Complete
```javascript
async function completeTask(taskId, taskListId = '@default') {
  return await updateTask(taskId, { status: 'completed' }, taskListId);
}
```

#### Delete a Task
```javascript
async function deleteTask(taskId, taskListId = '@default') {
  await tasks.tasks.delete({
    tasklist: taskListId,
    task: taskId,
  });
}
```

### 4. Advanced Operations

#### Find Calendar Conflicts
```javascript
async function findConflicts(startDate, endDate) {
  const events = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startDate,
    timeMax: endDate,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const conflicts = [];
  const items = events.data.items;

  for (let i = 0; i < items.length - 1; i++) {
    const currentEnd = new Date(items[i].end.dateTime);
    const nextStart = new Date(items[i + 1].start.dateTime);

    if (currentEnd > nextStart) {
      conflicts.push({
        event1: items[i],
        event2: items[i + 1],
      });
    }
  }

  return conflicts;
}
```

#### Sync Tasks to Calendar
```javascript
async function syncTasksToCalendar(taskListId = '@default') {
  const tasksList = await tasks.tasks.list({
    tasklist: taskListId,
    showCompleted: false,
  });

  const createdEvents = [];

  for (const task of tasksList.data.items) {
    if (task.due) {
      const event = {
        summary: `Task: ${task.title}`,
        description: task.notes || '',
        start: { date: task.due.split('T')[0] },
        end: { date: task.due.split('T')[0] },
      };

      const created = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      createdEvents.push(created.data);
    }
  }

  return createdEvents;
}
```

#### Analyze Task Completion
```javascript
async function analyzeTaskCompletion(taskListId = '@default') {
  const allTasks = await tasks.tasks.list({
    tasklist: taskListId,
    showCompleted: true,
    showHidden: true,
  });

  const analysis = {
    total: allTasks.data.items.length,
    completed: 0,
    pending: 0,
    overdue: 0,
    completionRate: 0,
  };

  const now = new Date();

  allTasks.data.items.forEach(task => {
    if (task.status === 'completed') {
      analysis.completed++;
    } else {
      analysis.pending++;
      if (task.due && new Date(task.due) < now) {
        analysis.overdue++;
      }
    }
  });

  analysis.completionRate = (analysis.completed / analysis.total * 100).toFixed(2);

  return analysis;
}
```

## Error Handling

Always implement proper error handling:

```javascript
async function safeApiCall(apiFunction) {
  try {
    return await apiFunction();
  } catch (error) {
    if (error.code === 401) {
      console.error('Authentication error. Token may be expired.');
      // Implement token refresh logic
    } else if (error.code === 403) {
      console.error('Permission denied. Check API scopes.');
    } else if (error.code === 404) {
      console.error('Resource not found.');
    } else {
      console.error('API Error:', error.message);
    }
    throw error;
  }
}
```

## Token Management

Implement automatic token refresh:

```javascript
async function refreshAccessToken(oauth2Client) {
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);
    // Save new credentials securely
    return credentials;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}
```

## Best Practices

1. **Rate Limiting**: Implement exponential backoff for API calls
2. **Batch Operations**: Use batch requests for multiple operations
3. **Caching**: Cache frequently accessed data to reduce API calls
4. **Secure Storage**: Never hardcode credentials; use environment variables or secure vaults
5. **Scope Minimization**: Only request necessary OAuth scopes
6. **Error Recovery**: Implement retry logic with exponential backoff
7. **Timezone Handling**: Always specify timezones explicitly
8. **Pagination**: Handle paginated results for large datasets

## Working with the User

When the user asks you to interact with their Calendar or Tasks:

1. **Clarify the Request**: Ask for specific details (dates, titles, descriptions)
2. **Show the Code**: Always show the implementation code
3. **Explain the Process**: Describe what the code does
4. **Handle Credentials Safely**: Ask where credentials are stored, never expose them
5. **Provide Results**: Display the results in a clear, formatted way
6. **Suggest Improvements**: Offer optimization or reorganization suggestions

## Example Interaction Pattern

```
User: "Show me my events for next week"

Response:
1. I'll fetch your calendar events for the next 7 days
2. [Show code implementation]
3. [Execute and display results]
4. [Suggest any scheduling optimizations if conflicts found]
```

## Useful Resources

- Google Calendar API: https://developers.google.com/calendar/api/v3/reference
- Google Tasks API: https://developers.google.com/tasks/reference/rest
- OAuth 2.0 Setup: https://developers.google.com/identity/protocols/oauth2
- Node.js Client Library: https://github.com/googleapis/google-api-nodejs-client

Remember: Always prioritize user privacy and data security when working with calendar and task data.

---

## Ready-to-Run Scripts

These scripts live in `C:/Users/Admin/GoogleCalendarTasksAPI/` and are wired to the user's OAuth credentials at `.google-credentials.json` and `.google-token.json`. Run them with `node <script>` from that directory.

### Script: `todays-agenda.js`
Fetches today's calendar events and all pending tasks across all task lists. Shows overdue items flagged with a warning.

```javascript
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, '.google-credentials.json');
const TOKEN_PATH = path.join(__dirname, '.google-token.json');

async function getTodaysAgenda() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_id, client_secret, redirect_uris } = credentials.installed;

  const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  oauth2Client.setCredentials(token);

  try {
    const { credentials: newCreds } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(newCreds);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(newCreds, null, 2));
  } catch (e) {}

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const tasks = google.tasks({ version: 'v1', auth: oauth2Client });

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  console.log(`=== Today's Agenda: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} ===\n`);

  console.log('--- CALENDAR EVENTS ---');
  try {
    const eventsRes = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = eventsRes.data.items;
    if (!events || events.length === 0) {
      console.log('No events scheduled for today.');
    } else {
      events.forEach((event, i) => {
        const start = event.start.dateTime
          ? new Date(event.start.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : 'All day';
        const end = event.end.dateTime
          ? new Date(event.end.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : '';
        const timeStr = end ? `${start} - ${end}` : start;
        console.log(`  ${i + 1}. [${timeStr}] ${event.summary || '(No title)'}`);
        if (event.location) console.log(`     Location: ${event.location}`);
        if (event.description) console.log(`     Note: ${event.description.substring(0, 100)}`);
      });
    }
  } catch (err) {
    console.error('Calendar error:', err.message);
  }

  console.log('\n--- TASKS ---');
  try {
    const taskListsRes = await tasks.tasklists.list({ maxResults: 20 });
    const taskLists = taskListsRes.data.items || [];

    if (taskLists.length === 0) {
      console.log('No task lists found.');
    } else {
      for (const list of taskLists) {
        const taskRes = await tasks.tasks.list({
          tasklist: list.id,
          showCompleted: false,
          showHidden: false,
          maxResults: 100,
        });

        const items = taskRes.data.items || [];
        const todayStr = startOfDay.toISOString().split('T')[0];
        const relevantTasks = items.filter(t => {
          if (!t.due) return true;
          return t.due.startsWith(todayStr) || t.due < endOfDay.toISOString();
        });

        if (relevantTasks.length > 0) {
          console.log(`\n  [${list.title}]`);
          relevantTasks.forEach((task, i) => {
            const dueStr = task.due ? ` (due: ${task.due.split('T')[0]})` : '';
            const overdue = task.due && task.due < startOfDay.toISOString() ? ' ⚠ OVERDUE' : '';
            console.log(`    ${i + 1}. ${task.title}${dueStr}${overdue}`);
            if (task.notes) console.log(`       Note: ${task.notes.substring(0, 80)}`);
          });
        }
      }
    }
  } catch (err) {
    console.error('Tasks error:', err.message);
  }

  console.log('\n=== End of Agenda ===');
}

getTodaysAgenda().catch(console.error);
```

---

### Script: `get-task-ids.js`
Dumps all task list IDs and task IDs — required before marking tasks complete or updating them, since the Google Tasks API needs both the list ID and task ID.

```javascript
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, '.google-credentials.json');
const TOKEN_PATH = path.join(__dirname, '.google-token.json');

async function getTaskIds() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_id, client_secret, redirect_uris } = credentials.installed;
  const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  oauth2Client.setCredentials(token);

  try {
    const { credentials: newCreds } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(newCreds);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(newCreds, null, 2));
  } catch (e) {}

  const tasks = google.tasks({ version: 'v1', auth: oauth2Client });

  const taskListsRes = await tasks.tasklists.list({ maxResults: 20 });
  const taskLists = taskListsRes.data.items || [];

  for (const list of taskLists) {
    const taskRes = await tasks.tasks.list({
      tasklist: list.id,
      showCompleted: false,
      showHidden: false,
      maxResults: 100,
    });
    const items = taskRes.data.items || [];
    if (items.length > 0) {
      console.log(`\n[${list.title}] (listId: ${list.id})`);
      items.forEach(t => {
        console.log(`  ID: ${t.id} | TITLE: ${t.title}`);
      });
    }
  }
}

getTaskIds().catch(console.error);
```

---

### Pattern: Completing Tasks & Adding New Tasks
Use this pattern when the user wants to check off tasks and/or add new ones. Always run `get-task-ids.js` first to get fresh IDs, then build a script using this pattern:

```javascript
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, '.google-credentials.json');
const TOKEN_PATH = path.join(__dirname, '.google-token.json');

async function updateTasks() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_id, client_secret, redirect_uris } = credentials.installed;
  const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  oauth2Client.setCredentials(token);
  try {
    const { credentials: newCreds } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(newCreds);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(newCreds, null, 2));
  } catch (e) {}

  const tasks = google.tasks({ version: 'v1', auth: oauth2Client });

  // === MARK TASKS COMPLETE ===
  const toComplete = [
    { taskId: 'TASK_ID_HERE', listId: 'LIST_ID_HERE', title: 'Task title' },
  ];

  for (const item of toComplete) {
    try {
      await tasks.tasks.patch({
        tasklist: item.listId,
        task: item.taskId,
        requestBody: { status: 'completed' },
      });
      console.log(`✅ Completed: ${item.title}`);
    } catch (err) {
      console.error(`❌ Failed: ${item.title} - ${err.message}`);
    }
  }

  // === ADD NEW TASKS ===
  const toAdd = [
    { title: 'New task title', listId: 'LIST_ID_HERE', due: new Date().toISOString().split('T')[0] + 'T00:00:00.000Z' },
  ];

  for (const item of toAdd) {
    try {
      await tasks.tasks.insert({
        tasklist: item.listId,
        requestBody: { title: item.title, due: item.due },
      });
      console.log(`➕ Added: ${item.title}`);
    } catch (err) {
      console.error(`❌ Failed to add: ${item.title} - ${err.message}`);
    }
  }
}

updateTasks().catch(console.error);
```

## Known Task List IDs (as of Feb 2026)

| List Name | List ID |
|-----------|---------|
| My Tasks | `MTc4Mjc1MjY0MDc1MDQ5NjE5ODc6MDow` |
| Focus List- Only 3 items | `T1Z3N1pmNWc4dXRPZ0d2Qg` |
| Top Life Priorities | `MkJSdTB4V0RManNaN3BURg` |
| Top Learning Focuses | `RTNvS21NdlZ4ZVVIdEltdA` |
| Para dejar | `aUxVckkyUzFCNXN2OURmdw` |
| Friends | `Tm9EelRDcDRuWGtNRnV6OQ` |
| Need to work on | `QUd2MnhGUUg5djU4cE5lUQ` |
| IT Study Goals | `N040cjBzQmhuYTYzYmNpUA` |

## Workflow Summary

When the user asks to interact with Google Calendar/Tasks:

1. **View today** → run `node todays-agenda.js`
2. **Get task IDs** (needed before completing/editing) → run `node get-task-ids.js`
3. **Mark complete / add tasks** → write a quick script using the pattern above, run it with `node <script>.js`
4. **All scripts go in** `C:/Users/Admin/GoogleCalendarTasksAPI/`
5. **Credentials** are at `.google-credentials.json` and `.google-token.json` in that same directory — token auto-refreshes
