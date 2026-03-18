import { useState } from "react";

import { createRSVPEvent, submitRSVP } from "../api";

function RSVPPage() {
  const [eventCode, setEventCode] = useState("");
  const [status, setStatus] = useState("");
  const [eventForm, setEventForm] = useState({ event_name: "Athea Wedding Weekend", host_name: "Events by Athea", wedding_date: "2025-03-14" });
  const [guestForm, setGuestForm] = useState({ event_code: "", guest_name: "", email: "", phone: "", attending: true, guest_count: 2, dietary_preferences: "", notes: "" });

  const createEvent = async () => {
    const response = await createRSVPEvent(eventForm);
    setEventCode(response.data.event_code);
    setGuestForm((current) => ({ ...current, event_code: response.data.event_code }));
    setStatus(`Event created: ${response.data.event_code}`);
  };

  const respond = async () => {
    const response = await submitRSVP(guestForm);
    setStatus(`RSVP recorded with ID ${response.data.response_id}`);
  };

  return (
    <main className="section-shell grid gap-8 md:grid-cols-2">
      <section className="panel p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-gold">P2 Bonus</p>
        <h1 className="mt-2 font-display text-4xl text-maroon">Create an RSVP event</h1>
        <div className="mt-6 space-y-4">
          <input className="field" value={eventForm.event_name} onChange={(event) => setEventForm((current) => ({ ...current, event_name: event.target.value }))} />
          <input className="field" value={eventForm.host_name} onChange={(event) => setEventForm((current) => ({ ...current, host_name: event.target.value }))} />
          <input className="field" value={eventForm.wedding_date} onChange={(event) => setEventForm((current) => ({ ...current, wedding_date: event.target.value }))} />
          <button className="btn-primary" onClick={createEvent}>
            Create Event
          </button>
          {eventCode ? <p className="rounded-2xl bg-maroon px-4 py-3 text-sm font-semibold text-white">Live code: {eventCode}</p> : null}
        </div>
      </section>

      <section className="panel p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-gold">Guest Response</p>
        <h2 className="mt-2 font-display text-4xl text-maroon">Submit RSVP</h2>
        <div className="mt-6 space-y-4">
          <input className="field" placeholder="Event code" value={guestForm.event_code} onChange={(event) => setGuestForm((current) => ({ ...current, event_code: event.target.value }))} />
          <input className="field" placeholder="Guest name" value={guestForm.guest_name} onChange={(event) => setGuestForm((current) => ({ ...current, guest_name: event.target.value }))} />
          <input className="field" placeholder="Email" value={guestForm.email} onChange={(event) => setGuestForm((current) => ({ ...current, email: event.target.value }))} />
          <input className="field" placeholder="Phone" value={guestForm.phone} onChange={(event) => setGuestForm((current) => ({ ...current, phone: event.target.value }))} />
          <input className="field" type="number" placeholder="Guest count" value={guestForm.guest_count} onChange={(event) => setGuestForm((current) => ({ ...current, guest_count: Number(event.target.value) }))} />
          <input className="field" placeholder="Dietary preferences" value={guestForm.dietary_preferences} onChange={(event) => setGuestForm((current) => ({ ...current, dietary_preferences: event.target.value }))} />
          <textarea className="field min-h-28" placeholder="Notes" value={guestForm.notes} onChange={(event) => setGuestForm((current) => ({ ...current, notes: event.target.value }))} />
          <button className="btn-primary" onClick={respond}>
            Submit RSVP
          </button>
        </div>
        {status ? <p className="mt-4 text-sm font-semibold text-maroon">{status}</p> : null}
      </section>
    </main>
  );
}

export default RSVPPage;
