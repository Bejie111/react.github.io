import './App.css';
import React, { useState, useEffect } from 'react';

const API = 'http://localhost:5000';

// ─── STUDENTS PAGE ─────────────────────────────────────────────────────────────
function StudentsPage() {
	const [students, setStudents] = useState([]);
	const [courses, setCourses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [idno, setIdno] = useState('');
	const [lastname, setLastname] = useState('');
	const [firstname, setFirstname] = useState('');
	const [course_id, setCourse_id] = useState('');
	const [level, setLevel] = useState('');
	const [isEditing, setIsEditing] = useState(false);
	const [editIdno, setEditIdno] = useState(null);

	const fetchData = async () => {
		try {
			const response = await fetch(`${API}/students`);
			const json = await response.json();
			setStudents(Array.isArray(json) ? json : []);
		} catch (error) { console.error("Fetch error:", error); } finally { setLoading(false); }
	};
	const fetchCourses = async () => {
		try {
			const response = await fetch(`${API}/course`);
			const _co = await response.json(); setCourses(Array.isArray(_co) ? _co : []);
		} catch (error) { console.error("Fetch courses error:", error); }
	};
	useEffect(() => { fetchData(); fetchCourses(); }, []);

	const filteredStudents = students.filter((s) => {
		const q = search.toLowerCase();
		return (
			s.idno?.toString().toLowerCase().includes(q) ||
			s.lastname?.toLowerCase().includes(q) ||
			s.firstname?.toLowerCase().includes(q) ||
			s.course_id?.toString().toLowerCase().includes(q) ||
			s.level?.toString().toLowerCase().includes(q)
		);
	});

	const clearForm = () => {
		setIdno(''); setLastname(''); setFirstname('');
		setCourse_id(''); setLevel('');
		setIsEditing(false); setEditIdno(null);
	};
	const handleEdit = (s) => {
		setIdno(s.idno); setLastname(s.lastname); setFirstname(s.firstname);
		setCourse_id(s.course_id); setLevel(s.level);
		setIsEditing(true); setEditIdno(s.idno);
		document.getElementById('studentmodal').style.display = 'block';
	};
	const handleDelete = async (idno) => {
		if (!window.confirm(`Are you sure you want to delete student ${idno}?`)) return;
		try {
			const res = await fetch(`${API}/students/${idno}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('Delete failed');
			fetchData();
		} catch (e) { console.error(e); }
	};
	const handleSubmit = async (event) => {
		event.preventDefault();
		try {
			if (isEditing) {
				const res = await fetch(`${API}/students/${editIdno}`, {
					method: 'PUT', headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ lastname, firstname, course_id, level }),
				});
				if (!res.ok) throw new Error('Update failed');
			} else {
				const res = await fetch(`${API}/students`, {
					method: 'POST', headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ idno, lastname, firstname, course_id, level }),
				});
				if (!res.ok) throw new Error('Insert failed');
			}
			fetchData(); clearForm();
			document.getElementById('studentmodal').style.display = 'none';
		} catch (e) { console.error(e); }
	};

	return (
		<div className="w3-container w3-padding">
			<div className='w3-row w3-padding'>
				<div className='w3-col' style={{ width: '60%' }}>
					<input type='text' className='w3-input w3-border' placeholder='Search by idno, name, course, level...'
						value={search} onChange={(e) => setSearch(e.target.value)} />
				</div>
				<div className='w3-col' style={{ width: '40%', textAlign: 'right' }}>
					<button className='w3-button w3-green' onClick={() => setSearch(search)}>&#128269; SEARCH</button>
					&nbsp;
					<button className='w3-button w3-blue' onClick={() => { clearForm(); document.getElementById('studentmodal').style.display = 'block'; }}>+ADD</button>
				</div>
			</div>
			<table className="w3-table-all">
				<thead>
					<tr className="w3-indigo">
						<th>IDNO</th><th>LASTNAME</th><th>FIRSTNAME</th><th>COURSE</th><th>LEVEL</th><th>CONTROL</th>
					</tr>
				</thead>
				<tbody>
					{filteredStudents.length > 0 ? (
						filteredStudents.map((s) => (
							<tr key={s.idno}>
								<td>{s.idno}</td><td>{s.lastname}</td><td>{s.firstname}</td>
								<td>{s.course_id}</td><td>{s.level}</td>
								<td>
									<button className='w3-button w3-blue w3-small' onClick={() => handleEdit(s)}>&#9998;</button>
									<button className='w3-button w3-red w3-small' onClick={() => handleDelete(s.idno)}>&times;</button>
								</td>
							</tr>
						))
					) : (
						<tr><td colSpan='6' className='w3-center'>No students found.</td></tr>
					)}
				</tbody>
			</table>

			<div className='w3-modal' id='studentmodal'>
				<div className='w3-modal-content w3-animate-top' style={{ width: '50%' }}>
					<div className='w3-container w3-padding w3-blue'>
						{isEditing ? 'EDIT STUDENT' : 'ADD STUDENT'}
						<span className='w3-button w3-display-topright' onClick={() => { clearForm(); document.getElementById('studentmodal').style.display = 'none'; }}>&times;</span>
					</div>
					<div className='w3-container w3-padding'>
						<form onSubmit={handleSubmit}>
							<p><label>IDNO</label><input type='text' className='w3-input w3-border' value={idno} disabled={isEditing} onChange={(e) => setIdno(e.target.value)} /></p>
							<p><label>LASTNAME</label><input type='text' className='w3-input w3-border' value={lastname} onChange={(e) => setLastname(e.target.value)} /></p>
							<p><label>FIRSTNAME</label><input type='text' className='w3-input w3-border' value={firstname} onChange={(e) => setFirstname(e.target.value)} /></p>
							<p><label>COURSE</label>
								<select className='w3-select w3-border' value={course_id} onChange={(e) => setCourse_id(e.target.value)}>
									<option value=''>Select Option</option>
									{courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_code} - {c.course_desc}</option>)}
								</select>
							</p>
							<p><label>LEVEL</label>
								<select className='w3-select w3-border' value={level} onChange={(e) => setLevel(e.target.value)}>
									<option value=''>Select Option</option>
									<option value={1}>1</option><option value={2}>2</option>
									<option value={3}>3</option><option value={4}>4</option>
								</select>
							</p>
							<p className='w3-right'><input type='submit' value='SAVE' className='w3-button w3-blue' /></p>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}

// ─── COURSES PAGE ──────────────────────────────────────────────────────────────
function CoursePage() {
	const [courses, setCourses] = useState([]);
	const [search, setSearch] = useState('');
	const [course_id, setCourse_id] = useState('');
	const [course_code, setCourse_code] = useState('');
	const [course_desc, setCourse_desc] = useState('');
	const [isEditing, setIsEditing] = useState(false);
	const [editId, setEditId] = useState(null);

	const fetchData = async () => {
		try { const res = await fetch(`${API}/course`); const _co2 = await res.json(); setCourses(Array.isArray(_co2) ? _co2 : []); } catch (e) { console.error(e); }
	};
	useEffect(() => { fetchData(); }, []);

	const filtered = courses.filter((r) => {
		const q = search.toLowerCase();
		return r.course_id?.toString().toLowerCase().includes(q) || r.course_code?.toLowerCase().includes(q) || r.course_desc?.toLowerCase().includes(q);
	});
	const clearForm = () => { setCourse_id(''); setCourse_code(''); setCourse_desc(''); setIsEditing(false); setEditId(null); };
	const handleEdit = (r) => { setCourse_id(r.course_id); setCourse_code(r.course_code); setCourse_desc(r.course_desc); setIsEditing(true); setEditId(r.course_id); document.getElementById('coursemodal').style.display = 'block'; };
	const handleDelete = async (id) => {
		if (!window.confirm(`Delete course ${id}?`)) return;
		try { const res = await fetch(`${API}/course/${id}`, { method: 'DELETE' }); if (!res.ok) throw new Error(); fetchData(); } catch (e) { console.error(e); }
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (isEditing) {
				await fetch(`${API}/course/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ course_code, course_desc }) });
			} else {
				await fetch(`${API}/course`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ course_id, course_code, course_desc }) });
			}
			fetchData(); clearForm(); document.getElementById('coursemodal').style.display = 'none';
		} catch (e) { console.error(e); }
	};

	return (
		<div className="w3-container w3-padding">
			<div className='w3-row w3-padding'>
				<div className='w3-col' style={{ width: '60%' }}>
					<input type='text' className='w3-input w3-border' placeholder='Search...' value={search} onChange={(e) => setSearch(e.target.value)} />
				</div>
				<div className='w3-col' style={{ width: '40%', textAlign: 'right' }}>
					<button className='w3-button w3-green' onClick={() => setSearch(search)}>&#128269; SEARCH</button>
					&nbsp;
					<button className='w3-button w3-blue' onClick={() => { clearForm(); document.getElementById('coursemodal').style.display = 'block'; }}>+ADD</button>
				</div>
			</div>
			<table className="w3-table-all">
				<thead><tr className="w3-indigo"><th>COURSE ID</th><th>COURSE CODE</th><th>DESCRIPTION</th><th>CONTROL</th></tr></thead>
				<tbody>
					{filtered.length > 0 ? filtered.map((r) => (
						<tr key={r.course_id}>
							<td>{r.course_id}</td><td>{r.course_code}</td><td>{r.course_desc}</td>
							<td>
								<button className='w3-button w3-blue w3-small' onClick={() => handleEdit(r)}>&#9998;</button>
								<button className='w3-button w3-red w3-small' onClick={() => handleDelete(r.course_id)}>&times;</button>
							</td>
						</tr>
					)) : <tr><td colSpan='4' className='w3-center'>No records found.</td></tr>}
				</tbody>
			</table>

			<div className='w3-modal' id='coursemodal'>
				<div className='w3-modal-content w3-animate-top' style={{ width: '50%' }}>
					<div className='w3-container w3-padding w3-blue'>
						{isEditing ? 'EDIT COURSE' : 'ADD COURSE'}
						<span className='w3-button w3-display-topright' onClick={() => { clearForm(); document.getElementById('coursemodal').style.display = 'none'; }}>&times;</span>
					</div>
					<div className='w3-container w3-padding'>
						<form onSubmit={handleSubmit}>
							<p><label>COURSE ID</label><input type='text' className='w3-input w3-border' value={course_id} disabled={isEditing} onChange={(e) => setCourse_id(e.target.value)} /></p>
							<p><label>COURSE CODE</label><input type='text' className='w3-input w3-border' value={course_code} onChange={(e) => setCourse_code(e.target.value)} /></p>
							<p><label>DESCRIPTION</label><input type='text' className='w3-input w3-border' value={course_desc} onChange={(e) => setCourse_desc(e.target.value)} /></p>
							<p className='w3-right'><input type='submit' value='SAVE' className='w3-button w3-blue' /></p>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}

