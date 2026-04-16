import './App.css';
import React,{useState,useEffect} from 'react';

function App() {
	const [students,setStudent] = useState([]);
	const [loading,setLoading] = useState({});
	const [search,setSearch] = useState('');
	//
	const [idno,setIdno] = useState('');
	const [lastname,setLastname] = useState('');
	const [firstname,setFirstname] = useState('');
	const [course_id,setCourse_id] = useState('');
	const [level,setLevel] = useState('');
	const [isEditing,setIsEditing] = useState(false);
	const [editIdno,setEditIdno] = useState(null);
	
	const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/students');
        const json = await response.json();
        setStudent(json);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

	useEffect(() => {
    fetchData();
  }, []);

  const filteredStudents = students.filter((student) => {
	const q = search.toLowerCase();
	return (
		student.idno?.toString().toLowerCase().includes(q) ||
		student.lastname?.toLowerCase().includes(q) ||
		student.firstname?.toLowerCase().includes(q) ||
		student.course_id?.toString().toLowerCase().includes(q) ||
		student.level?.toString().toLowerCase().includes(q)
	);
  });

  const clearForm = () => {
	setIdno('');
	setLastname('');
	setFirstname('');
	setCourse_id('');
	setLevel('');
	setIsEditing(false);
	setEditIdno(null);
  };

  const handleEdit = (student) => {
	setIdno(student.idno);
	setLastname(student.lastname);
	setFirstname(student.firstname);
	setCourse_id(student.course_id);
	setLevel(student.level);
	setIsEditing(true);
	setEditIdno(student.idno);
	document.getElementById('studentmodal').style.display = 'block';
  };

  const handleDelete = async (idno) => {
	if(!window.confirm(`Are you sure you want to delete student ${idno}?`)) return;
	try {
		const response = await fetch(`http://localhost:5000/students/${idno}`, {
			method: 'DELETE',
		});
		if(!response.ok) throw new Error('Delete failed');
		fetchData();
	} catch (error) {
		console.error("Delete error:", error);
	}
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault(); 
	try {
		if(isEditing) {
			const response = await fetch(`http://localhost:5000/students/${editIdno}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					lastname: lastname,
					firstname: firstname,
					course_id: course_id,
					level: level,
				}),
			});
			if(!response.ok) throw new Error('Update failed');
		} else {
			const response = await fetch('http://localhost:5000/students', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					idno: idno, 
					lastname: lastname,
					firstname: firstname,
					course_id: course_id,
					level: level,
				}),
			});
			if(!response.ok) throw new Error('Insert failed');
		}
		fetchData();
		clearForm();
		document.getElementById('studentmodal').style.display = 'none';
    } catch (error) {
        console.error("Error:", error);
    }
  };

  return (
    <>
		<div className="w3-bar w3-padding w3-container w3-indigo">
			<h4>School  v1.0</h4>
		</div>
		
		<div className="w3-container w3-padding">
			<div className='w3-row w3-padding'>
				<div className='w3-col' style={{width:'70%'}}>
					<input
						type='text'
						className='w3-input w3-border'
						placeholder='Search by idno, name, course, level...'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
				<div className='w3-col w3-right' style={{width:'30%', textAlign:'right'}}>
					<button className='w3-button w3-blue' onClick={() => {
						clearForm();
						document.getElementById('studentmodal').style.display='block';
					}}>+ADD</button>
				</div>
			</div>

			<table className="w3-table-all">
			  <thead>
				<tr>
				  <th>IDNO</th>
				  <th>LASTNAME</th>
				  <th>FIRSTNAME</th>
				  <th>COURSE</th>
				  <th>LEVEL</th>
				  <th>CONTROL</th>
				</tr>
			  </thead>
			  <tbody>
				{filteredStudents.length > 0 ? (
					filteredStudents.map((student) => (
					  <tr key={student.id}> 
						<td>{student.idno}</td>
						<td>{student.lastname}</td>
						<td>{student.firstname}</td>
						<td>{student.course_id}</td>
						<td>{student.level}</td>
						<td>
							<button className='w3-button w3-blue w3-small' onClick={() => handleEdit(student)}>&#9998;</button>
							<button className='w3-button w3-red w3-small' onClick={() => handleDelete(student.idno)}>&times;</button>
						</td>
					  </tr>
					))
				) : (
					<tr>
						<td colSpan='6' className='w3-center'>No students found.</td>
					</tr>
				)}
			  </tbody>
			</table>
		</div>
		
		<div className='w3-modal' id='studentmodal'>
			<div className='w3-modal-content w3-animate-top' style={{ width:'50%' }}>
				<div className='w3-container w3-padding w3-blue'>
					{isEditing ? 'EDIT STUDENT' : 'ADD STUDENT'}
					<span className='w3-button w3-display-topright' onClick={() => {
						clearForm();
						document.getElementById('studentmodal').style.display='none';
					}}>&times;</span>
				</div>
				<div className='w3-container w3-padding'>
					<form onSubmit={handleSubmit}>
						<p>
							<label>IDNO</label>
							<input 
								type='text' 
								className='w3-input w3-border'
								value={idno}
								disabled={isEditing}
								onChange={(e) => setIdno(e.target.value)} 
							/>
						</p>
						<p>
							<label>LASTNAME</label>
							<input 
								type='text' 
								className='w3-input w3-border' 
								value={lastname} 
								onChange={(e) => setLastname(e.target.value)} 
							/>
						</p>
						<p>
							<label>FIRSTNAME</label>
							<input 
								type='text' 
								className='w3-input w3-border'
								value={firstname} 
								onChange={(e) => setFirstname(e.target.value)} 
							/>
						</p>
						<p>
							<label>COURSE</label>
							<select
								className='w3-select w3-border'
								value={course_id}
								onChange={(e) => setCourse_id(e.target.value)}>
								<option value=''>Select Option</option>
								<option value={1}>1</option>
								<option value={2}>2</option>
								<option value={3}>3</option>
								<option value={4}>4</option>
							</select>
						</p>
						<p>
						  <label>LEVEL</label>
						  <select
							className='w3-select w3-border'
							value={level}
							onChange={(e) => setLevel(e.target.value)}>
							<option value=''>Select Option</option> 
							<option value={1}>1</option>
							<option value={2}>2</option>
							<option value={3}>3</option>
							<option value={4}>4</option>
						  </select>
						</p>
						<p className='w3-right'>
							<input type='submit' value='SAVE' className='w3-button w3-blue' />
						</p>
					</form>
				</div>
			</div>
		</div>
	</>
  );
}

export default App;