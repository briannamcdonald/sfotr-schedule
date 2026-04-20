import { useState } from "react";

const DAYS = ["Friday", "Saturday", "Sunday"];
const PIXELS_PER_MINUTE = 2.1;

// Edit this array to update your convention schedule.
// Each item needs: day, title, location, start, end, and importance.
const SCHEDULE = [
  {
    day: "Friday",
    title: "Friendship Bracelet Making",
    location: "Batcave",
    start: "1:00 PM",
    end: "1:50 PM",
    importance: "must-do",
  },
  {
    day: "Friday",
    title: "Autism Awareness in the Sci-fi Community and Autistic Characters",
    location: "Tardis",
    start: "2:00 PM",
    end: "2:50 PM",
    importance: "optional",
  },
  {
    day: "Friday",
    title: "A Story's Sacred Contract: Readers, Writers, and Expectations",
    location: "Tardis",
    start: "4:00 PM",
    end: "4:50 PM",
    importance: "optional",
  },
  {
    day: "Saturday",
    title: "Saturday Morning Cartoons",
    location: "X-mansion",
    start: "10:00 AM",
    end: "10:50 AM",
    importance: "must-do",
  },
  {
    day: "Saturday",
    title: "Trinket Trade Hour",
    location: "Batcave",
    start: "10:00 AM",
    end: "10:50 AM",
    importance: "optional",
  },
  {
    day: "Saturday",
    title: "Paper Costume Fashion Show",
    location: "Batcave",
    start: "11:00 AM",
    end: "11:50 AM",
    importance: "optional",
  },
  {
    day: "Saturday",
    title: "Fan-tastical Trivia",
    location: "Batcave",
    start: "12:00 PM",
    end: "12:50 PM",
    importance: "optional",
  },
  {
    day: "Saturday",
    title: "Younglings Costume Contest",
    location: "Tardis",
    start: "1:00 PM",
    end: "1:50 PM",
    importance: "optional",
  },
  {
    day: "Saturday",
    title: "Horror Trivia",
    location: "Tardis",
    start: "2:00 PM",
    end: "2:50 PM",
    importance: "optional",
  },
  {
    day: "Saturday",
    title: "Masters of NL Cosplay - The Art of Cosplay: Unlocking Your Potential",
    location: "X-mansion",
    start: "4:00 PM",
    end: "4:50 PM",
    importance: "must-do",
  },
  {
    day: "Saturday",
    title: "Anime Jeopardy",
    location: "Batcave",
    start: "7:00 PM",
    end: "9:00 PM",
    importance: "must-do",
  },
  {
    day: "Saturday",
    title: "Hellfire Gala",
    location: "Tardis",
    start: "9:00 PM",
    end: "1:00 AM",
    importance: "must-do",
  },
  {
    day: "Sunday",
    title: "Jigsaw Puzzle Competition",
    location: "Batcave",
    start: "12:00 PM",
    end: "12:50 PM",
    importance: "optional",
  },
  {
    day: "Sunday",
    title: "CBS Band Presents: From Pixels to Pictures: Live",
    location: "Aviary",
    start: "1:00 PM",
    end: "3:00 PM",
    importance: "optional",
  },
  {
    day: "Sunday",
    title: "Horror Movie Trivia",
    location: "Batcave",
    start: "3:00 PM",
    end: "3:50 PM",
    importance: "optional",
  },
  {
    day: "Sunday",
    title: "Resident Evil Bingo",
    location: "Batcave",
    start: "4:00 PM",
    end: "4:50 PM",
    importance: "optional",
  },
  {
    day: "Sunday",
    title: "Costume Contest",
    location: "Aviary",
    start: "5:00 PM",
    end: "5:50 PM",
    importance: "must-do",
  },
  {
    day: "Sunday",
    title: "Closing Ceremony",
    location: "Aviary",
    start: "6:00 PM",
    end: "6:50 PM",
    importance: "must-do",
  },
];

function parseTime(value) {
  const [time, modifier] = value.trim().split(" ");
  const [hourValue, minuteValue] = time.split(":").map(Number);
  const isPm = modifier.toUpperCase() === "PM";
  const hours = hourValue % 12 + (isPm ? 12 : 0);
  return hours * 60 + minuteValue;
}

function formatMinutes(totalMinutes) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const suffix = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function roundDownToHalfHour(minutes) {
  return Math.floor(minutes / 30) * 30;
}

function roundUpToHalfHour(minutes) {
  return Math.ceil(minutes / 30) * 30;
}

function normalizeEventRange(start, end) {
  const startMinutes = parseTime(start);
  let endMinutes = parseTime(end);

  // Overnight events should continue into the next day visually.
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  return { startMinutes, endMinutes };
}

function enrichEvents(day) {
  return SCHEDULE.filter((event) => event.day === day)
    .map((event, index) => ({
      ...event,
      id: `${day}-${index}`,
      ...normalizeEventRange(event.start, event.end),
    }))
    .sort((a, b) => {
      if (a.startMinutes !== b.startMinutes) {
        return a.startMinutes - b.startMinutes;
      }

      return a.endMinutes - b.endMinutes;
    });
}

