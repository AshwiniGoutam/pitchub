const event = {
  summary: meetingDetails.summary || "Discussion",
  description: meetingDetails.description || "Scheduled automatically",
  start: { dateTime: meetingDetails.startTime },
  end: { dateTime: meetingDetails.endTime },
  attendees: meetingDetails.attendees?.map((email) => ({ email })) || [],
  conferenceData: {
    createRequest: {
      requestId: `${Date.now()}`, // unique ID
      conferenceSolutionKey: { type: "hangoutsMeet" },
    },
  },
};

const response = await fetch(
  "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`, // from NextAuth session
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  }
);

const data = await response.json();
console.log("Created event:", data);