// ─── SUBJECTS PAGE ─────────────────────────────────────────────────────────────
function SubjectsPage() {
	const [subjects, setSubjects] = useState([]);
	const [search, setSearch] = useState('');
	const [subjid, setSubjid] = useState('');
	const [subjcode, setSubjcode] = useState('');
	const [subjdesc, setSubjdesc] = useState('');
	const [units, setUnits] = useState('');
	const [isEditing, setIsEditing] = useState(false);
	const [editId, setEditId] = useState(null);

	const fetchData = async () => {
		try { const res = await fetch(`${API}/subjects`); const _su = await res.json(); setSubjects(Array.isArray(_su) ? _su : []); } catch (e) { console.error(e); }
	};
	useEffect(() => { fetchData(); }, []);

	const filtered = subjects.filter((r) => {
		const q = search.toLowerCase();
		return r.subjid?.toString().includes(q) || r.subjcode?.toLowerCase().includes(q) || r.subjdesc?.toLowerCase().includes(q) || r.units?.toString().includes(q);
	});
	const clearForm = () => { setSubjid(''); setSubjcode(''); setSubjdesc(''); setUnits(''); setIsEditing(false); setEditId(null); };
	const handleEdit = (r) => { setSubjid(r.subjid); setSubjcode(r.subjcode); setSubjdesc(r.subjdesc); setUnits(r.units); setIsEditing(true); setEditId(r.subjid); document.getElementById('subjectsmodal').style.display = 'block'; };
	const handleDelete = async (id) => {
		if (!window.confirm(`Delete subject ${id}?`)) return;
		try { const res = await fetch(`${API}/subjects/${id}`, { method: 'DELETE' }); if (!res.ok) throw new Error(); fetchData(); } catch (e) { console.error(e); }
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (isEditing) {
				await fetch(`${API}/subjects/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subjcode, subjdesc, units }) });
			} else {
				await fetch(`${API}/subjects`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subjid: subjid || undefined, subjcode, subjdesc, units }) });
			}
			fetchData(); clearForm(); document.getElementById('subjectsmodal').style.display = 'none';
		} catch (e) { console.error(e); }
	};

	return (
		<div className="w3-container w3-padding">
			<div className='w3-row w3-padding'>
				<div className='w3-col' style={{ width: '60%' }}>
					<input type='text' className='w3-input w3-border' placeholder='Search...' value={search} onChange={(e) => setSearch(e.target.value)} />
				</div>
				<div className='w3-col' style={{ width: '40%', textAlign: 'right' }}>
					<button className='w3-button w3-green' onClick={() => setSearch(search)}>&#128269; SEARCH</button>
					&nbsp;
					<button className='w3-button w3-blue' onClick={() => { clearForm(); document.getElementById('subjectsmodal').style.display = 'block'; }}>+ADD</button>
				</div>
			</div>
			<table className="w3-table-all">
				<thead><tr className="w3-indigo"><th>SUBJ ID</th><th>CODE</th><th>DESCRIPTION</th><th>UNITS</th><th>CONTROL</th></tr></thead>
				<tbody>
					{filtered.length > 0 ? filtered.map((r) => (
						<tr key={r.subjid}>
							<td>{r.subjid}</td><td>{r.subjcode}</td><td>{r.subjdesc}</td><td>{r.units}</td>
							<td>
								<button className='w3-button w3-blue w3-small' onClick={() => handleEdit(r)}>&#9998;</button>
								<button className='w3-button w3-red w3-small' onClick={() => handleDelete(r.subjid)}>&times;</button>
							</td>
						</tr>
					)) : <tr><td colSpan='5' className='w3-center'>No records found.</td></tr>}
				</tbody>
			</table>

			<div className='w3-modal' id='subjectsmodal'>
				<div className='w3-modal-content w3-animate-top' style={{ width: '50%' }}>
					<div className='w3-container w3-padding w3-blue'>
						{isEditing ? 'EDIT SUBJECT' : 'ADD SUBJECT'}
						<span className='w3-button w3-display-topright' onClick={() => { clearForm(); document.getElementById('subjectsmodal').style.display = 'none'; }}>&times;</span>
					</div>
					<div className='w3-container w3-padding'>
						<form onSubmit={handleSubmit}>
							<p><label>SUBJECT ID</label><input type='text' className='w3-input w3-border' value={isEditing ? editId : subjid} disabled={isEditing} placeholder='Leave blank to auto-generate' onChange={(e) => setSubjid(e.target.value)} /></p>
							<p><label>SUBJECT CODE</label><input type='text' className='w3-input w3-border' value={subjcode} onChange={(e) => setSubjcode(e.target.value)} /></p>
							<p><label>DESCRIPTION</label><input type='text' className='w3-input w3-border' value={subjdesc} onChange={(e) => setSubjdesc(e.target.value)} /></p>
							<p><label>UNITS</label><input type='number' step='0.5' className='w3-input w3-border' value={units} onChange={(e) => setUnits(e.target.value)} /></p>
							<p className='w3-right'><input type='submit' value='SAVE' className='w3-button w3-blue' /></p>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}

// ─── TEACHERS PAGE ─────────────────────────────────────────────────────────────
function TeachersPage() {
	const [teachers, setTeachers] = useState([]);
	const [search, setSearch] = useState('');
	const [teachercode, setTeachercode] = useState('');
	const [rfid, setRfid] = useState('');
	const [lastname, setLastname] = useState('');
	const [firstname, setFirstname] = useState('');
	const [deptid, setDeptid] = useState('');
	const [isEditing, setIsEditing] = useState(false);
	const [editId, setEditId] = useState(null);

	const fetchData = async () => {
		try { const res = await fetch(`${API}/teachers`); const _te = await res.json(); setTeachers(Array.isArray(_te) ? _te : []); } catch (e) { console.error(e); }
	};
	useEffect(() => { fetchData(); }, []);

	const filtered = teachers.filter((r) => {
		const q = search.toLowerCase();
		return r.teacherid?.toString().includes(q) || r.teachercode?.toLowerCase().includes(q) || r.rfid?.toLowerCase().includes(q) || r.lastname?.toLowerCase().includes(q) || r.firstname?.toLowerCase().includes(q) || r.deptid?.toString().includes(q);
	});
	const clearForm = () => { setTeachercode(''); setRfid(''); setLastname(''); setFirstname(''); setDeptid(''); setIsEditing(false); setEditId(null); };
	const handleEdit = (r) => { setTeachercode(r.teachercode); setRfid(r.rfid); setLastname(r.lastname); setFirstname(r.firstname); setDeptid(r.deptid); setIsEditing(true); setEditId(r.teacherid); document.getElementById('teachersmodal').style.display = 'block'; };
	const handleDelete = async (id) => {
		if (!window.confirm(`Delete teacher ${id}?`)) return;
		try { const res = await fetch(`${API}/teachers/${id}`, { method: 'DELETE' }); if (!res.ok) throw new Error(); fetchData(); } catch (e) { console.error(e); }
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (isEditing) {
				await fetch(`${API}/teachers/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ teachercode, rfid, lastname, firstname, deptid }) });
			} else {
				await fetch(`${API}/teachers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ teachercode, rfid, lastname, firstname, deptid }) });
			}
			fetchData(); clearForm(); document.getElementById('teachersmodal').style.display = 'none';
		} catch (e) { console.error(e); }
	};

	return (
		<div className="w3-container w3-padding">
			<div className='w3-row w3-padding'>
				<div className='w3-col' style={{ width: '60%' }}>
					<input type='text' className='w3-input w3-border' placeholder='Search...' value={search} onChange={(e) => setSearch(e.target.value)} />
				</div>
				<div className='w3-col' style={{ width: '40%', textAlign: 'right' }}>
					<button className='w3-button w3-green' onClick={() => setSearch(search)}>&#128269; SEARCH</button>
					&nbsp;
					<button className='w3-button w3-blue' onClick={() => { clearForm(); document.getElementById('teachersmodal').style.display = 'block'; }}>+ADD</button>
				</div>
			</div>
			<table className="w3-table-all">
				<thead><tr className="w3-indigo"><th>ID</th><th>CODE</th><th>RFID</th><th>LASTNAME</th><th>FIRSTNAME</th><th>DEPT ID</th><th>CONTROL</th></tr></thead>
				<tbody>
					{filtered.length > 0 ? filtered.map((r) => (
						<tr key={r.teacherid}>
							<td>{r.teacherid}</td><td>{r.teachercode}</td><td>{r.rfid}</td>
							<td>{r.lastname}</td><td>{r.firstname}</td><td>{r.deptid}</td>
							<td>
								<button className='w3-button w3-blue w3-small' onClick={() => handleEdit(r)}>&#9998;</button>
								<button className='w3-button w3-red w3-small' onClick={() => handleDelete(r.teacherid)}>&times;</button>
							</td>
						</tr>
					)) : <tr><td colSpan='7' className='w3-center'>No records found.</td></tr>}
				</tbody>
			</table>

			<div className='w3-modal' id='teachersmodal'>
				<div className='w3-modal-content w3-animate-top' style={{ width: '50%' }}>
					<div className='w3-container w3-padding w3-blue'>
						{isEditing ? 'EDIT TEACHER' : 'ADD TEACHER'}
						<span className='w3-button w3-display-topright' onClick={() => { clearForm(); document.getElementById('teachersmodal').style.display = 'none'; }}>&times;</span>
					</div>
					<div className='w3-container w3-padding'>
						<form onSubmit={handleSubmit}>
							<p><label>TEACHER CODE</label><input type='text' className='w3-input w3-border' value={teachercode} onChange={(e) => setTeachercode(e.target.value)} /></p>
							<p><label>RFID</label><input type='text' className='w3-input w3-border' value={rfid} onChange={(e) => setRfid(e.target.value)} /></p>
							<p><label>LASTNAME</label><input type='text' className='w3-input w3-border' value={lastname} onChange={(e) => setLastname(e.target.value)} /></p>
							<p><label>FIRSTNAME</label><input type='text' className='w3-input w3-border' value={firstname} onChange={(e) => setFirstname(e.target.value)} /></p>
							<p><label>DEPT ID</label><input type='number' className='w3-input w3-border' value={deptid} min={1} max={10} onChange={(e) => { if(e.target.value === '' || (parseInt(e.target.value) >= 1 && parseInt(e.target.value) <= 10)) setDeptid(e.target.value); }} /></p>
							<p className='w3-right'><input type='submit' value='SAVE' className='w3-button w3-blue' /></p>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}

// ─── SUBJECT OFFERED PAGE ──────────────────────────────────────────────────────
function SubjectOfferedPage() {
	const [subjectoffered, setSubjectOffered] = useState([]);
	const [subjects, setSubjects] = useState([]);
	const [teachers, setTeachers] = useState([]);
	const [search, setSearch] = useState('');
	const [edpcode, setEdpcode] = useState('');
	const [subjid, setSubjid] = useState('');
	const [start_time, setStart_time] = useState('');
	const [end_time, setEnd_time] = useState('');
	const [days, setDays] = useState('');
	const [room, setRoom] = useState('');
	const [teacherid, setTeacherid] = useState('');
	const [isEditing, setIsEditing] = useState(false);
	const [editId, setEditId] = useState(null);

	const fetchData = async () => {
		try { const res = await fetch(`${API}/subjectoffered`); const _so = await res.json(); setSubjectOffered(Array.isArray(_so) ? _so : []); } catch (e) { console.error(e); }
	};
	const fetchDropdowns = async () => {
		try {
			const [sRes, tRes] = await Promise.all([fetch(`${API}/subjects`), fetch(`${API}/teachers`)]);
			const _sj = await sRes.json(); setSubjects(Array.isArray(_sj) ? _sj : []); const _tt = await tRes.json(); setTeachers(Array.isArray(_tt) ? _tt : []);
		} catch (e) { console.error(e); }
	};
	useEffect(() => { fetchData(); fetchDropdowns(); }, []);

	const filtered = subjectoffered.filter((r) => {
		const q = search.toLowerCase();
		return r.suboffid?.toString().includes(q) || r.edpcode?.toLowerCase().includes(q) || r.days?.toLowerCase().includes(q) || r.room?.toLowerCase().includes(q);
	});
	const clearForm = () => { setEdpcode(''); setSubjid(''); setStart_time(''); setEnd_time(''); setDays(''); setRoom(''); setTeacherid(''); setIsEditing(false); setEditId(null); };
	const handleEdit = (r) => { setEdpcode(r.edpcode); setSubjid(r.subjid); setStart_time(r.start_time); setEnd_time(r.end_time); setDays(r.days); setRoom(r.room); setTeacherid(r.teacherid); setIsEditing(true); setEditId(r.suboffid); document.getElementById('somodal').style.display = 'block'; };
	const handleDelete = async (id) => {
		if (!window.confirm(`Delete subject offered ${id}?`)) return;
		try { const res = await fetch(`${API}/subjectoffered/${id}`, { method: 'DELETE' }); if (!res.ok) throw new Error(); fetchData(); } catch (e) { console.error(e); }
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (isEditing) {
				await fetch(`${API}/subjectoffered/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ edpcode, subjid, start_time, end_time, days, room, teacherid }) });
			} else {
				await fetch(`${API}/subjectoffered`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ edpcode, subjid, start_time, end_time, days, room, teacherid }) });
			}
			fetchData(); clearForm(); document.getElementById('somodal').style.display = 'none';
		} catch (e) { console.error(e); }
	};

	return (
		<div className="w3-container w3-padding">
			<div className='w3-row w3-padding'>
				<div className='w3-col' style={{ width: '60%' }}>
					<input type='text' className='w3-input w3-border' placeholder='Search...' value={search} onChange={(e) => setSearch(e.target.value)} />
				</div>
				<div className='w3-col' style={{ width: '40%', textAlign: 'right' }}>
					<button className='w3-button w3-green' onClick={() => setSearch(search)}>&#128269; SEARCH</button>
					&nbsp;
					<button className='w3-button w3-blue' onClick={() => { clearForm(); document.getElementById('somodal').style.display = 'block'; }}>+ADD</button>
				</div>
			</div>
			<table className="w3-table-all">
				<thead><tr className="w3-indigo"><th>ID</th><th>EDP CODE</th><th>SUBJ ID</th><th>START</th><th>END</th><th>DAYS</th><th>ROOM</th><th>TEACHER NAME</th><th>CONTROL</th></tr></thead>
				<tbody>
					{filtered.length > 0 ? filtered.map((r) => {
						const teacher = teachers.find(t => String(t.teacherid) === String(r.teacherid));
						const teacherName = teacher ? teacher.lastname + ', ' + teacher.firstname : '(ID: ' + r.teacherid + ')';
						return (
						<tr key={r.suboffid}>
							<td>{r.suboffid}</td><td>{r.edpcode}</td><td>{r.subjid}</td>
							<td>{r.start_time}</td><td>{r.end_time}</td><td>{r.days}</td>
							<td>{r.room}</td><td>{teacherName}</td>
							<td>
								<button className='w3-button w3-blue w3-small' onClick={() => handleEdit(r)}>&#9998;</button>
								<button className='w3-button w3-red w3-small' onClick={() => handleDelete(r.suboffid)}>&times;</button>
							</td>
						</tr>
						);
					}) : <tr><td colSpan='9' className='w3-center'>No records found.</td></tr>}
				</tbody>
			</table>

			<div className='w3-modal' id='somodal'>
				<div className='w3-modal-content w3-animate-top' style={{ width: '50%' }}>
					<div className='w3-container w3-padding w3-blue'>
						{isEditing ? 'EDIT SUBJECT OFFERED' : 'ADD SUBJECT OFFERED'}
						<span className='w3-button w3-display-topright' onClick={() => { clearForm(); document.getElementById('somodal').style.display = 'none'; }}>&times;</span>
					</div>
					<div className='w3-container w3-padding'>
						<form onSubmit={handleSubmit}>
							<p><label>EDP CODE</label><input type='text' className='w3-input w3-border' value={edpcode} onChange={(e) => setEdpcode(e.target.value)} /></p>
							<p><label>SUBJECT</label>
								<select className='w3-select w3-border' value={subjid} onChange={(e) => setSubjid(e.target.value)}>
									<option value=''>Select Option</option>
									{subjects.map(s => <option key={s.subjid} value={s.subjid}>{s.subjcode} - {s.subjdesc}</option>)}
								</select>
							</p>
							<p><label>START TIME</label><input type='text' className='w3-input w3-border' placeholder='e.g. 7:30 AM' value={start_time} onChange={(e) => setStart_time(e.target.value)} /></p>
							<p><label>END TIME</label><input type='text' className='w3-input w3-border' placeholder='e.g. 9:00 AM' value={end_time} onChange={(e) => setEnd_time(e.target.value)} /></p>
							<p><label>DAYS</label><input type='text' className='w3-input w3-border' placeholder='e.g. MWF' value={days} onChange={(e) => setDays(e.target.value)} /></p>
							<p><label>ROOM</label><input type='text' className='w3-input w3-border' value={room} onChange={(e) => setRoom(e.target.value)} /></p>
							<p><label>TEACHER</label>
								<select className='w3-select w3-border' value={teacherid} onChange={(e) => setTeacherid(e.target.value)}>
									<option value=''>Select Option</option>
									{teachers.map(t => <option key={t.teacherid} value={t.teacherid}>{t.lastname}, {t.firstname}</option>)}
								</select>
							</p>
							<p className='w3-right'><input type='submit' value='SAVE' className='w3-button w3-blue' /></p>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}

