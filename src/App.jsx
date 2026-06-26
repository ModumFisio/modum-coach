import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Trash2, Save, MonitorPlay, Smartphone, Activity, Clock, Target, ChevronLeft, ChevronRight, CalendarDays, List, BookOpen, Folder, Search, CheckCircle2, Download, X, FileSpreadsheet, Copy, LogOut, Users, UserPlus, Trophy, TrendingUp, Share2, Flame, Bell, BarChart3, FileText } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, writeBatch } from 'firebase/firestore';

// --- CONFIGURACIÓ DE FIREBASE (Les teves claus) ---
const firebaseConfig = {
  apiKey: "AIzaSyB65QVSPhG5sgNw4u4I5SoC_jPmhM3HZkk",
  authDomain: "modum-coach.firebaseapp.com",
  projectId: "modum-coach",
  storageBucket: "modum-coach.firebasestorage.app",
  messagingSenderId: "1042245803922",
  appId: "1:1042245803922:web:bcc4f53c58f6dd0f1b2b4b"
};

// Inicialitzem l'App i els serveis
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- BASE DE DADES INICIAL (Per si la BD està buida) ---
const initialExerciseLibrary = [
  { id: 'ex2', name: 'Run Syn', category: 'Cardio', defaultUnit: 'm' },
  { id: 'ex3', name: 'Row', category: 'Cardio', defaultUnit: 'cal' },
  { id: 'ex4', name: 'Bike Erg', category: 'Cardio', defaultUnit: 'cal' },
  { id: 'ex5', name: 'Ski Erg', category: 'Cardio', defaultUnit: 'cal' },
  { id: 'ex6', name: 'Squats', category: 'Força Inferior', defaultUnit: 'reps' },
  { id: 'ex8', name: 'Deadlift', category: 'Força Inferior', defaultUnit: 'kg' },
  { id: 'ex9', name: 'Box Jumps', category: 'Força Inferior', defaultUnit: 'reps' },
  { id: 'ex7', name: 'Pushups', category: 'Força Superior', defaultUnit: 'reps' },
  { id: 'ex10', name: 'Pull-ups', category: 'Força Superior', defaultUnit: 'reps' },
  { id: 'ex1', name: 'Wall Balls', category: 'Força Superior', defaultUnit: 'reps' },
  { id: 'ex11', name: 'Extensió Isomètrica Genoll', category: 'Genoll', defaultUnit: 'seg' },
  { id: 'ex12', name: 'Sentadilla Búlgara Assistida', category: 'Genoll', defaultUnit: 'reps' },
  { id: 'ex13', name: 'Drop Jumps baixa alçada', category: 'Genoll', defaultUnit: 'reps' },
  { id: 'ex14', name: 'Sissy Squat Regressió', category: 'Genoll', defaultUnit: 'reps' },
  { id: 'ex15', name: 'Rotació Externa amb Goma', category: 'Espatlla', defaultUnit: 'reps' },
  { id: 'ex16', name: 'Press Cubà Lleuger', category: 'Espatlla', defaultUnit: 'kg' },
  { id: 'ex17', name: 'YTWL Isomètric', category: 'Espatlla', defaultUnit: 'seg' },
  { id: 'ex18', name: 'Aixecament Turc (Kettlebell)', category: 'Espatlla', defaultUnit: 'reps' },
  { id: 'ex19', name: 'Elevació Bessons Unilateral', category: 'Peu/Turmell', defaultUnit: 'reps' },
  { id: 'ex20', name: 'Equilibri sobre Bosu', category: 'Peu/Turmell', defaultUnit: 'seg' },
  { id: 'ex21', name: 'Inversió/Eversió amb Goma', category: 'Peu/Turmell', defaultUnit: 'reps' },
  { id: 'ex22', name: 'Pronosupinació amb Manuella', category: 'Colze', defaultUnit: 'reps' },
  { id: 'ex23', name: 'Extensió Tríceps Isomètrica', category: 'Colze', defaultUnit: 'seg' },
  { id: 'ex24', name: 'Flexió Palmar amb Goma', category: 'Mà/Canell', defaultUnit: 'reps' },
  { id: 'ex25', name: 'Agafament de Disc (Pinch Grip)', category: 'Mà/Canell', defaultUnit: 'seg' },
  { id: 'ex26', name: 'Plancha Frontal', category: 'Core', defaultUnit: 'seg' },
  { id: 'ex27', name: 'Pallof Press', category: 'Core', defaultUnit: 'reps' },
  { id: 'ex28', name: 'Bird Dog', category: 'Core', defaultUnit: 'reps' },
  { id: 'ex29', name: 'Dead Bug', category: 'Core', defaultUnit: 'reps' },
];

const unitOptions = ['reps', 'kg', '% 1RM', 'cal', 'm', 'seg', 'min'];

const STANDARD_PRS = [
  '1RM Back Squat', '1RM Front Squat', '1RM Deadlift', '1RM Bench Press', 
  '1RM Strict Press', '1RM Snatch', '1RM Clean & Jerk', 
  'Max Cal Row (1 min)', 'Max Cal SkiErg (1 min)', 'Max Cal Assault (1 min)',
  '5K Run', 'Max Pull-ups (Unbroken)'
];

// --- ETIQUETES DE SESSIÓ ---
const WORKOUT_TAGS = [
  { id: 'ENDURANCE', label: 'Endurance', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'HALTEROFILIA', label: 'Halterofília', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'GYMNASTICS', label: 'Gymnastics', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'STRENGTH', label: 'Força', color: 'bg-red-100 text-red-800 border-red-200' },
  { id: 'RECOVERY', label: 'Recovery', color: 'bg-green-100 text-green-800 border-green-200' },
  { id: 'TEST', label: 'Test / PR', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { id: 'WOD', label: 'Metcon / WOD', color: 'bg-orange-100 text-orange-800 border-orange-200' },
];

const getTagColor = (tagId) => {
  const tag = WORKOUT_TAGS.find(t => t.id === tagId);
  return tag ? tag.color : 'bg-zinc-100 text-zinc-800 border-zinc-200';
};

// --- LOGO SVG Natiu ---
const ModumLogoIcon = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <g fill="#C47A5A" transform="rotate(22 50 50) translate(-6, 0)">
      <rect x="16" y="28" width="16" height="56" rx="8" />
      <rect x="40" y="8" width="16" height="84" rx="8" />
      <rect x="64" y="36" width="16" height="42" rx="8" />
      <circle cx="94" cy="68" r="8" />
    </g>
  </svg>
);

const getLocalISOString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const todayString = getLocalISOString(new Date());

const emptyWorkoutTemplate = {
  id: '',
  date: todayString,
  sessionName: 'NOVA SESSIÓ',
  tag: 'WOD',
  seriesId: '',
  clientId: '',
  blocks: { warmup: [], wod: [], accessories: [] },
  bottomNotes: ''
};

// --- FUNCIÓ GLOBAL NORMALITZACIÓ PR ---
const normalizePRHistory = (prData) => {
  if (!prData) return [];
  if (Array.isArray(prData)) {
    return [...prData].sort((a, b) => a.date.localeCompare(b.date));
  }
  if (typeof prData === 'object') {
    const hist = [];
    if (prData.previous) hist.push({ id: 'legacy_prev', date: 'Anterior', value: prData.previous });
    if (prData.current) hist.push({ id: 'legacy_curr', date: todayString, value: prData.current });
    return hist;
  }
  if (typeof prData === 'string') {
    return [{ id: 'legacy_str', date: todayString, value: prData }];
  }
  return [];
};


