// Copyright 2021 Masaya Suzuki
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const isTarget = (event: any) => {
    console.log("Event", event.summary, event.status, event.eventType, event.hangoutLink, new Date(event.start.dateTime));
    return event.hangoutLink
        && event.status === 'confirmed'
        && event.eventType === 'default';
};

const shouldFire = (event: any) => {
    if (!isTarget(event)) {
        return false;
    }
    console.log("Event time is", new Date(event.start.dateTime), "current time is", new Date());
    const highThreshold = new Date().getTime() + 60 * 1000;
    const lowThreshold = new Date().getTime() - 60 * 1000;
    const time = new Date(event.start.dateTime).getTime();
    return lowThreshold <= time && time < highThreshold;
};

const scheduleTimers = async () => {
    chrome.identity.getAuthToken({interactive: true}, async (token) => {
        const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
        url.searchParams.set('maxResults', '10');
        url.searchParams.set('orderBy', 'startTime');
        url.searchParams.set('singleEvents', 'true');
        url.searchParams.set('timeMin', new Date().toISOString());

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
            },
        });
        const body = await response.json();
        for (const event of body.items) {
            if (isTarget(event)) {
                chrome.alarms.get(event.id, alarm => {
                    if (!alarm) {
                        console.log("Schedule an alarm for", event.summary, " at ", new Date(event.start.dateTime));
                        chrome.alarms.create(event.id, {
                            when: new Date(event.start.dateTime).getTime() - 30 * 1000,
                        });
                    }
                });
            }
        }
    });
};

const fireEvent = async (eventId: string) => {
    console.log("Calendar event fired for", eventId);
    chrome.identity.getAuthToken({interactive: true}, async (token) => {
        const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events/' + eventId);
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
            },
        });
        const event = await response.json();
        if (!shouldFire(event)) {
            return;
        }
        console.log("About to open the meeting link", event.hangoutLink);
        const tabs = await chrome.tabs.query({url: event.hangoutLink});
        if (tabs.length === 0) {
            chrome.tabs.create({url: event.hangoutLink});
        } else {
            console.log("The page is already opened. Skipping...");
        }
    });
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.get('periodic', alerm => {
        if (!alerm) {
            chrome.alarms.create('periodic', {periodInMinutes: 5.0});
        }
    });
    // Initial setup.
    scheduleTimers();
});

chrome.alarms.onAlarm.addListener(async (alarm: chrome.alarms.Alarm) => {
    if (alarm.name === 'periodic') {
        await scheduleTimers();
    } else {
        await fireEvent(alarm.name);
    }
});