function buildColumns(events) {
  const groups = [];
  let currentGroup = [];
  let currentGroupEnd = -1;

  for (const event of events) {
    if (!currentGroup.length || event.startMinutes < currentGroupEnd) {
      currentGroup.push(event);
      currentGroupEnd = Math.max(currentGroupEnd, event.endMinutes);
      continue;
    }

    groups.push(currentGroup);
    currentGroup = [event];
    currentGroupEnd = event.endMinutes;
  }

  if (currentGroup.length) {
    groups.push(currentGroup);
  }

  return groups.flatMap((group) => {
    const active = [];
    const placed = [];
    let maxColumns = 1;

    for (const event of group) {
      for (let index = active.length - 1; index >= 0; index -= 1) {
        if (active[index].endMinutes <= event.startMinutes) {
          active.splice(index, 1);
        }
      }

      let column = 0;
      const usedColumns = new Set(active.map((item) => item.column));

      while (usedColumns.has(column)) {
        column += 1;
      }

      const positionedEvent = { ...event, column };
      active.push(positionedEvent);
      placed.push(positionedEvent);
      maxColumns = Math.max(maxColumns, active.length);
    }

    return placed.map((event) => ({
      ...event,
      totalColumns: maxColumns,
    }));
  });
}

function getDayTimeline(day) {
  const events = buildColumns(enrichEvents(day));

  if (!events.length) {
    return null;
  }

  const earliest = roundDownToHalfHour(events[0].startMinutes);
  const latest = roundUpToHalfHour(
    events.reduce((latestEnd, event) => Math.max(latestEnd, event.endMinutes), 0),
  );

  return {
    day,
    events,
    earliest,
    latest,
    height: (latest - earliest) * PIXELS_PER_MINUTE,
  };
}

function App() {
  const [activeDay, setActiveDay] = useState(DAYS[0]);
  const timeline = getDayTimeline(activeDay);

  if (!timeline) {
    return <main className="app-shell">No schedule entries found.</main>;
  }

  const timeSlots = [];
  for (let minute = timeline.earliest; minute <= timeline.latest; minute += 30) {
    timeSlots.push(minute);
  }

  return (
    <main className="app-shell">
      <div className="background-orb background-orb-left" />
      <div className="background-orb background-orb-right" />

      <section className="planner-card">
        <header className="planner-header">
          <h1>SFOTR Schedule 2026</h1>
        </header>

        <div className="day-tabs" role="tablist" aria-label="Convention days">
          {DAYS.map((day) => (
            <button
              key={day}
              type="button"
              role="tab"
              aria-selected={activeDay === day}
              className={`day-tab ${activeDay === day ? "is-active" : ""}`}
              onClick={() => setActiveDay(day)}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="planner-meta">
          <div className="timeline-summary">
            <span className="summary-label">{activeDay}</span>
            <strong>
              {formatMinutes(timeline.earliest)} - {formatMinutes(timeline.latest)}
            </strong>
          </div>

          <div className="legend" aria-label="Event importance legend">
            <span className="legend-chip legend-must">Must-do</span>
            <span className="legend-chip legend-optional">Optional</span>
          </div>
        </div>

        <section className="timeline-panel">
          <div className="timeline-scroll">
            <div className="timeline-shell">
              <div className="timeline-times" style={{ height: timeline.height }}>
                {timeSlots.map((slot, index) => (
                  <div
                    key={slot}
                    className={`time-label ${index === timeSlots.length - 1 ? "is-last" : ""}`}
                    style={{
                      top: (slot - timeline.earliest) * PIXELS_PER_MINUTE,
                    }}
                  >
                    {formatMinutes(slot)}
                  </div>
                ))}
              </div>

              <div className="timeline-track" style={{ height: timeline.height }}>
                {timeSlots.map((slot) => (
                  <div
                    key={slot}
                    className="track-line"
                    style={{
                      top: (slot - timeline.earliest) * PIXELS_PER_MINUTE,
                    }}
                  />
                ))}

                {timeline.events.map((event) => {
                  const top = (event.startMinutes - timeline.earliest) * PIXELS_PER_MINUTE;
                  const height =
                    (event.endMinutes - event.startMinutes) * PIXELS_PER_MINUTE;
                  const isOverlap = event.totalColumns > 1;
                  const isCompact = event.endMinutes - event.startMinutes <= 60;
                  const gutter = isOverlap ? 2 : 8;
                  const width = `calc(${100 / event.totalColumns}% - ${gutter}px)`;
                  const left = `calc(${(100 / event.totalColumns) * event.column}% + ${
                    gutter / 2
                  }px)`;

                  return (
                    <article
                      key={event.id}
                      className={`event-card ${event.importance} ${
                        isCompact ? "is-compact" : ""
                      } ${isOverlap ? "is-overlap" : ""}`}
                      style={{ top, height, width, left }}
                    >
                      <div className="event-card-inner">
                        <h2>{event.title}</h2>
                        <div className="event-meta">
                          <p className="event-time">
                            {event.start} - {event.end}
                          </p>
                          <p className="event-location">{event.location}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