// --- COMPONENT DE BIBLIOTECA ---
function LibraryView({ exerciseLibrary, saveExerciseToDB }) {
  const baseCategories = ['Genoll', 'Espatlla', 'Colze', 'Mà/Canell', 'Peu/Turmell', 'Core', 'Cardio', 'Força Inferior', 'Força Superior'];
  const allCategories = ['Totes', ...new Set([...baseCategories, ...exerciseLibrary.map(e => e.category)])];

  const [selectedCategory, setSelectedCategory] = useState('Totes');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const [newExName, setNewExName] = useState('');
  const [newExCategory, setNewExCategory] = useState('Genoll');
  const [newExUnit, setNewExUnit] = useState('reps');

  const handleSaveNewExercise = async (e) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    
    const newEx = {
      id: 'ex_custom_' + Date.now(),
      name: newExName,
      category: newExCategory,
      defaultUnit: newExUnit
    };
    
    await saveExerciseToDB(newEx);
    setNewExName('');
    setIsAdding(false);
  };

  const filteredExercises = exerciseLibrary.filter(ex => {
    const matchCat = selectedCategory === 'Totes' || ex.category === selectedCategory;
    const matchSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-zinc-100 font-sans text-zinc-900 flex flex-col md:flex-row">
      <div className="w-full md:w-72 bg-white border-r border-zinc-200 p-4 flex flex-col h-auto md:h-[calc(100vh-56px)] shrink-0">
         <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 px-2">Carpetes d'Exercicis</h2>
         <div className="flex-1 overflow-y-auto space-y-1">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-orange-100 text-orange-800' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}
              >
                <Folder size={18} className={selectedCategory === cat ? 'text-orange-500' : 'text-zinc-400'} />
                {cat}
              </button>
            ))}
         </div>
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-56px)]">
         <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-zinc-200">
               <div className="relative w-full md:w-96">
                 <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                 <input 
                   type="text" 
                   placeholder="Cerca un exercici..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                 />
               </div>
               <button 
                 onClick={() => setIsAdding(!isAdding)}
                 className="w-full md:w-auto flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-500 transition-colors"
               >
                 {isAdding ? 'Cancel·lar' : <><Plus size={18} /> Nou Exercici</>}
               </button>
            </div>

            {isAdding && (
              <form onSubmit={handleSaveNewExercise} className="bg-orange-50 border border-orange-200 p-6 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-4">
                <h3 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} /> Afegeix a la Biblioteca Cloud
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-orange-800 mb-1">Nom de l'Exercici</label>
                    <input required type="text" value={newExName} onChange={(e)=>setNewExName(e.target.value)} className="w-full p-2 border border-orange-200 rounded outline-none focus:border-orange-500" placeholder="Ex: Press Militar" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-800 mb-1">Carpeta / Categoria</label>
                    <input list="categories-list" required value={newExCategory} onChange={(e)=>setNewExCategory(e.target.value)} className="w-full p-2 border border-orange-200 rounded outline-none focus:border-orange-500" />
                    <datalist id="categories-list">
                      {allCategories.filter(c => c !== 'Totes').map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-800 mb-1">Unitat per Defecte</label>
                    <select value={newExUnit} onChange={(e)=>setNewExUnit(e.target.value)} className="w-full p-2 border border-orange-200 rounded outline-none bg-white">
                      {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded font-bold hover:bg-orange-600">Guardar Exercici</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
               {filteredExercises.length === 0 ? (
                 <div className="col-span-full py-12 text-center text-zinc-400">
                   No s'han trobat exercicis en aquesta carpeta.
                 </div>
               ) : (
                 filteredExercises.map(ex => (
                   <div key={ex.id} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex justify-between items-center hover:border-orange-300 transition-colors">
                     <div>
                       <div className="font-bold text-zinc-900 text-lg">{ex.name}</div>
                       <div className="text-xs font-medium text-zinc-500 mt-1 flex gap-2">
                         <span className="bg-zinc-100 px-2 py-0.5 rounded text-zinc-600 flex items-center gap-1">
                           <Folder size={12} /> {ex.category}
                         </span>
                         <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded">
                           Unitat: {ex.defaultUnit}
                         </span>
                       </div>
                     </div>
                   </div>
                 ))
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

// --- COMPONENT ATLETES / CLIENTS ---
function ClientsView({ clients, savedWorkouts, saveClientToDB, deleteClientFromDB, customPRs, handleAddCustomPR, assignWorkoutToClient, removeWorkoutFromClient, clientToOpen }) {
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [workoutToAssign, setWorkoutToAssign] = useState('');
  const [newPRName, setNewPRName] = useState('');
  
  // Estat local per als inputs dels nous registres de PR
  const [prInputs, setPrInputs] = useState({});

  // Efecte per obrir un client automàticament des d'una notificació
  useEffect(() => {
    if (clientToOpen) {
      const c = clients.find(cl => cl.id === clientToOpen);
      if (c) {
        setSelectedClientId(c.id);
        setEditingClient({ ...c });
      }
    }
  }, [clientToOpen, clients]);

  const handleAddNewClient = () => {
    const newClient = {
      id: 'client_' + Date.now(),
      name: 'Nou Client',
      email: '',
      phone: '',
      prs: {},
      prReminders: {}, // Dates dels tests
      assignedWorkouts: []
    };
    setEditingClient(newClient);
    setSelectedClientId(newClient.id);
    setPrInputs({});
  };

  const handleSelectClient = (client) => {
    setSelectedClientId(client.id);
    setEditingClient({ ...client }); // Clonem per editar
    setPrInputs({});
  };

  const handleSave = async () => {
    if (editingClient) {
      await saveClientToDB(editingClient);
      alert('Perfil guardat correctament.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Estàs segur d'esborrar el perfil de ${editingClient.name}?`)) {
      await deleteClientFromDB(editingClient.id);
      setSelectedClientId(null);
      setEditingClient(null);
    }
  };

  const updatePrInput = (prName, field, value) => {
    setPrInputs(prev => ({
      ...prev,
      [prName]: { ...(prev[prName] || { date: todayString, value: '' }), [field]: value }
    }));
  };

  const handleAddPRRecord = (prName) => {
    const input = prInputs[prName];
    if (!input || !input.value.trim()) return;

    setEditingClient(prev => {
      const history = normalizePRHistory(prev.prs[prName]);
      history.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        date: input.date || todayString,
        value: input.value
      });
      // Ordenem de més antic a més nou
      history.sort((a, b) => a.date.localeCompare(b.date));

      return { ...prev, prs: { ...prev.prs, [prName]: history } };
    });

    // Netegem l'input d'aquest PR
    setPrInputs(prev => ({ ...prev, [prName]: { date: todayString, value: '' } }));
  };

  const handleDeletePRRecord = (prName, recordId) => {
    setEditingClient(prev => {
      const history = normalizePRHistory(prev.prs[prName]).filter(r => r.id !== recordId);
      return { ...prev, prs: { ...prev.prs, [prName]: history } };
    });
  };

  const updatePRReminder = (prName, dateValue) => {
    setEditingClient(prev => ({
      ...prev,
      prReminders: {
        ...(prev.prReminders || {}),
        [prName]: dateValue
      }
    }));
  };

  const handleAssignWorkout = () => {
    if (!workoutToAssign) return;
    assignWorkoutToClient(workoutToAssign, editingClient.id);
    setWorkoutToAssign('');
  };

  const handleRemoveAssignedWorkout = (idToRemove) => {
    removeWorkoutFromClient(idToRemove);
  };

  // Ordenar entrenaments pel desplegable (més recents primer)
  const sortedWorkouts = [...savedWorkouts].sort((a, b) => b.date.localeCompare(a.date));
  const clientWorkouts = savedWorkouts.filter(w => w.clientId === editingClient?.id);
  const allPRs = [...STANDARD_PRS, ...(customPRs || [])];

  // --- CÀLCUL DE L'EVOLUCIÓ DE LES MARQUES ---
  const extractNumber = (str) => {
    if (!str) return 0;
    const match = String(str).replace(',', '.').match(/[\d]+[.,]?[\d]*/);
    return match ? parseFloat(match[0]) : 0;
  };

  const prEvolutions = [];
  if (editingClient?.prs) {
    Object.entries(editingClient.prs).forEach(([prName, prData]) => {
      const history = normalizePRHistory(prData);
      // Necessitem almenys 2 registres per poder comparar
      if (history.length >= 2) {
        const prevRecord = history[history.length - 2];
        const currRecord = history[history.length - 1];
        
        const prevNum = extractNumber(prevRecord.value);
        const currNum = extractNumber(currRecord.value);
        
        if (prevNum > 0 && currNum > 0) {
          prEvolutions.push({
            name: prName,
            prev: prevNum,
            curr: currNum,
            prevLabel: prevRecord.value,
            currLabel: currRecord.value,
            improvement: (((currNum - prevNum) / prevNum) * 100).toFixed(1)
          });
        }
      }
    });
  }

  return (
    <div className="min-h-screen bg-zinc-100 font-sans text-zinc-900 flex flex-col md:flex-row">
      <div className="w-full md:w-80 bg-white border-r border-zinc-200 p-4 flex flex-col h-auto md:h-[calc(100vh-56px)] shrink-0">
         <button onClick={handleAddNewClient} className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white px-4 py-3 rounded-lg font-bold hover:bg-orange-500 transition-colors mb-6 shadow-sm">
            <UserPlus size={18} /> Nou Atleta
         </button>
         <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 px-2">Llista de Clients</h2>
         <div className="flex-1 overflow-y-auto space-y-2">
            {clients.length === 0 ? (
              <p className="text-sm text-zinc-500 px-2 italic">Cap client registrat.</p>
            ) : (
              clients.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleSelectClient(c)}
                  className={`w-full text-left px-4 py-3 rounded-xl flex flex-col transition-all border ${selectedClientId === c.id ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-white border-zinc-100 hover:border-orange-300'}`}
                >
                  <span className={`font-bold ${selectedClientId === c.id ? 'text-orange-900' : 'text-zinc-800'}`}>{c.name}</span>
                  {c.email && <span className="text-xs text-zinc-500">{c.email}</span>}
                </button>
              ))
            )}
         </div>
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-56px)]">
         {editingClient ? (
           <div className="max-w-4xl mx-auto space-y-6 pb-20">
              
              {/* HEADER PERFIL */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
                <div className="flex justify-between items-start mb-6 border-b border-zinc-100 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                      <Users size={32} />
                    </div>
                    <div>
                      <input type="text" value={editingClient.name} onChange={(e) => setEditingClient({...editingClient, name: e.target.value})} className="text-3xl font-black text-zinc-900 bg-transparent border-b-2 border-transparent focus:border-orange-500 outline-none w-full" placeholder="Nom de l'atleta" />
                      <p className="text-sm text-zinc-500 mt-1">Perfil de rendiment i entrenament</p>
                    </div>
                  </div>
                  <button onClick={handleDelete} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={20} /></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Correu Electrònic</label>
                    <input type="email" value={editingClient.email} onChange={(e) => setEditingClient({...editingClient, email: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-orange-500" placeholder="atleta@email.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Telèfon (Opcional)</label>
                    <input type="tel" value={editingClient.phone || ''} onChange={(e) => setEditingClient({...editingClient, phone: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-orange-500" placeholder="+34 600 000 000" />
                  </div>
                </div>
              </div>

              {/* MARQUES PERSONALS (AMB HISTORIAL) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
                <h3 className="text-lg font-bold text-zinc-800 mb-6 flex items-center gap-2"><Trophy className="text-yellow-500" /> Marques Personals (PRs / Benchmarks)</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                  {allPRs.map(pr => {
                    const history = normalizePRHistory(editingClient.prs[pr]);
                    const latestRecord = history.length > 0 ? history[history.length - 1] : null;
                    const inputData = prInputs[pr] || { date: todayString, value: '' };
                    
                    // Comprovar si el test està fora de termini o pendent
                    const reminderDate = editingClient.prReminders?.[pr];
                    let isDue = false;
                    
                    if (reminderDate && reminderDate <= getLocalISOString(new Date())) {
                      isDue = true;
                      // Si ja hi ha un test passat a o després de la data del recordatori, ho donem per validat (deixa de fer pampallugues)
                      if (latestRecord && latestRecord.date >= reminderDate) {
                        isDue = false;
                      }
                    }

                    return (
                      <div key={pr} className={`bg-zinc-50 p-4 rounded-xl border flex flex-col transition-colors shadow-sm hover:shadow ${isDue ? 'border-red-300 focus-within:border-red-500' : 'border-zinc-200 focus-within:border-orange-400'}`}>
                        <label className={`text-xs font-bold mb-4 truncate border-b pb-2 flex justify-between items-center ${isDue ? 'text-red-600 border-red-200' : 'text-zinc-700 border-zinc-200'}`}>
                          {pr}
                          {isDue && <Bell size={14} className="text-red-500 animate-pulse" />}
                        </label>
                        
                        {/* Darrer Registre Destacat */}
                        <div className="flex items-end justify-between mb-4">
                           <div>
                             <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider block mb-1">Darrer Registre</span>
                             <span className="text-3xl font-black text-zinc-900 leading-none">{latestRecord ? latestRecord.value : '--'}</span>
                           </div>
                           {history.length > 1 && (
                             <span className="text-xs font-bold text-zinc-400 bg-zinc-200 px-2 py-1 rounded">
                                {history.length} regs.
                             </span>
                           )}
                        </div>

                        {/* Formulari d'Ingrés de Dades - ARA RESPONSIVE */}
                        <div className="flex gap-2 mb-4 items-center">
                          <input 
                            type="date" 
                            value={inputData.date} 
                            onChange={(e) => updatePrInput(pr, 'date', e.target.value)} 
                            className="w-[100px] shrink-0 p-2 bg-white border border-zinc-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-500 transition-shadow" 
                          />
                          <input 
                            type="text" 
                            value={inputData.value} 
                            onChange={(e) => updatePrInput(pr, 'value', e.target.value)} 
                            placeholder="Nova marca..." 
                            className="min-w-0 flex-1 p-2 bg-white border border-zinc-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-500 transition-shadow" 
                          />
                          <button 
                            onClick={() => handleAddPRRecord(pr)} 
                            className="shrink-0 bg-zinc-900 text-white w-9 h-9 rounded-lg hover:bg-orange-500 transition-colors flex items-center justify-center"
                            title="Guardar aquest registre a l'historial"
                          >
                            <Plus size={16}/>
                          </button>
                        </div>

                        {/* Llista d'Historial */}
                        {history.length > 0 && (
                          <div className="space-y-1.5 mb-4 max-h-32 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                             {[...history].reverse().map(record => (
                                <div key={record.id} className="flex justify-between items-center text-xs bg-white p-2.5 rounded border border-zinc-100 shadow-sm hover:border-orange-200 transition-colors">
                                   <span className="text-zinc-500 font-medium">{record.date}</span>
                                   <span className="font-bold text-zinc-800 text-sm">{record.value}</span>
                                   <button onClick={() => handleDeletePRRecord(pr, record.id)} className="text-zinc-300 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                                </div>
                             ))}
                          </div>
                        )}

                        {/* Recordatori de Test */}
                        <div className="mt-auto pt-3 border-t border-zinc-200/80">
                          <label className={`text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1 ${isDue ? 'text-red-500' : 'text-zinc-400'}`}>
                            Proper Test (Programar)
                          </label>
                          <input 
                            type="date" 
                            value={reminderDate || ''} 
                            onChange={(e) => updatePRReminder(pr, e.target.value)} 
                            className={`w-full p-2 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 text-xs font-medium transition-all ${isDue ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-zinc-100/50 border border-zinc-200 text-zinc-600'}`} 
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* NOVA CATEGORIA DE PR */}
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 flex flex-col focus-within:border-orange-400 transition-colors justify-end gap-2 shadow-sm">
                    <label className="text-xs font-bold text-orange-800">Nova Categoria de PR</label>
                    <div className="flex gap-2 items-center">
                        <input 
                          type="text" 
                          value={newPRName} 
                          onChange={(e) => setNewPRName(e.target.value)} 
                          placeholder="Ex: 5K Row" 
                          className="min-w-0 flex-1 p-2 border border-orange-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 text-sm" 
                        />
                        <button onClick={() => { handleAddCustomPR(newPRName); setNewPRName(''); }} className="shrink-0 bg-orange-500 text-white w-9 h-9 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center">
                          <Plus size={16}/>
                        </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* DASHBOARD DE PROGRÉS I RETENCIÓ */}
              <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg border border-zinc-800 text-white">
                <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2"><Activity className="text-orange-500" /> Dashboard de Progrés</h3>
                  <button onClick={() => alert("Properament: Generador d'imatge PDF/PNG per enviar a l'atleta per WhatsApp!")} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                    <Share2 size={16} /> Compartir Informe
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
                    <div className="text-zinc-400 text-xs font-bold uppercase mb-1">Sessions Totals</div>
                    <div className="text-3xl font-black text-white">{clientWorkouts.length}</div>
                    <div className="text-xs text-zinc-500 mt-2">Dins de la plataforma</div>
                  </div>
                  <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
                    <div className="text-zinc-400 text-xs font-bold uppercase mb-1">Estat de l'Atleta</div>
                    <div className="text-3xl font-black text-orange-500 flex items-center gap-2"><Flame size={24}/> Actiu</div>
                    <div className="text-xs text-zinc-500 mt-2">Bona constància d'entrenament</div>
                  </div>
                  <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
                    <div className="text-zinc-400 text-xs font-bold uppercase mb-1">Rendiment (PRs)</div>
                    <div className="text-3xl font-black text-green-400 flex items-center gap-2"><TrendingUp size={24}/> ↑</div>
                    <div className="text-xs text-zinc-500 mt-2">Dades recollides i millorant</div>
                  </div>
                </div>

                {/* GRÀFICA D'EVOLUCIÓ BARRAS HORITZONTALS (LLEGEIX DE L'HISTORIAL) */}
                <div className="mt-8 border-t border-zinc-800 pt-6">
                  <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BarChart3 size={18} className="text-orange-500"/> Evolució Últim Test
                  </h4>
                  
                  {prEvolutions.length === 0 ? (
                    <p className="text-sm text-zinc-500 italic bg-zinc-800/30 p-4 rounded-xl border border-zinc-800 border-dashed text-center">
                      Afegeix almenys dos registres d'historial en una mateixa marca per generar la gràfica d'evolució automàticament.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {prEvolutions.map((evo, i) => {
                        const maxVal = Math.max(evo.prev, evo.curr);
                        const prevWidth = (evo.prev / maxVal) * 100;
                        const currWidth = (evo.curr / maxVal) * 100;
                        const isPositive = evo.curr >= evo.prev;

                        return (
                          <div key={i} className="bg-zinc-800/40 p-4 rounded-xl border border-zinc-700/50 hover:border-orange-500/30 transition-colors">
                            <div className="flex justify-between items-end mb-4">
                              <span className="font-bold text-sm text-zinc-200">{evo.name}</span>
                              <span className={`text-xs font-bold px-2 py-1 rounded-md ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {isPositive ? '+' : ''}{evo.improvement}%
                              </span>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-zinc-500 w-14 text-right tracking-wider">ANTERIOR</span>
                                <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-zinc-500 rounded-full transition-all duration-1000" style={{ width: `${prevWidth}%` }}></div>
                                </div>
                                <span className="text-xs font-bold text-zinc-400 w-12 text-right">{evo.prevLabel}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-orange-500 w-14 text-right tracking-wider">ACTUAL</span>
                                <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full transition-all duration-1000 ${isPositive ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${currWidth}%` }}></div>
                                </div>
                                <span className="text-xs font-bold text-white w-12 text-right">{evo.currLabel}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* ENTRENAMENTS ASSIGNATS */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
                <h3 className="text-lg font-bold text-zinc-800 mb-6 flex items-center gap-2"><CalendarDays className="text-orange-500" /> Entrenaments Assignats</h3>
                
                <div className="flex gap-3 mb-6">
                  <select value={workoutToAssign} onChange={(e) => setWorkoutToAssign(e.target.value)} className="flex-1 p-3 bg-zinc-50 border border-zinc-300 rounded-lg outline-none focus:border-orange-500 font-medium">
                    <option value="">Selecciona un entrenament del calendari...</option>
                    {sortedWorkouts.filter(w => w.clientId !== editingClient.id).map(w => (
                      <option key={w.id} value={w.id}>{w.date} - {w.sessionName}</option>
                    ))}
                  </select>
                  <button onClick={handleAssignWorkout} className="bg-zinc-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-500 transition-colors">Assignar</button>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
                  {clientWorkouts.length === 0 ? (
                    <p className="text-sm text-zinc-500 italic text-center py-6 bg-zinc-50 rounded-xl border border-zinc-200 border-dashed">No hi ha cap entrenament assignat a aquest atleta.</p>
                  ) : (
                    clientWorkouts.map(w => (
                      <div key={w.id} className="flex justify-between items-center bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                        <div>
                          <span className="text-xs font-bold bg-orange-200 text-orange-800 px-2 py-1 rounded mr-3">{w.date}</span>
                          <span className="font-bold text-zinc-800">{w.sessionName}</span>
                        </div>
                        <button onClick={() => handleRemoveAssignedWorkout(w.id)} className="text-zinc-400 hover:text-red-500 bg-white p-2 rounded-full shadow-sm"><X size={16}/></button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* BOTÓ DE GUARDAR FLOTANT */}
              <div className="fixed bottom-0 right-0 w-full md:w-[calc(100%-20rem)] p-4 bg-white/90 backdrop-blur-md border-t border-zinc-200 flex justify-center z-10">
                 <button onClick={handleSave} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-3 rounded-full font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all">
                   <Save size={20} /> Guardar Perfil de l'Atleta
                 </button>
              </div>
           </div>
         ) : (
           <div className="h-full flex flex-col items-center justify-center text-zinc-400">
             <Users size={64} className="mb-4 opacity-20" />
             <p className="text-xl font-medium">Selecciona un client de la llista o crea'n un de nou.</p>
           </div>
         )}
      </div>
    </div>
  );
}

// --- APP PRINCIPAL ---
export default function ModumCoachApp() {
  const [user, setUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [currentView, setCurrentView] = useState('calendar');
  const [workout, setWorkout] = useState({...emptyWorkoutTemplate, id: Date.now().toString()});
  
  // Dades al núvol (Cloud State)
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [clients, setClients] = useState([]); // Estat pels clients
  const [customPRs, setCustomPRs] = useState([]); // Nou Estat pels PRs personalitzats

  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarMode, setCalendarMode] = useState('month'); 
  
  // Estats Exportació CSV
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStart, setExportStart] = useState(todayString);
  const [exportEnd, setExportEnd] = useState(todayString);

  // Estats Duplicar
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [dupFrequency, setDupFrequency] = useState(1);
  const [dupPeriod, setDupPeriod] = useState('days'); 
  const [dupStartDate, setDupStartDate] = useState(todayString);
  const [dupEndDate, setDupEndDate] = useState(todayString);
  const [workoutToDuplicate, setWorkoutToDuplicate] = useState(null);

  // Estats Esborrar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);
  const [deleteSeriesToo, setDeleteSeriesToo] = useState(false);

  // Nou Estat: Pantalla TV (Llista d'entrenaments seleccionats, màxim 2)
  const [tvWorkouts, setTvWorkouts] = useState([]);

  // Nou Estat: Cerca d'atletes al Creador
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [showClientSearch, setShowClientSearch] = useState(false);

  // Estats per les Notificacions
  const [showNotifications, setShowNotifications] = useState(false);
  const [clientToOpen, setClientToOpen] = useState(null);

  // --- FIREBASE AUTHENTICATION ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // --- FIREBASE FIRESTORE SYNC ---
  useEffect(() => {
    if (!user) return;

    const unsubWorkouts = onSnapshot(collection(db, 'workouts'), (snapshot) => {
      setSavedWorkouts(snapshot.docs.map(doc => doc.data()));
    });

    const unsubLibrary = onSnapshot(collection(db, 'library'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      if (data.length === 0) {
        initialExerciseLibrary.forEach(ex => setDoc(doc(db, 'library', ex.id), ex));
        setExerciseLibrary(initialExerciseLibrary);
      } else {
        setExerciseLibrary(data);
      }
    });

    const unsubClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
      setClients(snapshot.docs.map(doc => doc.data()));
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().customPRs) {
        setCustomPRs(docSnap.data().customPRs);
      }
    });

    return () => { unsubWorkouts(); unsubLibrary(); unsubClients(); unsubSettings(); };
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (error) {
      setLoginError('Correu o contrasenya incorrectes. Revisa les teves credencials.');
    }
  };

  const handleLogout = () => signOut(auth);

  // --- CLOUD CRUD OPERATIONS ---
  const saveWorkoutToDB = async () => {
    try {
      await setDoc(doc(db, 'workouts', workout.id), workout);
      alert('Entrenament guardat correctament al Cloud!');
      setCurrentView('calendar');
    } catch (e) {
      alert("Error guardant l'entrenament: " + e.message);
    }
  };

  const saveExerciseToDB = async (newEx) => {
    await setDoc(doc(db, 'library', newEx.id), newEx);
  };

  const saveClientToDB = async (clientData) => {
    await setDoc(doc(db, 'clients', clientData.id), clientData);
  };

  const deleteClientFromDB = async (clientId) => {
    await deleteDoc(doc(db, 'clients', clientId));
  };

  const handleAddCustomPR = async (newPRName) => {
    const trimmed = newPRName.trim();
    if (!trimmed || customPRs.includes(trimmed) || STANDARD_PRS.includes(trimmed)) return;
    try {
      await setDoc(doc(db, 'settings', 'global'), { customPRs: [...customPRs, trimmed] }, { merge: true });
    } catch (error) {
      console.error("Error saving custom PR:", error);
    }
  };

  const assignWorkoutToClient = async (workoutId, clientId) => {
    const w = savedWorkouts.find(x => x.id === workoutId);
    if(w) await setDoc(doc(db, 'workouts', w.id), { ...w, clientId: clientId });
  };

  const removeWorkoutFromClient = async (workoutId) => {
    const w = savedWorkouts.find(x => x.id === workoutId);
    if(w) await setDoc(doc(db, 'workouts', w.id), { ...w, clientId: '' });
  };

  // Lògica per afegir/treure entrenaments de la cua de la TV
  const toggleTVWorkout = (w) => {
    const isAlreadySelected = tvWorkouts.find(tvW => tvW.id === w.id);
    if (isAlreadySelected) {
      setTvWorkouts(tvWorkouts.filter(tvW => tvW.id !== w.id));
    } else {
      if (tvWorkouts.length >= 2) {
        alert("Atenció: Només pots enviar un màxim de 2 entrenaments a la vegada a la Pantalla TV per dividir-la en dues columnes.");
        return;
      }
      setTvWorkouts([...tvWorkouts, w]);
    }
  };

  // --- GENERADOR DE NOTIFICACIONS ---
  const getDueReminders = () => {
    let due = [];
    const todayStr = getLocalISOString(new Date());
    
    // Per avisar fins a 7 dies abans
    const warningDateObj = new Date();
    warningDateObj.setDate(warningDateObj.getDate() + 7);
    const warningStr = getLocalISOString(warningDateObj);

    clients.forEach(client => {
      if (client.prReminders) {
        Object.entries(client.prReminders).forEach(([pr, dateStr]) => {
          if (dateStr && dateStr <= warningStr) {
            
            // Comprovem si l'usuari JA HA PASSAT aquest test (o un de posterior) a l'historial
            const history = normalizePRHistory(client.prs?.[pr]);
            const latestRecord = history.length > 0 ? history[history.length - 1] : null;
            
            // Només mostrem la notificació si NO hi ha un registre, o si l'últim registre és anterior a la data programada
            if (!latestRecord || latestRecord.date < dateStr) {
              due.push({
                clientId: client.id,
                clientName: client.name,
                pr: pr,
                date: dateStr,
                isOverdue: dateStr < todayStr,
                isToday: dateStr === todayStr
              });
            }
          }
        });
      }
    });
    // Ordenem de més antic (més urgent) a més nou
    return due.sort((a, b) => a.date.localeCompare(b.date));
  };
  
  const notificationsList = getDueReminders();

  // La resta de funcions crud...
  const handleConfirmDuplicate = async () => { /* Igual que abans */ 
    if (!workoutToDuplicate) return;
    try {
      const start = new Date(dupStartDate);
      const end = new Date(dupEndDate);
      const newSeriesId = workoutToDuplicate.seriesId || 'series_' + Date.now();
      const batch = writeBatch(db);
      let current = new Date(start);
      while (current <= end) {
        const duplicated = JSON.parse(JSON.stringify(workoutToDuplicate));
        duplicated.id = 'dup_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        duplicated.date = getLocalISOString(current);
        duplicated.seriesId = newSeriesId;
        batch.set(doc(db, 'workouts', duplicated.id), duplicated);
        if (dupPeriod === 'days') current.setDate(current.getDate() + parseInt(dupFrequency));
        else if (dupPeriod === 'weeks') current.setDate(current.getDate() + (parseInt(dupFrequency) * 7));
        else if (dupPeriod === 'months') current.setMonth(current.getMonth() + parseInt(dupFrequency));
      }
      await batch.commit();
      setShowDuplicateModal(false);
      setWorkoutToDuplicate(null);
    } catch (e) { alert("Error duplicant al Cloud: " + e.message); }
  };

  const handleDeleteClick = (w) => {
    setWorkoutToDelete(w);
    setDeleteSeriesToo(false);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!workoutToDelete) return;
    try {
      if (deleteSeriesToo && workoutToDelete.seriesId) {
        const toDelete = savedWorkouts.filter(w => w.seriesId === workoutToDelete.seriesId);
        const batch = writeBatch(db);
        toDelete.forEach(w => batch.delete(doc(db, 'workouts', w.id)));
        await batch.commit();
      } else {
        await deleteDoc(doc(db, 'workouts', workoutToDelete.id));
      }
      setShowDeleteModal(false);
      setWorkoutToDelete(null);
    } catch (e) { alert("Error esborrant: " + e.message); }
  };

  const handleExportCSV = () => { /* Export CSV logic same as before */ 
    const filteredWorkouts = savedWorkouts.filter(w => w.date >= exportStart && w.date <= exportEnd);
    if (filteredWorkouts.length === 0) { alert("No hi ha entrenaments guardats en aquest rang de dates."); return; }
    const escapeCsv = (str) => { if (str === null || str === undefined) return '""'; return '"' + String(str).replace(/"/g, '""') + '"'; };
    let csvContent = "Data,Etiqueta,Nom Sessió,Bloc,Apartat,Exercici,Sèries,Quantitat,Unitat,Notes Exercici,Notes Pantalla TV\n";
    filteredWorkouts.sort((a, b) => a.date.localeCompare(b.date)).forEach(w => {
      const blocks = [{ key: 'warmup', label: 'ESCALFAMENT' }, { key: 'wod', label: 'WOD' }, { key: 'accessories', label: 'COMPLEMENTS' }];
      blocks.forEach(block => {
        if (!w.blocks[block.key] || w.blocks[block.key].length === 0) return;
        w.blocks[block.key].forEach(sub => {
          if (sub.exercises.length === 0) {
             csvContent += `${escapeCsv(w.date)},${escapeCsv(w.tag || '')},${escapeCsv(w.sessionName)},${escapeCsv(block.label)},${escapeCsv(sub.title)},"","","","","",${escapeCsv(w.bottomNotes)}\n`;
          } else {
             sub.exercises.forEach(ex => {
                csvContent += `${escapeCsv(w.date)},${escapeCsv(w.tag || '')},${escapeCsv(w.sessionName)},${escapeCsv(block.label)},${escapeCsv(sub.title)},${escapeCsv(ex.exerciseName)},${ex.sets || ''},${ex.reps || ''},${escapeCsv(ex.unit)},${escapeCsv(ex.notes)},${escapeCsv(w.bottomNotes)}\n`;
             });
          }
        });
      });
    });
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.setAttribute('href', url); link.setAttribute('download', `Modum_Entrenaments_${exportStart}_a_${exportEnd}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link); setShowExportModal(false);
  };

  // --- GENERADOR DE PDF (Nou) ---
  const generateWorkoutPDF = (workoutData) => {
    const printWindow = window.open('', '_blank');
    const [y, m, d] = workoutData.date.split('-');
    const formattedDate = `${d}/${m}/${y}`;
    const logoSVG = `<svg viewBox="0 0 100 100" width="32" height="32" xmlns="http://www.w3.org/2000/svg"><g fill="#C47A5A" transform="rotate(22 50 50) translate(-6, 0)"><rect x="16" y="28" width="16" height="56" rx="8" /><rect x="40" y="8" width="16" height="84" rx="8" /><rect x="64" y="36" width="16" height="42" rx="8" /><circle cx="94" cy="68" r="8" /></g></svg>`;

    const buildBlockHtml = (title, block) => {
      if (!block || block.length === 0) return '';
      let html = `<div class="mb-8"><h2 class="text-xl font-black text-zinc-800 uppercase border-b-2 border-orange-500 pb-2 mb-4">${title}</h2>`;
      block.forEach(sub => {
        html += `<div class="mb-4 bg-zinc-50 rounded-lg p-4 border border-zinc-100"><h3 class="text-lg font-bold text-zinc-900 mb-3 flex items-center gap-2"><div class="w-2 h-2 bg-orange-500 rounded-full"></div>${sub.title}</h3><ul class="space-y-2">`;
        sub.exercises.forEach(ex => {
          const qty = ex.sets > 1 ? `${ex.sets}x ${ex.reps}` : `${ex.reps}`;
          const unit = ex.unit !== 'reps' ? ex.unit : '';
          const notes = ex.notes ? `<span class="text-zinc-500 text-sm ml-2 block sm:inline">(${ex.notes})</span>` : '';
          html += `<li class="flex items-baseline"><div class="font-black text-orange-600 w-24 shrink-0">${qty} ${unit}</div><div class="font-bold text-zinc-800">${ex.exerciseName || 'SENSE NOM'} ${notes}</div></li>`;
        });
        html += `</ul></div>`;
      });
      html += `</div>`;
      return html;
    };

    const clientNameStr = workoutData.clientId 
      ? `<div class="text-sm font-bold text-zinc-400 uppercase mt-2">Atleta: <span class="text-zinc-800">${clients.find(c => c.id === workoutData.clientId)?.name || ''}</span></div>` 
      : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Modum Coach - ${workoutData.sessionName}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              @page { margin: 1.5cm; }
            }
            body { font-family: 'Inter', system-ui, sans-serif; }
          </style>
        </head>
        <body class="bg-white p-8 max-w-4xl mx-auto">
           <!-- Header -->
           <div class="flex justify-between items-center border-b-4 border-zinc-900 pb-6 mb-8">
             <div class="flex items-center gap-4">
               ${logoSVG}
               <div>
                 <h1 class="text-2xl font-black tracking-widest text-zinc-900 leading-none">MODUM COACH</h1>
                 <p class="text-sm font-bold text-zinc-500 uppercase mt-1">Entrenament Personalitzat</p>
               </div>
             </div>
             <div class="text-right">
               <div class="text-sm font-bold text-zinc-400 uppercase">Data de Sessió</div>
               <div class="text-lg font-black text-zinc-800">${formattedDate}</div>
             </div>
           </div>

           <!-- Títol de la Sessió -->
           <div class="mb-10 text-center bg-zinc-900 text-white py-6 rounded-2xl">
             <span class="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">${workoutData.tag || 'WOD'}</span>
             <h1 class="text-4xl font-black uppercase tracking-tight">${workoutData.sessionName}</h1>
             ${clientNameStr}
           </div>

           <!-- Blocs -->
           ${buildBlockHtml('Escalfament', workoutData.blocks.warmup)}
           ${buildBlockHtml('WOD (Part Principal)', workoutData.blocks.wod)}
           ${buildBlockHtml('Complements', workoutData.blocks.accessories)}

           <!-- Notes Inferiors -->
           ${workoutData.bottomNotes ? `
             <div class="mt-8 bg-orange-50 border border-orange-200 p-5 rounded-xl">
               <h4 class="text-sm font-bold text-orange-800 uppercase mb-2 flex items-center gap-2">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-500"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                 Notes de l'Entrenador
               </h4>
               <p class="text-zinc-700 font-medium">${workoutData.bottomNotes}</p>
             </div>
           ` : ''}

           <!-- Footer -->
           <div class="mt-12 pt-6 border-t border-zinc-200 text-center text-zinc-400 text-xs font-medium">
             Generat automàticament des de la plataforma Modum Coach
           </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Deixem 1 segon de marge perquè Tailwind carregui els estils abans d'obrir el diàleg d'imprimir
    setTimeout(() => {
      printWindow.print();
    }, 1000);
  };

  // GESTIÓ ENTRENADOR (Inputs Locals)
  const handleWorkoutChange = (field, value) => setWorkout(prev => ({ ...prev, [field]: value }));
  const addSubSection = (blockKey) => { const newSub = { id: Date.now().toString(), title: 'Nou Apartat', exercises: [] }; setWorkout(prev => ({ ...prev, blocks: { ...prev.blocks, [blockKey]: [...prev.blocks[blockKey], newSub] } })); };
  const updateSubSectionTitle = (blockKey, subId, newTitle) => { setWorkout(prev => ({ ...prev, blocks: { ...prev.blocks, [blockKey]: prev.blocks[blockKey].map(sub => sub.id === subId ? { ...sub, title: newTitle } : sub) } })); };
  const removeSubSection = (blockKey, subId) => { setWorkout(prev => ({ ...prev, blocks: { ...prev.blocks, [blockKey]: prev.blocks[blockKey].filter(sub => sub.id !== subId) } })); };
  const addExercise = (blockKey, subId) => { const newEx = { id: Date.now().toString(), exerciseName: '', sets: 1, reps: 10, unit: 'reps', notes: '' }; setWorkout(prev => ({ ...prev, blocks: { ...prev.blocks, [blockKey]: prev.blocks[blockKey].map(sub => sub.id === subId ? { ...sub, exercises: [...sub.exercises, newEx] } : sub) } })); };
  const updateExercise = (blockKey, subId, exId, field, value) => { setWorkout(prev => ({ ...prev, blocks: { ...prev.blocks, [blockKey]: prev.blocks[blockKey].map(sub => sub.id === subId ? { ...sub, exercises: sub.exercises.map(ex => ex.id === exId ? { ...ex, [field]: value } : ex) } : sub) } })); };
  const removeExercise = (blockKey, subId, exId) => { setWorkout(prev => ({ ...prev, blocks: { ...prev.blocks, [blockKey]: prev.blocks[blockKey].map(sub => sub.id === subId ? { ...sub, exercises: sub.exercises.filter(ex => ex.id !== exId) } : sub) } })); };
  const createWorkoutForDate = (dateStr) => { setWorkout({ ...emptyWorkoutTemplate, id: Date.now().toString(), date: dateStr }); setCurrentView('coach'); };

  // LÒGICA CALENDARI
  const getWorkoutsForDate = (dateStr) => savedWorkouts.filter(w => w.date === dateStr);
  const goToPrev = () => { const newDate = new Date(calendarDate); if (calendarMode === 'month') newDate.setMonth(newDate.getMonth() - 1); else if (calendarMode === 'week') newDate.setDate(newDate.getDate() - 7); else newDate.setDate(newDate.getDate() - 1); setCalendarDate(newDate); };
  const goToNext = () => { const newDate = new Date(calendarDate); if (calendarMode === 'month') newDate.setMonth(newDate.getMonth() + 1); else if (calendarMode === 'week') newDate.setDate(newDate.getDate() + 7); else newDate.setDate(newDate.getDate() + 1); setCalendarDate(newDate); };
  const handleDayClick = (dateStr) => { const [y, m, d] = dateStr.split('-'); setCalendarDate(new Date(y, m - 1, d)); setCalendarMode('day'); };


  // --- COMPONENT VISTA CALENDARI ---
  const renderCalendarView = () => {
    const formatterMonthYear = new Intl.DateTimeFormat('ca-ES', { month: 'long', year: 'numeric' });
    const formatterDayMonth = new Intl.DateTimeFormat('ca-ES', { day: 'numeric', month: 'long', weekday: 'long' });
    
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const daysOfWeek = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];

    const firstDayOfMonth = new Date(year, month, 1);
    let startingDay = firstDayOfMonth.getDay() - 1; 
    if (startingDay === -1) startingDay = 6; 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthBlanks = Array.from({ length: startingDay }, (_, i) => i);
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const currentDayOfWeek = calendarDate.getDay() === 0 ? 6 : calendarDate.getDay() - 1;
    const startOfWeek = new Date(calendarDate); startOfWeek.setDate(calendarDate.getDate() - currentDayOfWeek);
    const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(startOfWeek); d.setDate(startOfWeek.getDate() + i); return d; });

    const renderMonthGrid = () => (
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="grid grid-cols-7 bg-zinc-50 border-b border-zinc-200">
          {daysOfWeek.map(d => <div key={d} className="py-3 text-center text-sm font-bold text-zinc-500 uppercase">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 auto-rows-fr">
          {monthBlanks.map(b => <div key={`blank-${b}`} className="min-h-[100px] bg-zinc-50 border-b border-r border-zinc-100"></div>)}
          {monthDays.map(d => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayWorkouts = getWorkoutsForDate(dateStr);
            const isToday = dateStr === todayString;

            return (
              <div key={dateStr} onClick={() => handleDayClick(dateStr)} className={`min-h-[100px] p-2 border-b border-r border-zinc-100 hover:bg-orange-50 cursor-pointer transition-colors relative ${isToday ? 'bg-orange-50/30' : 'bg-white'}`}>
                <div className={`text-sm font-semibold mb-1 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-orange-500 text-white' : 'text-zinc-700'}`}>{d}</div>
                <div className="space-y-1">
                  {dayWorkouts.map(w => (
                    <div key={w.id} className={`text-xs font-bold px-2 py-1 rounded truncate border ${getTagColor(w.tag)}`}>{w.sessionName}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );

    const renderWeekGrid = () => (
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="grid grid-cols-7 bg-zinc-50 border-b border-zinc-200">
          {weekDays.map((d, i) => <div key={i} className="py-3 text-center text-sm font-bold text-zinc-500 uppercase">{daysOfWeek[i]} {d.getDate()}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {weekDays.map((d, i) => {
            const dateStr = getLocalISOString(d);
            const dayWorkouts = getWorkoutsForDate(dateStr);
            const isToday = dateStr === todayString;
            return (
              <div key={dateStr} onClick={() => handleDayClick(dateStr)} className={`min-h-[400px] p-3 border-r border-zinc-100 hover:bg-orange-50 cursor-pointer ${isToday ? 'bg-orange-50/30' : 'bg-white'}`}>
                <div className="space-y-3">
                  {dayWorkouts.length === 0 && <div className="text-zinc-400 text-xs text-center mt-4">Sense sessions</div>}
                  {dayWorkouts.map(w => (
                    <div key={w.id} className={`p-3 border rounded-lg shadow-sm ${getTagColor(w.tag)}`}>
                      <div className="font-bold text-sm mb-1">{w.sessionName}</div>
                      <div className="text-xs opacity-75">{w.blocks.warmup.length + w.blocks.wod.length} blocs</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );

    const renderDayView = () => {
      const dateStr = getLocalISOString(calendarDate);
      const dayWorkouts = getWorkoutsForDate(dateStr);

      return (
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setCalendarMode('month')} className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-orange-500 font-medium transition-colors">
            <ChevronLeft size={20} /> Tornar al calendari mensual
          </button>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <h2 className="text-2xl font-bold text-zinc-800 capitalize mb-6 pb-4 border-b border-zinc-100 flex items-center justify-between">
              <span>{formatterDayMonth.format(calendarDate)}</span>
              <button onClick={() => createWorkoutForDate(dateStr)} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600">
                <Plus size={16} /> Crear Nou Entrenament
              </button>
            </h2>

            {dayWorkouts.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                <CalendarDays size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg">No hi ha entrenaments programats per aquest dia.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {dayWorkouts.map(w => {
                  const isSelectedForTV = tvWorkouts.find(tvW => tvW.id === w.id);
                  return (
                    <div key={w.id} className={`border rounded-xl p-5 transition-colors ${isSelectedForTV ? 'border-orange-500 bg-orange-50/20' : 'border-zinc-200 bg-zinc-50'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded border uppercase ${getTagColor(w.tag)}`}>{WORKOUT_TAGS.find(t => t.id === w.tag)?.label || w.tag || 'Sessió'}</span>
                          </div>
                          <h3 className="text-xl font-black text-zinc-900 uppercase tracking-wide">{w.sessionName}</h3>
                          <p className="text-sm text-zinc-500">{w.blocks.warmup.length} blocs d'escalfament, {w.blocks.wod.length} WODs</p>
                        </div>
                        <div className="flex gap-2 flex-wrap justify-end items-start">
                          
                          <button onClick={() => handleDeleteClick(w)} className="p-2 text-red-500 bg-white border border-red-100 rounded-lg hover:bg-red-500 hover:text-white transition-colors mr-2">
                            <Trash2 size={18} />
                          </button>

                          {/* NOU BOTÓ PDF */}
                          <button onClick={() => generateWorkoutPDF(w)} className="px-3 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-100 flex items-center gap-1">
                            <FileText size={16} /> PDF
                          </button>

                          <button onClick={() => { setWorkoutToDuplicate(w); setDupStartDate(w.date); setDupEndDate(w.date); setShowDuplicateModal(true); }} className="px-3 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-100 flex items-center gap-1">
                            <Copy size={16} /> Duplicar
                          </button>
                          
                          <button onClick={() => { setWorkout(w); setCurrentView('coach'); }} className="px-3 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800">
                            Editar Sessió
                          </button>
                          
                          {/* BOTÓ SELECCIÓ TV MODIFICAT */}
                          <button 
                            onClick={() => toggleTVWorkout(w)} 
                            className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${isSelectedForTV ? 'bg-orange-500 text-white shadow-md' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
                          >
                            <MonitorPlay size={16} /> {isSelectedForTV ? 'A la cua de la TV' : 'Enviar a TV'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-zinc-100 p-4 md:p-8 font-sans text-zinc-900 pb-24 relative">
        {/* Modals d'exportació, duplicació i eliminació exactament iguals que abans */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2"><FileSpreadsheet className="text-orange-500" /> Exportar a Excel</h3>
                <button onClick={() => setShowExportModal(false)} className="text-zinc-400 hover:text-zinc-800"><X size={24} /></button>
              </div>
              <div className="space-y-4 mb-8">
                <div><label className="block text-sm font-semibold text-zinc-700 mb-1">Data d'Inici</label><input type="date" value={exportStart} onChange={(e) => setExportStart(e.target.value)} className="w-full p-3 border rounded-lg outline-none" /></div>
                <div><label className="block text-sm font-semibold text-zinc-700 mb-1">Data Final</label><input type="date" value={exportEnd} onChange={(e) => setExportEnd(e.target.value)} className="w-full p-3 border rounded-lg outline-none" /></div>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowExportModal(false)} className="px-5 py-2.5 rounded-lg text-zinc-600 hover:bg-zinc-100">Cancel·lar</button>
                <button onClick={handleExportCSV} className="px-5 py-2.5 rounded-lg font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md flex items-center gap-2"><Download size={18} /> Descarregar</button>
              </div>
            </div>
          </div>
        )}

        {showDuplicateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-zinc-900">Duplicar</h3>
                <button onClick={() => setShowDuplicateModal(false)} className="text-zinc-400 hover:text-zinc-800"><X size={24} /></button>
              </div>
              <p className="text-sm text-zinc-500 mb-6 pb-4 border-b">Quin tipus de duplicat vols realitzar per <strong>{workoutToDuplicate?.sessionName}</strong>?</p>
              
              <div className="space-y-5 mb-8">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Duplicar cada*</label>
                     <input type="number" min="1" value={dupFrequency} onChange={(e) => setDupFrequency(e.target.value)} className="w-full p-3 border border-orange-500/50 rounded-lg outline-none focus:border-orange-500 font-medium" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Periodicitat</label>
                     <select value={dupPeriod} onChange={(e) => setDupPeriod(e.target.value)} className="w-full p-3 border border-zinc-300 rounded-lg outline-none focus:border-orange-500 font-medium bg-white">
                        <option value="days">Dia/s</option>
                        <option value="weeks">Setmana/es</option>
                        <option value="months">Mes/os</option>
                     </select>
                   </div>
                </div>

                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                  <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">Rang de dates*</label>
                  <div className="grid grid-cols-2 gap-3">
                     <div>
                       <span className="text-xs text-zinc-400">Inici</span>
                       <input type="date" value={dupStartDate} onChange={(e) => setDupStartDate(e.target.value)} className="w-full p-2 border border-zinc-300 rounded outline-none text-sm" />
                     </div>
                     <div>
                       <span className="text-xs text-zinc-400">Fi</span>
                       <input type="date" value={dupEndDate} onChange={(e) => setDupEndDate(e.target.value)} className="w-full p-2 border border-zinc-300 rounded outline-none text-sm" />
                     </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button onClick={() => setShowDuplicateModal(false)} className="px-5 py-2.5 rounded-lg font-medium text-white bg-zinc-400 hover:bg-zinc-500 transition-colors">Cancel·lar</button>
                <button onClick={handleConfirmDuplicate} className="px-8 py-2.5 rounded-lg font-bold text-white bg-red-400 hover:bg-red-500 shadow-md transition-colors">Guardar</button>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-in fade-in zoom-in duration-200">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4"><Trash2 size={32} /></div>
                <h3 className="text-xl font-bold text-zinc-900">Eliminar Entrenament</h3>
                <p className="text-sm text-zinc-500 mt-2">Estàs segur que vols eliminar la sessió <strong>{workoutToDelete?.sessionName}</strong>?</p>
              </div>
              {workoutToDelete?.seriesId && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-6 flex items-start gap-3">
                   <input type="checkbox" id="deleteSeries" checked={deleteSeriesToo} onChange={(e) => setDeleteSeriesToo(e.target.checked)} className="mt-1 w-4 h-4 text-orange-500 rounded border-orange-300 focus:ring-orange-500" />
                   <label htmlFor="deleteSeries" className="text-sm text-orange-900 font-medium cursor-pointer">
                     Aquest entrenament forma part d'una sèrie repetida. <br/><span className="font-bold">Eliminar tots els entrenaments d'aquesta sèrie?</span>
                   </label>
                </div>
              )}
              <div className="flex gap-3 justify-center w-full">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-5 py-2.5 rounded-lg font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors">Cancel·lar</button>
                <button onClick={handleConfirmDelete} className="flex-1 px-5 py-2.5 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 shadow-md transition-colors">Eliminar</button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm border border-zinc-200">
            <div className="flex items-center gap-4">
              <div className="flex bg-zinc-100 rounded-lg p-1 border border-zinc-200">
                <button onClick={goToPrev} className="p-2 hover:bg-white rounded hover:shadow-sm transition-all"><ChevronLeft size={20}/></button>
                <button onClick={() => setCalendarDate(new Date())} className="px-4 py-2 font-bold text-sm text-zinc-700 hover:bg-white rounded hover:shadow-sm transition-all">Avui</button>
                <button onClick={goToNext} className="p-2 hover:bg-white rounded hover:shadow-sm transition-all"><ChevronRight size={20}/></button>
              </div>
              <h1 className="text-2xl font-bold text-zinc-800 capitalize min-w-[200px]">
                {calendarMode === 'day' ? formatterDayMonth.format(calendarDate) : formatterMonthYear.format(calendarDate)}
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setShowExportModal(true)} className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg font-medium hover:bg-green-100">
                <Download size={16} /> Exportar Dades
              </button>
              <div className="flex bg-zinc-100 rounded-lg p-1 border border-zinc-200">
                <button onClick={() => setCalendarMode('month')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${calendarMode === 'month' ? 'bg-white shadow-sm text-orange-600' : 'text-zinc-500 hover:text-zinc-800'}`}>Mensual</button>
                <button onClick={() => setCalendarMode('week')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${calendarMode === 'week' ? 'bg-white shadow-sm text-orange-600' : 'text-zinc-500 hover:text-zinc-800'}`}>Setmanal</button>
                <button onClick={() => setCalendarMode('day')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${calendarMode === 'day' ? 'bg-white shadow-sm text-orange-600' : 'text-zinc-500 hover:text-zinc-800'}`}>Diari</button>
              </div>
            </div>
          </div>

          {calendarMode === 'month' && renderMonthGrid()}
          {calendarMode === 'week' && renderWeekGrid()}
          {calendarMode === 'day' && renderDayView()}
        </div>
      </div>
    );
  };

  const renderCoachView = () => (
    <div className="min-h-full bg-zinc-100 font-sans text-zinc-900 flex flex-col relative">
      <datalist id="library-exercises">
        {exerciseLibrary.map(ex => <option key={ex.id} value={ex.name}>{ex.category}</option>)}
      </datalist>

      <div className="max-w-3xl mx-auto space-y-6 w-full p-4 md:p-8 flex-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 relative z-20">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 rounded-l-xl"></div>
          <div className="flex justify-between items-center mb-4 border-b border-zinc-100 pb-4">
             <h1 className="text-2xl font-bold text-zinc-800 flex items-center gap-2"><Smartphone className="text-orange-500" /> Edició d'Entrenament</h1>
            <button onClick={() => setCurrentView('calendar')} className="text-sm font-medium text-zinc-500 hover:text-orange-600 flex items-center gap-1"><ChevronLeft size={16} /> Tornar al Calendari</button>
          </div>
         
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-600 mb-1">Data</label>
              <input type="date" value={workout.date} onChange={(e) => handleWorkoutChange('date', e.target.value)} className="w-full p-2 border border-zinc-300 rounded focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-600 mb-1">Tipus / Etiqueta</label>
              <select value={workout.tag || 'WOD'} onChange={(e) => handleWorkoutChange('tag', e.target.value)} className="w-full p-2 border border-zinc-300 rounded focus:ring-2 focus:ring-orange-500 outline-none bg-white">
                {WORKOUT_TAGS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-zinc-600 mb-1">Atleta (Opcional)</label>
              <input 
                type="text" 
                value={showClientSearch ? clientSearchTerm : (clients.find(c => c.id === workout.clientId)?.name || '')}
                placeholder="Escriu per cercar..."
                onFocus={() => { setClientSearchTerm(''); setShowClientSearch(true); }}
                onChange={(e) => setClientSearchTerm(e.target.value)}
                onBlur={() => setShowClientSearch(false)}
                className="w-full p-2 border border-zinc-300 rounded focus:ring-2 focus:ring-orange-500 outline-none bg-white" 
              />
              {showClientSearch && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                  <div 
                    onMouseDown={(e) => { e.preventDefault(); handleWorkoutChange('clientId', ''); setShowClientSearch(false); }} 
                    className="p-3 hover:bg-orange-50 cursor-pointer text-sm text-zinc-500 italic border-b border-zinc-100"
                  >
                    Sessió General (Cap)
                  </div>
                  {clients.filter(c => c.name.toLowerCase().includes(clientSearchTerm.toLowerCase())).map(c => (
                    <div 
                      key={c.id} 
                      onMouseDown={(e) => { e.preventDefault(); handleWorkoutChange('clientId', c.id); setShowClientSearch(false); }} 
                      className="p-3 hover:bg-orange-50 cursor-pointer text-sm font-bold text-zinc-800 border-b border-zinc-50 last:border-0"
                    >
                      {c.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-600 mb-1">Nom de la Sessió</label>
              <input type="text" value={workout.sessionName} onChange={(e) => handleWorkoutChange('sessionName', e.target.value)} className="w-full p-2 border border-zinc-300 rounded focus:ring-2 focus:ring-orange-500 outline-none uppercase font-bold" />
            </div>
          </div>
        </div>

        {['warmup', 'wod', 'accessories'].map((blockKey) => {
          const blockNames = { warmup: 'ESCALFAMENT', wod: 'WOD (Part Principal)', accessories: 'COMPLEMENTS' };
          return (
            <div key={blockKey} className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
              <div className="flex justify-between items-center mb-4 border-b border-zinc-100 pb-2">
                <h2 className="text-xl font-bold text-zinc-800 uppercase">{blockNames[blockKey]}</h2>
                <button onClick={() => addSubSection(blockKey)} className="flex items-center gap-1 text-sm bg-zinc-800 text-white px-3 py-1.5 rounded hover:bg-orange-500 transition-colors"><Plus size={16} /> Afegir Sub-apartat</button>
              </div>

              {workout.blocks[blockKey].length === 0 && <p className="text-zinc-400 italic text-sm">Cap apartat creat encara.</p>}

              <div className="space-y-6">
                {workout.blocks[blockKey].map((sub, subIndex) => (
                  <div key={sub.id} className="border border-zinc-200 rounded-lg p-4 bg-zinc-50 relative">
                    <div className="flex justify-between items-start mb-3">
                      <input type="text" value={sub.title} onChange={(e) => updateSubSectionTitle(blockKey, sub.id, e.target.value)} className="font-bold text-lg bg-transparent border-b border-dashed border-zinc-400 focus:border-orange-500 outline-none uppercase w-2/3" placeholder="Nom apartat (ex: RONDA 1 I 3)" />
                      <button onClick={() => removeSubSection(blockKey, sub.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                    </div>

                    <div className="space-y-3">
                      {sub.exercises.map((ex, exIndex) => (
                        <div key={ex.id} className="flex flex-wrap items-center gap-2 bg-white p-3 rounded shadow-sm border border-zinc-100 focus-within:border-orange-300 transition-colors">
                          <div className="flex-1 min-w-[200px]">
                             <input type="text" list="library-exercises" value={ex.exerciseName || ''} onChange={(e) => updateExercise(blockKey, sub.id, ex.id, 'exerciseName', e.target.value)} placeholder="Escriu exercici..." className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded outline-none font-medium text-sm focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
                          </div>
                          <div className="flex items-center gap-1 w-20">
                            <input type="number" min="1" value={ex.sets} onChange={(e) => updateExercise(blockKey, sub.id, ex.id, 'sets', e.target.value)} className="w-full p-2 border border-zinc-200 rounded text-center text-sm" placeholder="Sèries" />
                            <span className="text-zinc-400 text-sm">x</span>
                          </div>
                          <input type="number" value={ex.reps} onChange={(e) => updateExercise(blockKey, sub.id, ex.id, 'reps', e.target.value)} className="w-20 p-2 border border-zinc-200 rounded text-center text-sm" placeholder="Cant." />
                          <select value={ex.unit} onChange={(e) => updateExercise(blockKey, sub.id, ex.id, 'unit', e.target.value)} className="w-20 p-2 bg-zinc-50 border border-zinc-200 rounded outline-none text-sm">
                            {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                          <input type="text" value={ex.notes} onChange={(e) => updateExercise(blockKey, sub.id, ex.id, 'notes', e.target.value)} className="flex-1 min-w-[120px] p-2 border border-zinc-200 rounded text-sm placeholder:text-zinc-400" placeholder="Notes (ex: per cama)" />
                          <button onClick={() => removeExercise(blockKey, sub.id, ex.id)} className="p-2 text-zinc-400 hover:text-red-500 rounded-full hover:bg-red-50"><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => addExercise(blockKey, sub.id)} className="mt-4 text-sm text-orange-600 font-bold hover:underline flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded"><Plus size={16} /> Afegir Exercici</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
           <label className="block text-sm font-medium text-zinc-600 mb-2 flex items-center gap-2"><MonitorPlay size={16} className="text-zinc-400" /> Notes inferiors (Parrilla TV)</label>
            <input type="text" value={workout.bottomNotes || ''} onChange={(e) => handleWorkoutChange('bottomNotes', e.target.value)} className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-zinc-800" placeholder="Ex: Temps restant: Màximes calories a escollir màquina..." />
        </div>
      </div>

      <div className="sticky bottom-0 w-full mt-4 p-4 md:py-5 bg-white/95 backdrop-blur-md border-t border-zinc-200 shadow-[0_-8px_15px_rgba(0,0,0,0.05)] flex justify-center z-20">
        <button onClick={saveWorkoutToDB} className="flex items-center gap-2 bg-zinc-900 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-500 transition-colors shadow-lg">
          <Save size={20} /> Guardar Entrenament al Cloud
        </button>
      </div>
    </div>
  );

  const renderTVView = () => {
    const [y, m, d] = workout.date.split('-');
    const formattedDateForTV = `${d}/${m}/${y}`;

    return (
      <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans overflow-hidden">
        <button onClick={() => setCurrentView('calendar')} className="absolute top-6 left-6 z-50 bg-white/10 hover:bg-orange-500 text-white p-3 rounded-full backdrop-blur-md transition-all opacity-20 hover:opacity-100 cursor-pointer border border-white/10" title="Tornar al Calendari"><ChevronLeft size={24} /></button>

        <div className="flex-1 flex flex-col w-full h-[100vh] p-[3vh] md:p-[4vh] lg:p-[5vh] gap-[4vh]">
          <header className="flex justify-between items-center px-[4vh] py-[3vh] bg-[#1c1c1e] rounded-[3vh] border border-white/5 shadow-2xl h-[12vh] shrink-0">
            <div className="w-1/3">
              <h1 className="text-[4vh] font-black text-white uppercase tracking-tight leading-none">{workout.sessionName}</h1>
            </div>
            <div className="w-1/3 flex justify-center items-center gap-[2vh]">
              <ModumLogoIcon className="w-[8vh] h-[8vh]" />
              <span className="text-[4.5vh] font-bold tracking-widest uppercase leading-none">MODUM MOVIMENT</span>
            </div>
            <div className="w-1/3 flex justify-end items-center gap-[2vh] text-zinc-400">
              <CalendarIcon className="w-[5vh] h-[5vh]" />
              <span className="text-[3.5vh] font-medium tracking-tight leading-none">{formattedDateForTV}</span>
            </div>
          </header>

          <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-[4vh] overflow-hidden min-h-0">
            <div className="flex flex-col gap-[3vh] overflow-hidden h-full">
              {workout.blocks.warmup.length > 0 && (
                <div className="flex items-center gap-[2vh] shrink-0 h-[4vh]">
                   <h2 className="text-[3vh] font-black text-zinc-500 uppercase tracking-widest leading-none">Escalfament</h2>
                   <div className="flex-1 h-px bg-white/10"></div>
                </div>
              )}
              <div className="flex-1 flex flex-col gap-[3vh] overflow-y-auto pr-4" style={{ scrollbarWidth: 'none' }}>
                {workout.blocks.warmup.map((sub, index) => (
                  <div key={sub.id} className="bg-[#1c1c1e] rounded-[3vh] p-[4vh] border border-white/5 shrink-0">
                    <h3 className="text-[3.5vh] font-bold text-white mb-[3vh] tracking-tight flex items-center gap-[1.5vh] leading-none">
                      <div className="w-[1vh] h-[4vh] bg-orange-500 rounded-full"></div>{sub.title}
                    </h3>
                    <ul className="flex flex-col gap-[2vh]">
                      {sub.exercises.map((ex, i) => (
                        <li key={i} className="flex items-center gap-[2vh] py-[1.5vh] border-b border-white/5 last:border-0 last:pb-0">
                          <div className="font-bold text-orange-400 text-[3.5vh] w-[14vh] shrink-0 text-right leading-none">
                            {ex.sets > 1 ? `${ex.sets}x ` : ''}{ex.reps} {ex.unit !== 'reps' ? ex.unit : ''}
                          </div>
                          <div className="w-[1vh] h-[1vh] rounded-full bg-zinc-600 shrink-0"></div>
                          <div className="text-zinc-200 text-[3.5vh] font-medium tracking-tight leading-none">{ex.exerciseName || 'SENSE NOM'}</div>
                          {ex.notes && <div className="text-zinc-500 text-[2.5vh] ml-auto tracking-tight font-medium leading-none">{ex.notes}</div>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {(workout.bottomNotes || workout.blocks.accessories.length > 0) && (
                <div className="bg-[#1c1c1e] rounded-[3vh] p-[3vh] border border-white/5 flex items-center gap-[3vh] shrink-0 h-[12vh]">
                  <div className="bg-orange-500/10 p-[1.5vh] rounded-[2vh] shrink-0">
                    <Clock className="text-orange-500 w-[5vh] h-[5vh]" />
                  </div>
                  <p className="text-[3.5vh] font-medium text-zinc-300 tracking-tight leading-snug">{workout.bottomNotes || "Complements al finalitzar la sessió."}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col h-full bg-[#1c1c1e] rounded-[4vh] p-[5vh] border border-white/5 shadow-2xl overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {workout.blocks.wod.length > 0 && (
                <div className="flex items-center gap-[2vh] shrink-0 mb-[4vh]">
                   <h2 className="text-[3vh] font-black text-zinc-500 uppercase tracking-widest leading-none">WOD</h2>
                   <div className="flex-1 h-px bg-white/10"></div>
                </div>
              )}
              {workout.blocks.wod.map((wodBlock, index) => (
                <div key={wodBlock.id} className="flex-1 flex flex-col h-full shrink-0">
                  <div className="flex items-center gap-[3vh] mb-[5vh] pb-[4vh] border-b border-white/5">
                    <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-[2.5vh] rounded-[2.5vh] shadow-lg shadow-orange-500/20">
                       <Target className="text-white w-[6vh] h-[6vh]" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-[5.5vh] font-black tracking-tight text-white uppercase leading-none">{wodBlock.title}</h2>
                  </div>
                  <div className="flex-1 flex flex-col justify-center gap-[4vh]">
                    {wodBlock.exercises.map((ex, i) => (
                      <div key={i} className="flex items-center gap-[4vh] p-[4vh] rounded-[3vh] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                        <div className="w-[10vh] h-[10vh] rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                          <span className="text-orange-400 font-bold text-[5vh] leading-none">{i + 1}</span>
                        </div>
                        <div className="flex flex-col justify-center">
                          <div className="flex items-baseline gap-[3vh]">
                            <span className="text-orange-400 font-bold text-[5.5vh] leading-none">
                              {ex.sets > 1 ? `${ex.sets}x ` : ''}{ex.reps} {ex.unit !== 'reps' ? ex.unit : ''}
                            </span>
                            <span className="text-[5.5vh] font-bold text-white tracking-tight leading-none">{ex.exerciseName || 'SENSE NOM'}</span>
                          </div>
                          {ex.notes && <span className="text-zinc-400 text-[3vh] mt-[1.5vh] tracking-tight font-medium leading-none">{ex.notes}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  };

  // --- RENDERITZAT CONDICIONAL (AUTH) ---
  if (isAuthChecking) {
    return <div className="h-screen flex items-center justify-center bg-[#111111] text-white">Carregant el sistema Modum...</div>;
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#111111] font-sans p-4 relative overflow-hidden">
        {/* Fons decoratiu */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-zinc-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <form onSubmit={handleLogin} className="relative z-10 bg-[#1c1c1e] p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl w-full max-w-md flex flex-col items-center">
          <ModumLogoIcon className="w-24 h-24 mb-6 drop-shadow-[0_0_15px_rgba(196,122,90,0.5)]" />
          <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-2 text-center">Modum Coach</h1>
          <p className="text-zinc-500 text-sm mb-8">Introdueix les teves credencials per accedir.</p>

          {loginError && <div className="w-full p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl mb-6 text-sm text-center font-medium">{loginError}</div>}

          <div className="w-full space-y-5 mb-8">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Correu Electrònic</label>
              <input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} required className="w-full p-4 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-orange-500 transition-colors placeholder:text-zinc-700" placeholder="coach@modum.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Contrasenya</label>
              <input type="password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} required className="w-full p-4 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-orange-500 transition-colors placeholder:text-zinc-700" placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold py-4 rounded-xl transition-all uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)]">
             Accedir a la plataforma
          </button>
        </form>
      </div>
    );
  }

  // --- INTERFÍCIE PRINCIPAL UN COP LOGUEJAT ---
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <nav className="bg-zinc-950 text-zinc-400 p-2 px-6 flex justify-between items-center z-50 shadow-md">
        <div className="flex items-center gap-3 font-bold text-white tracking-widest uppercase">
          <ModumLogoIcon className="w-6 h-6" />
          MODUM COACH
        </div>
        <div className="flex items-center gap-2 md:gap-4">
            
            {/* Indicador actiu per anar a la TV ràpid si hi ha entrenaments */}
            {tvWorkouts.length > 0 && currentView !== 'tv' && (
              <button onClick={() => setCurrentView('tv')} className="hidden lg:flex items-center gap-2 bg-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-bold animate-pulse hover:bg-orange-500">
                <MonitorPlay size={16} /> Obrir TV ({tvWorkouts.length}/2)
              </button>
            )}

            {/* CAMPANETA DE NOTIFICACIONS */}
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="flex items-center justify-center p-2 hover:text-white transition-colors relative" title="Recordatoris de Tests">
                <Bell size={20} className={notificationsList.length > 0 ? 'text-white animate-bounce' : 'text-zinc-500'} />
                {notificationsList.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-zinc-950">
                    {notificationsList.length}
                  </span>
                )}
              </button>

              {/* MODAL LLISTA NOTIFICACIONS */}
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-zinc-200 shadow-2xl rounded-xl z-50 overflow-hidden text-left">
                  <div className="p-3 border-b border-zinc-100 font-bold flex justify-between items-center text-zinc-800 bg-zinc-50">
                    <span className="flex items-center gap-2"><Bell size={16} className="text-orange-500" /> Tests Programats</span>
                    <button onClick={() => setShowNotifications(false)} className="text-zinc-400 hover:text-zinc-800"><X size={18}/></button>
                  </div>
                  <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                    {notificationsList.length === 0 ? (
                      <p className="p-6 text-sm text-zinc-500 text-center">Cap test a la vista. Les alertes sortiran aquí 7 dies abans de la data programada.</p>
                    ) : (
                      notificationsList.map((rem, i) => (
                        <button 
                          key={i} 
                          onClick={() => { 
                            setClientToOpen(rem.clientId); 
                            setCurrentView('clients'); 
                            setShowNotifications(false); 
                          }} 
                          className="w-full text-left p-4 hover:bg-orange-50 border-b border-zinc-100 flex flex-col gap-1 transition-colors"
                        >
                           <span className="text-sm font-black text-zinc-800">{rem.clientName}</span>
                           <span className="text-xs font-bold text-zinc-600">{rem.pr}</span>
                           <span className={`text-[11px] font-bold flex items-center gap-1 ${rem.isOverdue ? 'text-red-500' : (rem.isToday ? 'text-orange-500' : 'text-zinc-500')}`}>
                             {rem.isOverdue ? <><Clock size={12}/> Fora de termini ({rem.date})</> : (rem.isToday ? 'Programat per AVUI' : `Properament (${rem.date})`)}
                           </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex bg-zinc-900 rounded-lg p-1 hidden md:flex">
              <button onClick={() => setCurrentView('calendar')} className={`px-3 md:px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${currentView === 'calendar' ? 'bg-orange-500 text-black shadow-lg' : 'hover:text-white'}`}>
                  <CalendarDays size={16} /> <span>Calendari</span>
              </button>
              <button onClick={() => createWorkoutForDate(todayString)} className={`px-3 md:px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${currentView === 'coach' ? 'bg-orange-500 text-black shadow-lg' : 'hover:text-white'}`}>
                  <Smartphone size={16} /> <span>Creador</span>
              </button>
              <button onClick={() => setCurrentView('library')} className={`px-3 md:px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${currentView === 'library' ? 'bg-orange-500 text-black shadow-lg' : 'hover:text-white'}`}>
                  <BookOpen size={16} /> <span>Biblioteca</span>
              </button>
              
              <button onClick={() => setCurrentView('clients')} className={`px-3 md:px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${currentView === 'clients' ? 'bg-orange-500 text-black shadow-lg' : 'hover:text-white'}`}>
                  <Users size={16} /> <span>Atletes</span>
              </button>
              
              <button onClick={() => setCurrentView('tv')} className={`px-3 md:px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${currentView === 'tv' ? 'bg-orange-500 text-black shadow-lg' : 'hover:text-white'}`}>
                  <MonitorPlay size={16} /> <span>Pantalla TV</span>
              </button>
            </div>

            {/* Menú compacte per a mòbils */}
            <div className="flex md:hidden bg-zinc-900 rounded-lg p-1">
               <button onClick={() => setCurrentView('calendar')} className={`p-2 rounded-md ${currentView === 'calendar' ? 'bg-orange-500 text-black' : 'hover:text-white'}`}><CalendarDays size={18} /></button>
               <button onClick={() => createWorkoutForDate(todayString)} className={`p-2 rounded-md ${currentView === 'coach' ? 'bg-orange-500 text-black' : 'hover:text-white'}`}><Smartphone size={18} /></button>
               <button onClick={() => setCurrentView('clients')} className={`p-2 rounded-md ${currentView === 'clients' ? 'bg-orange-500 text-black' : 'hover:text-white'}`}><Users size={18} /></button>
               <button onClick={() => setCurrentView('tv')} className={`p-2 rounded-md ${currentView === 'tv' ? 'bg-orange-500 text-black' : 'hover:text-white'}`}><MonitorPlay size={18} /></button>
            </div>
            
            <button onClick={handleLogout} className="flex items-center justify-center p-2 text-zinc-500 hover:text-red-400 transition-colors ml-2" title="Tancar Sessió">
                <LogOut size={20} />
            </button>
        </div>
      </nav>

      <div className="flex-1 overflow-auto bg-zinc-900">
        {currentView === 'calendar' && renderCalendarView()}
        {currentView === 'coach' && renderCoachView()}
        {currentView === 'library' && <LibraryView exerciseLibrary={exerciseLibrary} saveExerciseToDB={saveExerciseToDB} />}
        {currentView === 'clients' && <ClientsView clients={clients} savedWorkouts={savedWorkouts} saveClientToDB={saveClientToDB} deleteClientFromDB={deleteClientFromDB} customPRs={customPRs} handleAddCustomPR={handleAddCustomPR} assignWorkoutToClient={assignWorkoutToClient} removeWorkoutFromClient={removeWorkoutFromClient} clientToOpen={clientToOpen} />}
        {currentView === 'tv' && renderTVView()}
      </div>
    </div>
  );
}