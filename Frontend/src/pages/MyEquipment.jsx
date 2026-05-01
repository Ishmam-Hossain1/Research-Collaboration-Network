import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Plus, X, CheckCircle, XCircle, Clock, History,
  Loader2, AlertCircle, FlaskConical, Edit2, Trash2, Eye, EyeOff
} from "lucide-react";

const API = "http://localhost:5000/api";
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const CATEGORIES = ["Microscopy","Spectroscopy","Chromatography","Thermal Analysis","Imaging & Scanning","Computing & Data","Molecular Biology","Chemistry","Physics","Other"];
const CONDITIONS = ["Excellent","Good","Fair"];

const STATUS_STYLE = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
};

function EquipmentForm({ initial, onSave, onCancel, loading }) {
  const blank = {
    name:"", description:"", category:"Microscopy", pricePerDay:2,
    condition:"Good", location:"",
    availabilitySchedule: DAYS.slice(0,5).map(d=>({dayOfWeek:d,startTime:"09:00",endTime:"17:00",isAvailable:true})),
  };
  const [form, setForm] = useState(initial || blank);

  function set(k, v) { setForm(f=>({...f,[k]:v})); }

  function toggleDay(day) {
    setForm(f=>{
      const exists = f.availabilitySchedule.find(s=>s.dayOfWeek===day);
      if (exists) {
        return {...f, availabilitySchedule: f.availabilitySchedule.map(s=>
          s.dayOfWeek===day ? {...s, isAvailable:!s.isAvailable} : s
        )};
      }
      return {...f, availabilitySchedule:[...f.availabilitySchedule,{dayOfWeek:day,startTime:"09:00",endTime:"17:00",isAvailable:true}]};
    });
  }

  function setSlot(day, field, val) {
    setForm(f=>({...f, availabilitySchedule: f.availabilitySchedule.map(s=>
      s.dayOfWeek===day ? {...s,[field]:val} : s
    )}));
  }

  function getSlot(day) {
    return form.availabilitySchedule.find(s=>s.dayOfWeek===day) || null;
  }

  return (
    <form onSubmit={e=>{e.preventDefault();onSave(form);}} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Equipment Name *</label>
          <input required value={form.name} onChange={e=>set("name",e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none" placeholder="e.g. Scanning Electron Microscope"/>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Category *</label>
          <select required value={form.category} onChange={e=>set("category",e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none">
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Condition</label>
          <select value={form.condition} onChange={e=>set("condition",e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none">
            {CONDITIONS.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Price/Day (1–5 tk) *</label>
          <input required type="number" min={1} max={5} value={form.pricePerDay} onChange={e=>set("pricePerDay",Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"/>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
          <input value={form.location} onChange={e=>set("location",e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none" placeholder="Lab name, building..."/>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Description *</label>
          <textarea required rows={3} value={form.description} onChange={e=>set("description",e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm resize-none focus:border-blue-400 focus:outline-none" placeholder="Describe specifications, capabilities..."/>
        </div>
      </div>

      {/* Availability schedule */}
      <div>
        <p className="text-xs font-semibold text-slate-600 mb-2">Availability Schedule</p>
        <div className="space-y-2">
          {DAYS.map(day=>{
            const slot = getSlot(day);
            const active = slot?.isAvailable ?? false;
            return (
              <div key={day} className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-2.5 transition ${active?"border-blue-200 bg-blue-50":"border-slate-100 bg-slate-50"}`}>
                <button type="button" onClick={()=>toggleDay(day)}
                  className={`w-24 rounded-lg py-1 text-xs font-semibold transition ${active?"bg-blue-600 text-white":"bg-slate-200 text-slate-600"}`}>
                  {day.slice(0,3)}
                </button>
                {active && slot && (
                  <>
                    <input type="time" value={slot.startTime} onChange={e=>setSlot(day,"startTime",e.target.value)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:outline-none"/>
                    <span className="text-xs text-slate-400">to</span>
                    <input type="time" value={slot.endTime} onChange={e=>setSlot(day,"endTime",e.target.value)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:outline-none"/>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition disabled:opacity-50">
          {loading && <Loader2 size={14} className="animate-spin"/>}
          {initial ? "Save Changes" : "List Equipment"}
        </button>
      </div>
    </form>
  );
}

export default function MyEquipment() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("equipment"); // equipment | bookings | history
  const [equipment, setEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedEq, setSelectedEq] = useState(null); // for usage history
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({text:"",type:"ok"});

  const user = JSON.parse(localStorage.getItem("researchConnectUser"));
  const token = localStorage.getItem("researchConnectToken");

  const showMsg = (text, type="ok") => { setMsg({text,type}); setTimeout(()=>setMsg({text:"",type:"ok"}),4000); };

  const fetchEquipment = useCallback(async()=>{
    setLoading(true);
    try {
      const r = await fetch(`${API}/equipment/mine`,{headers:{Authorization:`Bearer ${token}`}});
      const d = await r.json();
      if(r.ok) setEquipment(d);
    } catch{}
    setLoading(false);
  },[token]);

  const fetchBookings = useCallback(async()=>{
    try {
      const r = await fetch(`${API}/equipment/bookings/received`,{headers:{Authorization:`Bearer ${token}`}});
      const d = await r.json();
      if(r.ok) setBookings(d);
    } catch{}
  },[token]);

  useEffect(()=>{ fetchEquipment(); fetchBookings(); },[fetchEquipment,fetchBookings]);

  async function fetchHistory(eq) {
    setSelectedEq(eq);
    setTab("history");
    try {
      const r = await fetch(`${API}/equipment/${eq._id}/usage-history`,{headers:{Authorization:`Bearer ${token}`}});
      const d = await r.json();
      if(r.ok) setHistory(d);
    } catch{}
  }

  async function handleSave(form) {
    setFormLoading(true);
    try {
      const url = editTarget ? `${API}/equipment/${editTarget._id}` : `${API}/equipment`;
      const method = editTarget ? "PUT" : "POST";
      const r = await fetch(url,{method,headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify(form)});
      const d = await r.json();
      if(!r.ok) throw new Error(d.message);
      showMsg(editTarget?"Equipment updated!":"Equipment listed successfully!");
      setShowForm(false); setEditTarget(null);
      fetchEquipment();
    } catch(e){ showMsg(e.message,"err"); }
    setFormLoading(false);
  }

  async function handleDelete(id) {
    if(!window.confirm("Delete this equipment listing?")) return;
    try {
      const r = await fetch(`${API}/equipment/${id}`,{method:"DELETE",headers:{Authorization:`Bearer ${token}`}});
      const d = await r.json();
      if(!r.ok) throw new Error(d.message);
      showMsg("Equipment deleted."); fetchEquipment();
    } catch(e){ showMsg(e.message,"err"); }
  }

  async function handleToggleActive(eq) {
    try {
      const r = await fetch(`${API}/equipment/${eq._id}`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({isActive:!eq.isActive})});
      const d = await r.json();
      if(!r.ok) throw new Error(d.message);
      fetchEquipment();
    } catch(e){ showMsg(e.message,"err"); }
  }

  async function handleBookingAction(bookingId, status, note="") {
    try {
      const r = await fetch(`${API}/equipment/bookings/${bookingId}/status`,{
        method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({status,ownerNote:note}),
      });
      const d = await r.json();
      if(!r.ok) throw new Error(d.message);
      showMsg(`Booking ${status}!`); fetchBookings();
    } catch(e){ showMsg(e.message,"err"); }
  }


  const pendingCount = bookings.filter(b=>b.status==="pending").length;

  return (
    <div className="min-h-screen bg-[#f8fbff]">
      <Navbar/>
      <div className="pt-[78px]">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 px-4 py-12 sm:px-8 md:px-12">
          <div className="mx-auto max-w-5xl flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Owner Dashboard</p>
              <h1 className="mt-1 font-serif text-3xl font-bold text-white sm:text-4xl">My Equipment</h1>
              <p className="mt-1.5 text-slate-300 text-sm">Manage listings, approve requests, track usage.</p>
            </div>
            <div className="flex flex-wrap gap-3">

              <button onClick={()=>{setShowForm(true);setEditTarget(null);}}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-900/30">
                <Plus size={15}/> List Equipment
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 md:px-12">
          {/* Message */}
          {msg.text && (
            <div className={`mb-5 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${msg.type==="err"?"bg-red-50 border-red-200 text-red-700":"bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
              {msg.type==="err"?<AlertCircle size={15}/>:<CheckCircle size={15}/>} {msg.text}
            </div>
          )}

          {/* Form panel */}
          {showForm && (
            <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 font-semibold text-slate-900">{editTarget?"Edit Equipment":"List New Equipment"}</h2>
              <EquipmentForm initial={editTarget} onSave={handleSave} onCancel={()=>{setShowForm(false);setEditTarget(null);}} loading={formLoading}/>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-xl bg-slate-100 p-1 w-fit">
            {[
              {key:"equipment", label:"My Listings"},
              {key:"bookings", label:`Booking Requests${pendingCount>0?" ("+pendingCount+")":""}`},
              {key:"history", label:"Usage History"},
            ].map(t=>(
              <button key={t.key} onClick={()=>setTab(t.key)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab===t.key?"bg-white text-slate-900 shadow-sm":"text-slate-500 hover:text-slate-700"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Equipment Listings */}
          {tab==="equipment" && (
            loading ? (
              <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-blue-500"/></div>
            ) : equipment.length===0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
                <FlaskConical size={36} className="mx-auto mb-3 text-slate-300"/>
                <p className="text-slate-500 font-medium">No equipment listed yet</p>
                <p className="mt-1 text-sm text-slate-400">Click "List Equipment" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {equipment.map(eq=>(
                  <div key={eq._id} className={`rounded-2xl border bg-white p-5 flex flex-col sm:flex-row sm:items-start gap-4 shadow-sm ${!eq.isActive?"opacity-60":""}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{eq.name}</h3>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{eq.category}</span>
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">{eq.pricePerDay} tk/day</span>
                        {!eq.isActive && <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-500">Hidden</span>}
                      </div>
                      <p className="mt-1.5 text-sm text-slate-600 line-clamp-2">{eq.description}</p>
                      <p className="mt-1 text-xs text-slate-400">{eq.condition} condition &bull; {eq.location || "No location"} &bull; {eq.totalBookings} booking{eq.totalBookings!==1?"s":""}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <button onClick={()=>fetchHistory(eq)}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
                        <History size={13}/> History
                      </button>
                      <button onClick={()=>handleToggleActive(eq)}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
                        {eq.isActive?<EyeOff size={13}/>:<Eye size={13}/>} {eq.isActive?"Hide":"Show"}
                      </button>
                      <button onClick={()=>{setEditTarget(eq);setShowForm(true);window.scrollTo(0,0);}}
                        className="flex items-center gap-1.5 rounded-xl border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition">
                        <Edit2 size={13}/> Edit
                      </button>
                      <button onClick={()=>handleDelete(eq._id)}
                        className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition">
                        <Trash2 size={13}/> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Booking Requests */}
          {tab==="bookings" && (
            bookings.length===0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
                <Clock size={36} className="mx-auto mb-3 text-slate-300"/>
                <p className="text-slate-500 font-medium">No booking requests yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(b=>(
                  <div key={b._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">{b.equipment?.name}</p>
                          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[b.status]}`}>
                            {b.status.charAt(0).toUpperCase()+b.status.slice(1)}
                          </span>
                        </div>
                        <div className="mt-2 space-y-0.5 text-sm text-slate-600">
                          <p><span className="font-medium">Requester:</span> {b.requester?.username} ({b.requester?.email})</p>
                          <p><span className="font-medium">Date:</span> {b.startDate} to {b.endDate} ({b.totalDays} day{b.totalDays!==1?"s":""})</p>
                          <p><span className="font-medium">Payment:</span> <span className="text-blue-700 font-semibold">{b.totalCost} tk paid</span></p>
                          {b.purpose && <p><span className="font-medium">Purpose:</span> {b.purpose}</p>}
                          {b.ownerNote && <p className="italic text-slate-500"><span className="font-medium not-italic">Your note:</span> {b.ownerNote}</p>}
                        </div>
                      </div>
                      {b.status==="pending" && (
                        <div className="flex gap-2 shrink-0">
                          <button onClick={()=>handleBookingAction(b._id,"approved")}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition">
                            <CheckCircle size={14}/> Approve
                          </button>
                          <button onClick={()=>{const note=window.prompt("Optional note for rejection:");handleBookingAction(b._id,"rejected",note||"");}}
                            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition">
                            <XCircle size={14}/> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Usage History */}
          {tab==="history" && (
            <>
              {selectedEq && (
                <p className="mb-4 text-sm font-medium text-slate-600">
                  Showing history for: <span className="font-semibold text-slate-900">{selectedEq.name}</span>
                  <button onClick={()=>{setSelectedEq(null);setHistory([]);}} className="ml-2 text-blue-500 hover:underline text-xs">(clear)</button>
                </p>
              )}
              {!selectedEq ? (
                <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
                  <History size={36} className="mx-auto mb-3 text-slate-300"/>
                  <p className="text-slate-500 font-medium">Select equipment to view usage history</p>
                  <p className="mt-1 text-sm text-slate-400">Go to "My Listings" and click the History button.</p>
                </div>
              ) : history.length===0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
                  <p className="text-slate-400 text-sm">No completed bookings yet for this equipment.</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          {["Requester","Start Date","End Date","Days","Amount","Status"].map(h=>(
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {history.map(b=>(
                          <tr key={b._id} className="hover:bg-slate-50 transition">
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-900">{b.requester?.username}</p>
                              <p className="text-xs text-slate-400">{b.requester?.email}</p>
                            </td>
                            <td className="px-4 py-3 text-slate-700">{b.startDate}</td>
                            <td className="px-4 py-3 text-slate-700">{b.endDate}</td>
                            <td className="px-4 py-3 text-slate-700">{b.totalDays}d</td>
                            <td className="px-4 py-3 font-semibold text-blue-700">{b.totalCost} tk</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[b.status]}`}>
                                {b.status.charAt(0).toUpperCase()+b.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