// ─── ENROLLMENT PAGE ───────────────────────────────────────────────────────────
function EnrollmentPage() {
	const [studentIdInput, setStudentIdInput] = useState('');
	const [student, setStudent] = useState(null);
	const [studentError, setStudentError] = useState('');
	const [edpInput, setEdpInput] = useState('');
	const [edpError, setEdpError] = useState('');
	const [cart, setCart] = useState([]);

	const now = new Date();
	const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

	const handleStudentSearch = async () => {
		setStudentError(''); setStudent(null);
		if (!studentIdInput.trim()) return;
		try {
			const res = await fetch(`${API}/students/${studentIdInput.trim()}`);
			const json = await res.json();
			if (!json || json.length === 0) { setStudentError('Student not found.'); return; }
			setStudent(Array.isArray(json) ? json[0] : json);
		} catch (e) { setStudentError('Error fetching student.'); }
	};

	const handleEdpSearch = async () => {
		setEdpError('');
		if (!edpInput.trim()) return;
		try {
			const res = await fetch(`${API}/subjectoffered`);
			const all = await res.json();
			const found = all.find(r => r.edpcode?.toLowerCase() === edpInput.trim().toLowerCase());
			if (!found) { setEdpError('EDP code not found.'); return; }
			if (cart.find(c => c.suboffid === found.suboffid)) { setEdpError('Already added.'); return; }
			const sRes = await fetch(`${API}/subjects/${found.subjid}`);
			const sJson = await sRes.json();
			const subj = Array.isArray(sJson) ? sJson[0] : sJson;
			setCart(prev => [...prev, { ...found, subjcode: subj?.subjcode || '', subjdesc: subj?.subjdesc || '', units: subj?.units || 0 }]);
			setEdpInput('');
		} catch (e) { setEdpError('Error fetching subject.'); }
	};

	const removeFromCart = (suboffid) => setCart(prev => prev.filter(c => c.suboffid !== suboffid));
	const totalUnits = cart.reduce((sum, c) => sum + parseFloat(c.units || 0), 0);

	const handleEnroll = async () => {
		if (!student) { alert('Please select a student first.'); return; }
		if (cart.length === 0) { alert('Please add at least one subject.'); return; }
		try {
			// Short unique enroll_code within varchar(10) limit
			const enroll_code = 'E' + String(student.idno).slice(-4) + String(Date.now()).slice(-5);
			const enrollRes = await fetch(`${API}/enrollment`, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					enroll_code: enroll_code,
					enroll_date: new Date().toISOString().slice(0, 10),
					student_id: student.idno, status: 'Enrolled', amt_paid: '0',
				}),
			});
			// Show actual server error if any
			if (!enrollRes.ok) {
				const errData = await enrollRes.json();
				throw new Error(JSON.stringify(errData));
			}
			const enrollData = await enrollRes.json();
			const newEnrollId = enrollData.insertId;
			for (const item of cart) {
				const detailRes = await fetch(`${API}/enrollment_details`, {
					method: 'POST', headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ enroll_id: newEnrollId, suboffid: item.suboffid }),
				});
				if (!detailRes.ok) {
					const errData = await detailRes.json();
					console.error('Detail insert error:', errData);
				}
			}
			alert(`Enrollment successful! ID: ${newEnrollId}`);
			setStudentIdInput(''); setStudent(null); setCart([]);
		} catch (e) { alert('Enrollment failed: ' + e.message); }
	};

	return (
		<div className="w3-container w3-padding">
			{/* HEADER: student search + date/time */}
			<div className="w3-row w3-padding" style={{ display: 'flex', alignItems: 'center' }}>
				<div style={{ display: 'flex', gap: '6px', alignItems: 'center', flex: 1 }}>
					<input type="text" className="w3-input w3-border" placeholder="Enter Student ID No..."
						value={studentIdInput} onChange={e => setStudentIdInput(e.target.value)}
						onKeyDown={e => e.key === 'Enter' && handleStudentSearch()}
						style={{ width: '220px' }} />
					<button className="w3-button w3-indigo" onClick={handleStudentSearch}>&#128269;</button>
				</div>
				<div style={{ textAlign: 'right', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
					{timeStr} &nbsp; {dateStr}
				</div>
			</div>

			{/* STUDENT INFO */}
			<div className="w3-panel w3-light-grey w3-border" style={{ padding: '12px', marginBottom: '12px' }}>
				{studentError && <span className="w3-text-red">{studentError}</span>}
				{student ? (
					<div style={{ display: 'flex', gap: '40px' }}>
						<div><div style={{ fontSize: '11px', color: '#555' }}>LAST NAME</div><b>{student.lastname}</b></div>
						<div><div style={{ fontSize: '11px', color: '#555' }}>FIRST NAME</div><b>{student.firstname}</b></div>
						<div><div style={{ fontSize: '11px', color: '#555' }}>COURSE</div><b>{student.course_id}</b></div>
						<div><div style={{ fontSize: '11px', color: '#555' }}>LEVEL</div><b>{student.level}</b></div>
					</div>
				) : (
					<span className="w3-text-grey">No student selected. Search by ID No. above.</span>
				)}
			</div>

			{/* EDP CODE SEARCH */}
			<div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
				<input type="text" className="w3-input w3-border" placeholder="Enter EDP Code..."
					value={edpInput} onChange={e => setEdpInput(e.target.value)}
					onKeyDown={e => e.key === 'Enter' && handleEdpSearch()}
					style={{ width: '200px' }} />
				<button className="w3-button w3-indigo" onClick={handleEdpSearch}>&#128269;</button>
				{edpError && <span className="w3-text-red" style={{ fontSize: '12px' }}>{edpError}</span>}
			</div>

			{/* SUBJECTS TABLE */}
			<table className="w3-table-all">
				<thead>
					<tr className="w3-indigo">
						<th>EDP CODE</th><th>SUBJECT CODE</th><th>DESCRIPTION</th>
						<th>TIME</th><th>DAYS</th><th>ROOM</th><th>UNITS</th><th>ACTION</th>
					</tr>
				</thead>
				<tbody>
					{cart.length > 0 ? cart.map((c) => (
						<tr key={c.suboffid}>
							<td>{c.edpcode}</td><td>{c.subjcode}</td><td>{c.subjdesc}</td>
							<td>{c.start_time} - {c.end_time}</td><td>{c.days}</td><td>{c.room}</td><td>{c.units}</td>
							<td><button className="w3-button w3-red w3-small" onClick={() => removeFromCart(c.suboffid)}>&times;</button></td>
						</tr>
					)) : (
						<tr><td colSpan="8" className="w3-center w3-text-grey" style={{ padding: '16px' }}>No subjects added yet. Search by EDP code above.</td></tr>
					)}
				</tbody>
			</table>

			{/* TOTAL + BUTTONS */}
			<div className="w3-row" style={{ marginTop: '12px', display: 'flex', alignItems: 'center' }}>
				<div style={{ flex: 1, display: 'flex', gap: '8px' }}>
					<button className="w3-button w3-indigo" onClick={handleEnroll}>ENROLL</button>
					<button className="w3-button w3-grey" onClick={() => { setStudentIdInput(''); setStudent(null); setCart([]); setStudentError(''); setEdpError(''); }}>
						&#x21BA; CLEAR
					</button>
				</div>
				<div style={{ textAlign: 'right' }}>
					<span style={{ fontWeight: 'bold', marginRight: '10px' }}>TOTAL UNITS:</span>
					<span className="w3-tag w3-indigo" style={{ fontSize: '14px', padding: '4px 16px' }}>{totalUnits}</span>
				</div>
			</div>
		</div>
	);
}

// ─── ENROLLMENT DETAILS PAGE ───────────────────────────────────────────────────
function EnrollmentDetailsPage() {
	const [details, setDetails] = useState([]);
	const [enrollments, setEnrollments] = useState([]);
	const [subjectoffered, setSubjectOffered] = useState([]);
	const [subjects, setSubjects] = useState([]);
	const [students, setStudents] = useState([]);
	const [search, setSearch] = useState('');

	const fetchAll = async () => {
		try {
			const [dRes, eRes, soRes, subjRes, stRes] = await Promise.all([
				fetch(`${API}/enrollment_details`),
				fetch(`${API}/enrollment`),
				fetch(`${API}/subjectoffered`),
				fetch(`${API}/subjects`),
				fetch(`${API}/students`),
			]);
			const _d = await dRes.json(); setDetails(Array.isArray(_d) ? _d : []);
			const _e = await eRes.json(); setEnrollments(Array.isArray(_e) ? _e : []);
			const _so2 = await soRes.json(); setSubjectOffered(Array.isArray(_so2) ? _so2 : []);
			const _s = await subjRes.json(); setSubjects(Array.isArray(_s) ? _s : []);
			const _st2 = await stRes.json(); setStudents(Array.isArray(_st2) ? _st2 : []);
		} catch (e) { console.error(e); }
	};

	useEffect(() => { fetchAll(); }, []);

	// Lookup helpers
	const getEnrollment = (enroll_id) => enrollments.find(e => e.enroll_id === enroll_id) || {};
	const getSubOff = (suboffid) => subjectoffered.find(s => s.suboffid === suboffid) || {};
	const getSubject = (subjid) => subjects.find(s => s.subjid === subjid) || {};
	const getStudent = (student_id) => students.find(s => String(s.idno) === String(student_id)) || {};

	// Build enriched rows
	const enriched = details.map(d => {
		const enroll = getEnrollment(d.enroll_id);
		const so = getSubOff(d.suboffid);
		const subj = getSubject(so.subjid);
		const student = getStudent(enroll.student_id);
		return { ...d, enroll, so, subj, student };
	});

	const filtered = enriched.filter(r => {
		const q = search.toLowerCase();
		return (
			r.enroll_detail_id?.toString().includes(q) ||
			r.enroll_id?.toString().includes(q) ||
			r.enroll?.enroll_code?.toLowerCase().includes(q) ||
			r.student?.lastname?.toLowerCase().includes(q) ||
			r.student?.firstname?.toLowerCase().includes(q) ||
			r.so?.edpcode?.toLowerCase().includes(q) ||
			r.subj?.subjcode?.toLowerCase().includes(q) ||
			r.subj?.subjdesc?.toLowerCase().includes(q)
		);
	});

	const handleDelete = async (id) => {
		if (!window.confirm(`Delete enrollment detail ${id}?`)) return;
		try {
			const res = await fetch(`${API}/enrollment_details/${id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error();
			fetchAll();
		} catch (e) { console.error(e); }
	};

	return (
		<div className="w3-container w3-padding">
			<div className="w3-row w3-padding">
				<div className="w3-col" style={{ width: '60%' }}>
					<input type="text" className="w3-input w3-border"
						placeholder="Search by student, subject, EDP code, enroll code..."
						value={search} onChange={(e) => setSearch(e.target.value)} />
				</div>
				<div className="w3-col" style={{ width: '40%', textAlign: 'right' }}>
					<button className="w3-button w3-green" onClick={() => setSearch(search)}>&#128269; SEARCH</button>
					&nbsp;
					<button className="w3-button w3-blue" onClick={fetchAll}>&#8635; REFRESH</button>
				</div>
			</div>

			<table className="w3-table-all">
				<thead>
					<tr className="w3-indigo">
						<th>DETAIL ID</th>
						<th>ENROLL ID</th>
						<th>ENROLL CODE</th>
						<th>STUDENT</th>
						<th>EDP CODE</th>
						<th>SUBJECT CODE</th>
						<th>DESCRIPTION</th>
						<th>TIME</th>
						<th>DAYS</th>
						<th>UNITS</th>
						<th>CONTROL</th>
					</tr>
				</thead>
				<tbody>
					{filtered.length > 0 ? filtered.map((r) => (
						<tr key={r.enroll_detail_id}>
							<td>{r.enroll_detail_id}</td>
							<td>{r.enroll_id}</td>
							<td>{r.enroll?.enroll_code}</td>
							<td>{r.student?.lastname}, {r.student?.firstname}</td>
							<td>{r.so?.edpcode}</td>
							<td>{r.subj?.subjcode}</td>
							<td>{r.subj?.subjdesc}</td>
							<td>{r.so?.start_time} - {r.so?.end_time}</td>
							<td>{r.so?.days}</td>
							<td>{r.subj?.units}</td>
							<td>
								<button className="w3-button w3-red w3-small" onClick={() => handleDelete(r.enroll_detail_id)}>&times;</button>
							</td>
						</tr>
					)) : (
						<tr><td colSpan="11" className="w3-center">No records found.</td></tr>
					)}
				</tbody>
			</table>
		</div>
	);
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
function App() {
	const [activePage, setActivePage] = useState('students');
	const [sidebarOpen, setSidebarOpen] = useState(true);

	const navItems = [
		{ key: 'students',           label: '🎓 Students' },
		{ key: 'course',             label: '📚 Courses' },
		{ key: 'subjects',           label: '📖 Subjects' },
		{ key: 'teachers',           label: '👨‍🏫 Teachers' },
		{ key: 'subjectoffered',     label: '🗓️ Subject Offered' },
		{ key: 'enrollment',         label: '📝 Enrollment' },
		{ key: 'enrollment_details', label: '🔗 Enroll Details' },
	];

	const pageTitles = {
		students: 'Students', course: 'Courses', subjects: 'Subjects',
		teachers: 'Teachers', subjectoffered: 'Subject Offered',
		enrollment: 'Enrollment', enrollment_details: 'Enrollment Details',
	};

	const renderPage = () => {
		switch (activePage) {
			case 'students':           return <StudentsPage />;
			case 'course':             return <CoursePage />;
			case 'subjects':           return <SubjectsPage />;
			case 'teachers':           return <TeachersPage />;
			case 'subjectoffered':     return <SubjectOfferedPage />;
			case 'enrollment':         return <EnrollmentPage />;
			case 'enrollment_details': return <EnrollmentDetailsPage />;
			default:                   return null;
		}
	};

	return (
		<>
			{/* TOP BAR */}
			<div className="w3-bar w3-padding w3-container w3-indigo"
				style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
				<button className="w3-button w3-indigo" style={{ fontSize: '20px', padding: '2px 10px' }}
					onClick={() => setSidebarOpen(o => !o)}>☰</button>
				<h4 style={{ margin: 0 }}>School v1.0</h4>
				<span style={{ opacity: 0.75 }}>| {pageTitles[activePage]}</span>
			</div>

			<div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
				{/* SIDEBAR */}
				{sidebarOpen && (
					<div className="w3-bar-block w3-indigo"
						style={{ width: '200px', minWidth: '200px', height: '100%', overflowY: 'auto', flexShrink: 0 }}>
						{navItems.map(item => (
							<button key={item.key}
								className={`w3-bar-item w3-button${activePage === item.key ? ' w3-blue' : ''}`}
								style={{ textAlign: 'left', width: '100%' }}
								onClick={() => setActivePage(item.key)}>
								{item.label}
							</button>
						))}
					</div>
				)}

				{/* PAGE CONTENT */}
				<div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
					{renderPage()}
				</div>
			</div>
		</>
	);
}

export default App;
