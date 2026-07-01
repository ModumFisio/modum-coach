import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Trash2, Save, MonitorPlay, Smartphone, Activity, Clock, Target, ChevronLeft, ChevronRight, CalendarDays, List, BookOpen, Folder, Search, CheckCircle2, Download, X, FileSpreadsheet, Copy, LogOut, Users, UserPlus, Trophy, TrendingUp, Share2, Flame, Bell, BarChart3, FileText, Zap } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, writeBatch } from 'firebase/firestore';

// --- CONFIGURACIÓ DE FIREBASE ---
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

// --- BASE DE DADES INICIAL ---
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

// --- BASE DE DADES NORMATIVA UNIFICADA (MOCK) ---
const NORMATIVE_DB = {
  'General': { 'General': { cmj: { mu: 40, sigma: 5 }, iso: { mu: 25, sigma: 4 } } },
  'Futbol': {
    'General': { cmj: { mu: 43, sigma: 5 }, iso: { mu: 28, sigma: 4 } },
    'Davanter': { cmj: { mu: 45, sigma: 4 }, iso: { mu: 28, sigma: 3 } },
    'Defensa': { cmj: { mu: 42, sigma: 5 }, iso: { mu: 30, sigma: 4 } },
  },
  'Bàsquet': {
    'General': { cmj: { mu: 46, sigma: 5 }, iso: { mu: 26, sigma: 4 } },
    'Base': { cmj: { mu: 50, sigma: 6 }, iso: { mu: 24, sigma: 3 } },
    'Pívot': { cmj: { mu: 42, sigma: 4 }, iso: { mu: 32, sigma: 5 } }
  },
  'CrossFit': {
    'General': { cmj: { mu: 45, sigma: 5 }, iso: { mu: 35, sigma: 5 } },
    'Atleta': { cmj: { mu: 45, sigma: 5 }, iso: { mu: 35, sigma: 5 } }
  }
};

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
    <div className="min-h-full bg-zinc-100 font-sans text-zinc-900 flex flex-col relative">
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
         <div className="max-w-5xl mx-auto space-y-6 pb-20">
            
            {/* TOP BAR BIBLIOTECA (Sense barra lateral) */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-zinc-200">
               <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
                 <div className="relative flex-1 md:max-w-sm">
                   <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                   <input 
                     type="text" 
                     placeholder="Cerca un exercici..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                   />
                 </div>
                 <select 
                   value={selectedCategory} 
                   onChange={(e) => setSelectedCategory(e.target.value)} 
                   className="flex-1 p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-medium text-sm md:max-w-[220px] cursor-pointer"
                 >
                   {allCategories.map(cat => (
                     <option key={cat} value={cat}>{cat}</option>
                   ))}
                 </select>
               </div>
               <button 
                 onClick={() => setIsAdding(!isAdding)}
                 className="w-full md:w-auto flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-500 transition-colors shrink-0"
               >
                 {isAdding ? 'Cancel·lar' : <><Plus size={18} /> Nou Exercici</>}
               </button>
            </div>

            {isAdding && (
              <form onSubmit={handleSaveNewExercise} className="bg-orange-50 border border-orange-200 p-6 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-4">
                <h3 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} /> Afegeix a la Biblioteca Cloud
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-orange-800 mb-1">Nom de l'Exercici</label>
                    <input required type="text" value={newExName} onChange={(e)=>setNewExName(e.target.value)} className="w-full p-2.5 border border-orange-200 rounded-xl outline-none focus:border-orange-500" placeholder="Ex: Press Militar" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-800 mb-1">Carpeta / Categoria</label>
                    <input list="categories-list" required value={newExCategory} onChange={(e)=>setNewExCategory(e.target.value)} className="w-full p-2.5 border border-orange-200 rounded-xl outline-none focus:border-orange-500" />
                    <datalist id="categories-list">
                      {allCategories.filter(c => c !== 'Totes').map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-800 mb-1">Unitat per Defecte</label>
                    <select value={newExUnit} onChange={(e)=>setNewExUnit(e.target.value)} className="w-full p-2.5 border border-orange-200 rounded-xl outline-none bg-white">
                      {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-600">Guardar Exercici</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {filteredExercises.length === 0 ? (
                 <div className="col-span-full py-12 text-center text-zinc-400 bg-white rounded-2xl border border-zinc-200 border-dashed">
                   <Folder size={48} className="mx-auto mb-4 opacity-20" />
                   <p className="text-lg">No s'han trobat exercicis en aquesta carpeta o cerca.</p>
                 </div>
               ) : (
                 filteredExercises.map(ex => (
                   <div key={ex.id} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-center hover:border-orange-300 hover:shadow-md transition-all">
                     <div className="font-bold text-zinc-900 text-lg mb-2 truncate">{ex.name}</div>
                     <div className="flex justify-between items-center mt-auto">
                       <span className="bg-zinc-100 px-2.5 py-1 rounded-md text-zinc-600 flex items-center gap-1.5 text-xs font-medium">
                         <Folder size={12} /> <span className="truncate max-w-[100px]">{ex.category}</span>
                       </span>
                       <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                         {ex.defaultUnit}
                       </span>
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
  
  // PESTANYES DE LA FITXA
  const [clientTab, setClientTab] = useState('general'); // 'general' | 'biomechanics'

  // Estat local per als inputs dels nous registres de PR i buscador
  const [prInputs, setPrInputs] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Estats per al Motor Analític Biomecànic
  const [bioInputs, setBioInputs] = useState({
    age: '', weight: '', sport: 'General', position: 'General', cmj: '', iso: ''
  });
  const [bioResult, setBioResult] = useState(null);

  useEffect(() => {
    if (clientToOpen) {
      const c = clients.find(cl => cl.id === clientToOpen);
      if (c) {
        handleSelectClient(c);
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
      prReminders: {},
      biomechanics: { age: '', weight: '', sport: 'General', position: 'General', cmj: '', iso: '' },
      assignedWorkouts: []
    };
    setEditingClient(newClient);
    setSelectedClientId(newClient.id);
    setClientTab('general');
    setPrInputs({});
    setBioInputs({ age: '', weight: '', sport: 'General', position: 'General', cmj: '', iso: '' });
    setBioResult(null);
  };

  const handleSelectClient = (client) => {
    setSelectedClientId(client.id);
    const clientData = { 
      ...client, 
      biomechanics: client.biomechanics || { age: '', weight: '', sport: 'General', position: 'General', cmj: '', iso: '' }
    };
    setEditingClient(clientData);
    setClientTab('general');
    setPrInputs({});
    setBioInputs(clientData.biomechanics);
    setBioResult(null);
  };

  const handleSave = async () => {
    if (editingClient) {
      const finalClientData = {
        ...editingClient,
        biomechanics: bioInputs
      };
      await saveClientToDB(finalClientData);
      setEditingClient(finalClientData);
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

  // --- MÈTODES PER AL MOTOR BIOMECÀNIC ---
  const handleBioInputChange = (field, value) => {
    setBioInputs(prev => ({ ...prev, [field]: value }));
  };

  const calculateBiomechanics = () => {
    const weight = parseFloat(bioInputs.weight);
    const cmj = parseFloat(bioInputs.cmj);
    const iso = parseFloat(bioInputs.iso);

    if (!weight || !cmj || !iso) {
      alert("Falten dades necessàries per fer l'avaluació biomecànica (Pes, CMJ i ISO).");
      return;
    }

    const forceRel = iso / weight;
    const sportDb = NORMATIVE_DB[bioInputs.sport] || NORMATIVE_DB['General'];
    const norm = sportDb[bioInputs.position] || sportDb['General'] || NORMATIVE_DB['General']['General'];

    const zCmj = (cmj - norm.cmj.mu) / norm.cmj.sigma;
    const zIso = (forceRel - norm.iso.mu) / norm.iso.sigma;

    let quadrant = '';
    let explanation = '';

    if (zCmj > 0 && zIso > 0) {
        quadrant = 'SUPERMAN';
        explanation = 'Alt CMJ i Alt ISO. Perfil òptim de força i velocitat explosiva. Està completament balancejat.';
    } else if (zCmj <= 0 && zIso > 0) {
        quadrant = 'HULK';
        explanation = 'Baix CMJ i Alt ISO. Excés de força base, falta traduir-la en potència explosiva. Prioritzar pliometria i velocitat.';
    } else if (zCmj > 0 && zIso <= 0) {
        quadrant = 'FLASH';
        explanation = 'Alt CMJ i Baix ISO. Molt reactiu però poca producció de força màxima neta. Prioritzar força pesada i estructural.';
    } else {
        quadrant = 'NORMAL / DEFICIENT';
        explanation = 'Baix CMJ i Baix ISO. Dèficit global. Necessita un bloc de desenvolupament de les capacitats físiques bàsiques (força + potència).';
    }

    const dateStr = getLocalISOString(new Date());
    const csv = `${dateStr}, ${editingClient.name}, ${bioInputs.age || 'N/A'}, ${bioInputs.sport || 'General'}, ${bioInputs.position || 'General'}, ${weight}, ${forceRel.toFixed(2)}, ${cmj}, ${zIso.toFixed(2)}, ${zCmj.toFixed(2)}, ${quadrant}`;

    setBioResult({ forceRel, zCmj, zIso, quadrant, explanation, csv });
    
    setEditingClient(prev => ({
      ...prev,
      biomechanics: bioInputs
    }));
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
      history.sort((a, b) => a.date.localeCompare(b.date));

      const updatedReminders = { ...(prev.prReminders || {}) };
      updatedReminders[prName] = '';

      return { 
        ...prev, 
        prs: { ...prev.prs, [prName]: history },
        prReminders: updatedReminders
      };
    });

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

  const sortedWorkouts = [...savedWorkouts].sort((a, b) => b.date.localeCompare(a.date));
  const clientWorkouts = savedWorkouts.filter(w => w.clientId === editingClient?.id);
  const allPRs = [...STANDARD_PRS, ...(customPRs || [])];

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const extractNumber = (str) => {
    if (!str) return 0;
    const match = String(str).replace(',', '.').match(/[\d]+[.,]?[\d]*/);
    return match ? parseFloat(match[0]) : 0;
  };

  const prEvolutions = [];
  if (editingClient?.prs) {
    Object.entries(editingClient.prs).forEach(([prName, prData]) => {
      const history = normalizePRHistory(prData);
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
    <div className="min-h-full bg-zinc-100 font-sans text-zinc-900 flex flex-col relative">
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
         <div className="max-w-5xl mx-auto space-y-6 pb-24">
            
            {/* TOP BAR ATLETES (Sense barra lateral) */}
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-zinc-200 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
                <div className="relative flex-1 md:max-w-sm">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input 
                    type="text" 
                    placeholder="Cerca un atleta per nom..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  />
                </div>
                <select 
                  value={selectedClientId || ''} 
                  onChange={(e) => {
                    const client = clients.find(c => c.id === e.target.value);
                    if (client) handleSelectClient(client);
                  }}
                  className="flex-1 p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-medium text-sm md:min-w-[250px] cursor-pointer"
                >
                  <option value="" disabled>-- Tria un atleta de la llista --</option>
                  {filteredClients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleAddNewClient} className="w-full md:w-auto flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-500 transition-colors shadow-sm shrink-0">
                <UserPlus size={18} /> Nou Atleta
              </button>
            </div>

            {editingClient ? (
              <div className="space-y-6">
                {/* HEADER PERFIL AMB PESTANYES */}
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
                    <button onClick={handleDelete} className="text-red-400 hover:text-red-600 p-2 bg-red-50 rounded-lg transition-colors"><Trash2 size={20} /></button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Correu Electrònic</label>
                      <input type="email" value={editingClient.email} onChange={(e) => setEditingClient({...editingClient, email: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-orange-500" placeholder="atleta@email.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Telèfon (Opcional)</label>
                      <input type="tel" value={editingClient.phone || ''} onChange={(e) => setEditingClient({...editingClient, phone: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-orange-500" placeholder="+34 600 000 000" />
                    </div>
                  </div>

                  {/* TABS DE NAVEGACIÓ EN FORMAT BOTONS GRANS */}
                  <div className="flex flex-col sm:flex-row gap-3 border-t border-zinc-100 pt-6">
                    <button 
                      onClick={() => setClientTab('general')}
                      className={`flex-1 py-3 px-4 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${clientTab === 'general' ? 'bg-orange-500 text-white shadow-md' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800'}`}
                    >
                      <Trophy size={18} /> Rendiment i Sessions
                    </button>
                    <button 
                      onClick={() => setClientTab('biomechanics')}
                      className={`flex-1 py-3 px-4 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${clientTab === 'biomechanics' ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                    >
                      <Zap size={18} /> Motor Analític Biomecànic
                    </button>
                  </div>
                </div>

                {/* CONTINGUT PESTANYA: GENERAL */}
                {clientTab === 'general' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
                      <h3 className="text-lg font-bold text-zinc-800 mb-6 flex items-center gap-2"><Trophy className="text-yellow-500" /> Marques Personals (PRs / Benchmarks)</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {allPRs.map(pr => {
                          const history = normalizePRHistory(editingClient.prs[pr]);
                          const latestRecord = history.length > 0 ? history[history.length - 1] : null;
                          const inputData = prInputs[pr] || { date: todayString, value: '' };
                          
                          const reminderDate = editingClient.prReminders?.[pr];
                          let isDue = false;
                          
                          if (reminderDate && reminderDate <= getLocalISOString(new Date())) {
                            isDue = true;
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
                  </div>
                )}

                {/* CONTINGUT PESTANYA: BIOMECÀNICA */}
                {clientTab === 'biomechanics' && (
                  <div className="bg-white p-6 md:p-10 rounded-2xl shadow-lg border border-blue-200 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
                    
                    <div className="flex flex-col mb-8 border-b border-zinc-100 pb-6">
                      <h3 className="text-2xl font-black text-zinc-900 flex items-center gap-3"><Zap className="text-blue-600 w-8 h-8" /> Motor Analític Biomecànic</h3>
                      <p className="text-zinc-500 mt-2 text-base">Introdueix les dades del testatge de l'esportista per creuar-les amb la Base de Dades Normativa i ubicar el seu perfil de rendiment exacte al Speed-Force Quadrant.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-8 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                      <div>
                        <label className="block text-xs font-bold text-blue-900 uppercase mb-2">Edat</label>
                        <input type="number" value={bioInputs.age} onChange={(e) => handleBioInputChange('age', e.target.value)} className="w-full p-3 bg-white border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm transition-all" placeholder="Ex: 24" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-blue-900 uppercase mb-2">Pes Corporal (kg)</label>
                        <input type="number" value={bioInputs.weight} onChange={(e) => handleBioInputChange('weight', e.target.value)} className="w-full p-3 bg-white border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm transition-all" placeholder="Ex: 80" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-blue-900 uppercase mb-2">Esport</label>
                        <select value={bioInputs.sport} onChange={(e) => handleBioInputChange('sport', e.target.value)} className="w-full p-3 bg-white border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm transition-all appearance-none cursor-pointer">
                          <option value="General">General</option>
                          <option value="Futbol">Futbol</option>
                          <option value="Bàsquet">Bàsquet</option>
                          <option value="CrossFit">CrossFit</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-blue-900 uppercase mb-2">Posició / Rol</label>
                        <input type="text" value={bioInputs.position} onChange={(e) => handleBioInputChange('position', e.target.value)} className="w-full p-3 bg-white border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm transition-all" placeholder="Ex: Davanter" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-blue-900 uppercase mb-2">CMJ (cm)</label>
                        <input type="number" value={bioInputs.cmj} onChange={(e) => handleBioInputChange('cmj', e.target.value)} className="w-full p-3 bg-white border border-blue-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-blue-800 font-black text-lg shadow-sm transition-all" placeholder="Ex: 42" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-blue-900 uppercase mb-2">ISO Belt Squat (N)</label>
                        <input type="number" value={bioInputs.iso} onChange={(e) => handleBioInputChange('iso', e.target.value)} className="w-full p-3 bg-white border border-blue-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-blue-800 font-black text-lg shadow-sm transition-all" placeholder="Ex: 2100" />
                      </div>
                    </div>

                    <button onClick={calculateBiomechanics} className="w-full bg-blue-600 text-white font-black uppercase tracking-widest py-4 rounded-xl hover:bg-blue-700 transition-all hover:shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:-translate-y-1 mb-8 active:translate-y-0">
                      Generar Avaluació Biomecànica
                    </button>

                    {bioResult && (
                      <div className="bg-[#111111] rounded-3xl p-8 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-400 border border-zinc-800">
                        
                        <h4 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Target size={16}/> Diagnòstic Directe</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                              <span className="text-zinc-400 font-medium">Força Relativa ISO</span>
                              <span className="font-bold text-2xl text-white">{bioResult.forceRel.toFixed(2)} <span className="text-sm text-zinc-500 font-normal tracking-wide">N/kg</span></span>
                            </div>
                            <div className="flex justify-between items-center bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                              <span className="text-zinc-400 font-medium">Z-Score CMJ</span>
                              <span className={`font-black text-2xl ${bioResult.zCmj > 0 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.3)]'}`}>{bioResult.zCmj > 0 ? '+' : ''}{bioResult.zCmj.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                              <span className="text-zinc-400 font-medium">Z-Score ISO</span>
                              <span className={`font-black text-2xl ${bioResult.zIso > 0 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.3)]'}`}>{bioResult.zIso > 0 ? '+' : ''}{bioResult.zIso.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-6 rounded-2xl border border-zinc-700 flex flex-col justify-center relative overflow-hidden shadow-lg">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none"></div>
                            <span className="text-xs text-blue-400 font-bold uppercase mb-2 tracking-widest">Perfil Resultant</span>
                            <span className="text-4xl font-black text-white mb-4 tracking-tight drop-shadow-md">{bioResult.quadrant}</span>
                            <p className="text-base text-zinc-300 leading-relaxed">{bioResult.explanation}</p>
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Activity size={16}/> Matriu Speed-Force 2x2</h4>
                        <div className="grid grid-cols-2 gap-3 w-full max-w-lg mx-auto mb-12 relative bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                          <div className="absolute -left-4 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-black text-zinc-600 tracking-[0.3em]">VELOCITAT (CMJ)</div>
                          <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 text-xs font-black text-zinc-600 tracking-[0.3em]">FORÇA (ISO)</div>
                          
                          {/* Top Left: FLASH */}
                          <div className={`p-6 border rounded-tl-3xl flex flex-col items-center justify-center text-center transition-all duration-500 ${bioResult.quadrant === 'FLASH' ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.5)] z-10 scale-[1.05]' : 'bg-zinc-950 border-zinc-800 text-zinc-500 opacity-60'}`}>
                            <Zap size={28} className={bioResult.quadrant === 'FLASH' ? 'text-white mb-2' : 'text-zinc-700 mb-2'} />
                            <span className="font-black text-lg tracking-wide">FLASH</span>
                          </div>
                          
                          {/* Top Right: SUPERMAN */}
                          <div className={`p-6 border rounded-tr-3xl flex flex-col items-center justify-center text-center transition-all duration-500 ${bioResult.quadrant === 'SUPERMAN' ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.5)] z-10 scale-[1.05]' : 'bg-zinc-950 border-zinc-800 text-zinc-500 opacity-60'}`}>
                            <TrendingUp size={28} className={bioResult.quadrant === 'SUPERMAN' ? 'text-white mb-2' : 'text-zinc-700 mb-2'} />
                            <span className="font-black text-lg tracking-wide">SUPERMAN</span>
                          </div>

                          {/* Bottom Left: DEFICIENT */}
                          <div className={`p-6 border rounded-bl-3xl flex flex-col items-center justify-center text-center transition-all duration-500 ${bioResult.quadrant === 'NORMAL / DEFICIENT' ? 'bg-gradient-to-br from-rose-500 to-rose-700 text-white border-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.5)] z-10 scale-[1.05]' : 'bg-zinc-950 border-zinc-800 text-zinc-500 opacity-60'}`}>
                            <Activity size={28} className={bioResult.quadrant === 'NORMAL / DEFICIENT' ? 'text-white mb-2' : 'text-zinc-700 mb-2'} />
                            <span className="font-black text-lg tracking-wide">DEFICIENT</span>
                          </div>

                          {/* Bottom Right: HULK */}
                          <div className={`p-6 border rounded-br-3xl flex flex-col items-center justify-center text-center transition-all duration-500 ${bioResult.quadrant === 'HULK' ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.5)] z-10 scale-[1.05]' : 'bg-zinc-950 border-zinc-800 text-zinc-500 opacity-60'}`}>
                            <Trophy size={28} className={bioResult.quadrant === 'HULK' ? 'text-white mb-2' : 'text-zinc-700 mb-2'} />
                            <span className="font-black text-lg tracking-wide">HULK</span>
                          </div>
                        </div>

                        <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><FileSpreadsheet size={16}/> Cadena CSV d'Exportació</span>
                            <button 
                              onClick={() => { navigator.clipboard.writeText(bioResult.csv); alert("CSV copiat al porta-retalls!"); }}
                              className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 font-bold shadow-sm"
                            >
                              <Copy size={14}/> COPIAR
                            </button>
                          </div>
                          <textarea 
                            readOnly 
                            value={bioResult.csv} 
                            className="w-full bg-black text-emerald-400 font-mono text-sm p-4 rounded-xl border border-zinc-800 h-20 outline-none resize-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[60vh] flex flex-col items-center justify-center text-zinc-400 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                <Users size={64} className="mb-4 opacity-20" />
                <p className="text-xl font-medium">Tria un atleta per veure el seu perfil o crea'n un de nou.</p>
              </div>
            )}
         </div>
         
         {/* BOTÓ DE GUARDAR FLOTANT */}
         {editingClient && (
           <div className="fixed bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur-md border-t border-zinc-200 flex justify-center z-10">
              <button onClick={handleSave} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-3 rounded-full font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <Save size={20} /> Guardar Perfil de l'Atleta
              </button>
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
  
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [clients, setClients] = useState([]); 
  const [customPRs, setCustomPRs] = useState([]);

  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarMode, setCalendarMode] = useState('month'); 
  
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStart, setExportStart] = useState(todayString);
  const [exportEnd, setExportEnd] = useState(todayString);

  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [dupFrequency, setDupFrequency] = useState(1);
  const [dupPeriod, setDupPeriod] = useState('days'); 
  const [dupStartDate, setDupStartDate] = useState(todayString);
  const [dupEndDate, setDupEndDate] = useState(todayString);
  const [workoutToDuplicate, setWorkoutToDuplicate] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);
  const [deleteSeriesToo, setDeleteSeriesToo] = useState(false);

  const [tvWorkouts, setTvWorkouts] = useState([]);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [showClientSearch, setShowClientSearch] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [clientToOpen, setClientToOpen] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

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

  const getDueReminders = () => {
    let due = [];
    const todayStr = getLocalISOString(new Date());
    const warningDateObj = new Date();
    warningDateObj.setDate(warningDateObj.getDate() + 7);
    const warningStr = getLocalISOString(warningDateObj);

    clients.forEach(client => {
      if (client.prReminders) {
        Object.entries(client.prReminders).forEach(([pr, dateStr]) => {
          if (dateStr && dateStr <= warningStr) {
            const history = normalizePRHistory(client.prs?.[pr]);
            const latestRecord = history.length > 0 ? history[history.length - 1] : null;
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
    return due.sort((a, b) => a.date.localeCompare(b.date));
  };
  
  const notificationsList = getDueReminders();

  const handleConfirmDuplicate = async () => {
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

  const handleExportCSV = () => {
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
           <div class="mb-10 text-center bg-zinc-900 text-white py-6 rounded-2xl">
             <span class="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">${workoutData.tag || 'WOD'}</span>
             <h1 class="text-4xl font-black uppercase tracking-tight">${workoutData.sessionName}</h1>
             ${clientNameStr}
           </div>
           ${buildBlockHtml('Escalfament', workoutData.blocks.warmup)}
           ${buildBlockHtml('WOD (Part Principal)', workoutData.blocks.wod)}
           ${buildBlockHtml('Complements', workoutData.blocks.accessories)}
           ${workoutData.bottomNotes ? `
             <div class="mt-8 bg-orange-50 border border-orange-200 p-5 rounded-xl">
               <h4 class="text-sm font-bold text-orange-800 uppercase mb-2 flex items-center gap-2">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-500"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                 Notes de l'Entrenador
               </h4>
               <p class="text-zinc-700 font-medium">${workoutData.bottomNotes}</p>
             </div>
           ` : ''}
           <div class="mt-12 pt-6 border-t border-zinc-200 text-center text-zinc-400 text-xs font-medium">
             Generat automàticament des de la plataforma Modum Coach
           </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 1000);
  };

  const handleWorkoutChange = (field, value) => setWorkout(prev => ({ ...prev, [field]: value }));
  const addSubSection = (blockKey) => { setWorkout(prev => ({ ...prev, blocks: { ...prev.blocks, [blockKey]: [...prev.blocks[blockKey], { id: Date.now().toString(), title: 'Nou Apartat', exercises: [] }] } })); };
  const updateSubSectionTitle = (blockKey, subId, newTitle) => { setWorkout(prev => ({ ...prev, blocks: { ...prev.blocks, [blockKey]: prev.blocks[blockKey].map(sub => sub.id === subId ? { ...sub, title: newTitle } : sub) } })); };
  const removeSubSection = (blockKey, subId) => { setWorkout(prev => ({ ...prev, blocks: { ...prev.blocks, [blockKey]: prev.blocks[blockKey].filter(sub => sub.id !== subId) } })); };
  const addExercise = (blockKey, subId) => { const newEx = { id: Date.now().toString(), exerciseName: '', sets: 1, reps: 10, unit: 'reps', notes: '' }; setWorkout(prev => ({ ...prev, blocks: { ...prev.blocks, [blockKey]: prev.blocks[blockKey].map(sub => sub.id === subId ? { ...sub, exercises: [...sub.exercises, newEx] } : sub) } })); };
  const updateExercise = (blockKey, subId, exId, field, value) => { setWorkout(prev => ({ ...prev, blocks: { ...prev.blocks, [blockKey]: prev.blocks[blockKey].map(sub => sub.id === subId ? { ...sub, exercises: sub.exercises.map(ex => ex.id === exId ? { ...ex, [field]: value } : ex) } : sub) } })); };
  const removeExercise = (blockKey, subId, exId) => { setWorkout(prev => ({ ...prev, blocks: { ...prev.blocks, [blockKey]: prev.blocks[blockKey].map(sub => sub.id === subId ? { ...sub, exercises: sub.exercises.filter(ex => ex.id !== exId) } : sub) } })); };
  const createWorkoutForDate = (dateStr) => { setWorkout({ ...emptyWorkoutTemplate, id: Date.now().toString(), date: dateStr }); setCurrentView('coach'); };

  const getWorkoutsForDate = (dateStr) => savedWorkouts.filter(w => w.date === dateStr);
  const goToPrev = () => { const newDate = new Date(calendarDate); if (calendarMode === 'month') newDate.setMonth(newDate.getMonth() - 1); else if (calendarMode === 'week') newDate.setDate(newDate.getDate() - 7); else newDate.setDate(newDate.getDate() - 1); setCalendarDate(newDate); };
  const goToNext = () => { const newDate = new Date(calendarDate); if (calendarMode === 'month') newDate.setMonth(newDate.getMonth() + 1); else if (calendarMode === 'week') newDate.setDate(newDate.getDate() + 7); else newDate.setDate(newDate.getDate() + 1); setCalendarDate(newDate); };
  const handleDayClick = (dateStr) => { const [y, m, d] = dateStr.split('-'); setCalendarDate(new Date(y, m - 1, d)); setCalendarMode('day'); };

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
                          <button onClick={() => generateWorkoutPDF(w)} className="px-3 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-100 flex items-center gap-1">
                            <FileText size={16} /> PDF
                          </button>
                          <button onClick={() => { setWorkoutToDuplicate(w); setDupStartDate(w.date); setDupEndDate(w.date); setShowDuplicateModal(true); }} className="px-3 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-100 flex items-center gap-1">
                            <Copy size={16} /> Duplicar
                          </button>
                          <button onClick={() => { setWorkout(w); setCurrentView('coach'); }} className="px-3 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800">
                            Editar Sessió
                          </button>
                          <button onClick={() => toggleTVWorkout(w)} className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${isSelectedForTV ? 'bg-orange-500 text-white shadow-md' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}>
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 relative z-[60]">
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
                <div className="absolute z-[100] w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-2xl max-h-60 overflow-y-auto top-full left-0">
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
            <div key={blockKey} className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 relative z-10">
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
                             <input type="text" list="library-exercises" value={ex.exerciseName || ''} onChange={(e) => updateExercise(blockKey, sub.id, ex.id, 'exerciseName', e.target.value)} placeholder="Escriu per cercar..." className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded outline-none font-medium text-sm focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
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

      <div className="sticky bottom-0 w-full mt-4 p-4 md:py-5 bg-white/95 backdrop-blur-md border-t border-zinc-200 shadow-[0_-8px_15px_rgba(0,0,0,0.05)] flex justify-center z-50">
        <button onClick={saveWorkoutToDB} className="flex items-center gap-2 bg-zinc-900 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-500 transition-colors shadow-lg">
          <Save size={20} /> Guardar Entrenament al Cloud
        </button>
      </div>
    </div>
  );

  const renderTVView = () => {
    if (tvWorkouts.length === 0) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-sans">
           <button onClick={() => setCurrentView('calendar')} className="absolute top-6 left-6 z-50 bg-white/10 hover:bg-orange-500 text-white p-3 rounded-full backdrop-blur-md transition-all opacity-20 hover:opacity-100 cursor-pointer border border-white/10" title="Tornar al Calendari"><ChevronLeft size={24} /> Tornar al calendari</button>
           <MonitorPlay size={80} className="text-zinc-800 mb-6" />
           <h2 className="text-3xl font-bold text-zinc-500">La cua de la TV està buida</h2>
           <p className="text-zinc-600 mt-2">Ves al calendari i utilitza el botó "Enviar a TV" per projectar entrenaments.</p>
        </div>
      );
    }

    const isDual = tvWorkouts.length === 2;

    return (
      <div className="relative min-h-screen w-full bg-[#000000] text-white flex flex-col lg:flex-row font-sans p-4 gap-4 overflow-y-auto">
        <button onClick={() => setCurrentView('calendar')} className="fixed top-4 left-4 z-50 bg-black/50 hover:bg-orange-500 text-white p-2 md:p-3 rounded-full backdrop-blur-md transition-all border border-white/10 shadow-lg" title="Tornar al Calendari">
          <ChevronLeft size={24} />
        </button>

        {tvWorkouts.map((workoutData, idx) => {
          const [y, m, d] = workoutData.date.split('-');
          const formattedDateForTV = `${d}/${m}/${y}`;

          return (
            <div key={workoutData.id} className={`flex flex-col ${isDual ? 'w-full lg:w-1/2' : 'w-full max-w-6xl mx-auto'} gap-4`}>
              
              <header className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-[#1c1c1e] rounded-3xl border border-white/5 shadow-2xl shrink-0 gap-4 sm:gap-0 mt-16 sm:mt-0">
                <div className="w-full sm:w-1/3 text-center sm:text-left">
                  <h1 className={`font-black text-white uppercase tracking-tight leading-none truncate ${isDual ? 'text-2xl lg:text-3xl' : 'text-3xl lg:text-5xl'}`}>{workoutData.sessionName}</h1>
                </div>
                <div className="w-full sm:w-1/3 flex justify-center items-center gap-3">
                  <ModumLogoIcon className={isDual ? 'w-8 h-8 lg:w-10 lg:h-10' : 'w-10 h-10 lg:w-14 lg:h-14'} />
                  <span className={`font-bold tracking-widest uppercase leading-none ${isDual ? 'text-xl lg:text-2xl' : 'text-2xl lg:text-4xl'}`}>MODUM MOVIMENT</span>
                </div>
                <div className="w-full sm:w-1/3 flex justify-center sm:justify-end items-center gap-3 text-zinc-400">
                  <span className={`font-medium tracking-tight leading-none ${isDual ? 'text-lg' : 'text-xl lg:text-2xl'}`}>{formattedDateForTV}</span>
                  <button onClick={() => setTvWorkouts(prev => prev.filter(w => w.id !== workoutData.id))} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-lg transition-colors flex items-center gap-1" title="Treure de la TV">
                    <Trash2 size={20} />
                  </button>
                </div>
              </header>

              <main className={`flex-1 flex ${isDual ? 'flex-col' : 'flex-col xl:flex-row'} gap-4 min-h-0`}>
                <div className={`flex flex-col gap-4 ${isDual ? '' : 'xl:w-1/2'}`}>
                  {workoutData.blocks.warmup.length > 0 && (
                    <div className="flex items-center gap-4">
                       <h2 className={`font-black text-zinc-500 uppercase tracking-widest leading-none ${isDual ? 'text-xl' : 'text-2xl'}`}>Escalfament</h2>
                       <div className="flex-1 h-px bg-white/10"></div>
                    </div>
                  )}
                  <div className="flex flex-col gap-4">
                    {workoutData.blocks.warmup.map((sub) => (
                      <div key={sub.id} className="bg-[#1c1c1e] rounded-2xl p-5 md:p-6 border border-white/5 shadow-lg">
                        <h3 className={`font-bold text-white mb-4 tracking-tight flex items-center gap-3 leading-none uppercase ${isDual ? 'text-xl' : 'text-2xl'}`}>
                          <div className={`w-2 bg-orange-500 rounded-full ${isDual ? 'h-6' : 'h-8'}`}></div>{sub.title}
                        </h3>
                        <ul className="flex flex-col gap-3">
                          {sub.exercises.map((ex, i) => (
                            <li key={i} className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0 last:pb-0">
                              <div className={`font-bold text-orange-400 shrink-0 text-right leading-none ${isDual ? 'text-lg md:text-xl w-20 md:w-24' : 'text-xl md:text-3xl w-24 md:w-32'}`}>
                                {ex.sets > 1 ? `${ex.sets}x ` : ''}{ex.reps} {ex.unit !== 'reps' ? ex.unit : ''}
                              </div>
                              <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0"></div>
                              <div className={`text-zinc-200 font-medium tracking-tight leading-tight ${isDual ? 'text-lg md:text-xl' : 'text-xl md:text-3xl'}`}>{ex.exerciseName || 'SENSE NOM'}</div>
                              {ex.notes && <div className={`text-zinc-500 ml-auto tracking-tight font-medium leading-tight text-right ${isDual ? 'text-sm md:text-base' : 'text-lg md:text-xl'}`}>{ex.notes}</div>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  
                  {(workoutData.bottomNotes || workoutData.blocks.accessories.length > 0) && (
                    <div className="bg-[#1c1c1e] rounded-2xl p-4 md:p-5 border border-white/5 flex items-center gap-4 shadow-lg">
                      <div className="bg-orange-500/10 p-3 rounded-xl shrink-0">
                        <Clock className={`text-orange-500 ${isDual ? 'w-6 h-6' : 'w-8 h-8'}`} />
                      </div>
                      <p className={`font-medium text-zinc-300 tracking-tight leading-snug ${isDual ? 'text-base md:text-lg' : 'text-xl md:text-2xl'}`}>{workoutData.bottomNotes || "Complements al finalitzar."}</p>
                    </div>
                  )}
                </div>

                <div className={`flex flex-col gap-4 ${isDual ? '' : 'xl:w-1/2'}`}>
                  {workoutData.blocks.wod.length > 0 && (
                    <div className="flex items-center gap-4">
                       <h2 className={`font-black text-zinc-500 uppercase tracking-widest leading-none ${isDual ? 'text-xl' : 'text-2xl'}`}>WOD</h2>
                       <div className="flex-1 h-px bg-white/10"></div>
                    </div>
                  )}
                  {workoutData.blocks.wod.map((wodBlock) => (
                    <div key={wodBlock.id} className="bg-[#1c1c1e] rounded-3xl p-5 md:p-8 shadow-2xl flex flex-col mb-4 last:mb-0">
                      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/5">
                        <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 md:p-4 rounded-2xl shadow-lg shadow-orange-500/20">
                           <Target className={`text-white ${isDual ? 'w-6 h-6 md:w-8 md:h-8' : 'w-8 h-8 md:w-10 md:h-10'}`} strokeWidth={2.5} />
                        </div>
                        <h2 className={`font-black tracking-tight text-white uppercase leading-none ${isDual ? 'text-2xl md:text-3xl' : 'text-3xl md:text-5xl'}`}>{wodBlock.title}</h2>
                      </div>
                      <div className="flex flex-col gap-4">
                        {wodBlock.exercises.map((ex, i) => (
                          <div key={i} className={`flex items-center gap-4 p-4 md:p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors`}>
                            <div className={`rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-white/10 shadow-inner ${isDual ? 'w-10 h-10 md:w-14 md:h-14' : 'w-14 h-14 md:w-20 md:h-20'}`}>
                              <span className={`text-orange-400 font-bold leading-none ${isDual ? 'text-xl md:text-2xl' : 'text-2xl md:text-4xl'}`}>{i + 1}</span>
                            </div>
                            <div className="flex flex-col justify-center flex-1">
                              <div className="flex items-baseline gap-3 flex-wrap">
                                <span className={`text-orange-400 font-bold leading-none ${isDual ? 'text-xl md:text-3xl' : 'text-2xl md:text-5xl'}`}>
                                  {ex.sets > 1 ? `${ex.sets}x ` : ''}{ex.reps} {ex.unit !== 'reps' ? ex.unit : ''}
                                </span>
                                <span className={`font-bold text-white tracking-tight leading-tight ${isDual ? 'text-xl md:text-3xl' : 'text-2xl md:text-5xl'}`}>{ex.exerciseName || 'SENSE NOM'}</span>
                              </div>
                              {ex.notes && <span className={`text-zinc-400 mt-2 tracking-tight font-medium leading-snug ${isDual ? 'text-sm md:text-lg' : 'text-lg md:text-2xl'}`}>{ex.notes}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </main>
            </div>
          );
        })}
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
            {tvWorkouts.length > 0 && currentView !== 'tv' && (
              <button onClick={() => setCurrentView('tv')} className="hidden lg:flex items-center gap-2 bg-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-bold animate-pulse hover:bg-orange-500">
                <MonitorPlay size={16} /> Obrir TV ({tvWorkouts.length}/2)
              </button>
            )}

            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="flex items-center justify-center p-2 hover:text-white transition-colors relative" title="Recordatoris de Tests">
                <Bell size={20} className={notificationsList.length > 0 ? 'text-white animate-bounce' : 'text-zinc-500'} />
                {notificationsList.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-zinc-950">
                    {notificationsList.length}
                  </span>
                )}
              </button>

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
                        <div key={i} className="flex border-b border-zinc-100 hover:bg-orange-50 transition-colors">
                          <button 
                            onClick={() => { 
                              setClientToOpen(rem.clientId); 
                              setCurrentView('clients'); 
                              setShowNotifications(false); 
                            }} 
                            className="w-full text-left p-4 flex flex-col gap-1"
                          >
                             <span className="text-sm font-black text-zinc-800">{rem.clientName}</span>
                             <span className="text-xs font-bold text-zinc-600">{rem.pr}</span>
                             <span className={`text-[11px] font-bold flex items-center gap-1 ${rem.isOverdue ? 'text-red-500' : (rem.isToday ? 'text-orange-500' : 'text-zinc-500')}`}>
                               {rem.isOverdue ? <><Clock size={12}/> Fora de termini ({rem.date})</> : (rem.isToday ? 'Programat per AVUI' : `Properament (${rem.date})`)}
                             </span>
                          </button>
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await setDoc(doc(db, 'clients', rem.clientId), {
                                  prReminders: { [rem.pr]: '' }
                                }, { merge: true });
                              } catch (err) { console.error(err); }
                            }}
                            className="p-4 text-zinc-400 hover:text-red-500 flex items-center justify-center transition-colors"
                            title="Marcar com a fet / Esborrar"
                          >
                            <X size={18} />
                          </button>
                        </div>
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

      <div className="flex-1 overflow-hidden bg-zinc-900 flex flex-col">
        {currentView === 'calendar' && <div className="flex-1 overflow-y-auto">{renderCalendarView()}</div>}
        {currentView === 'coach' && <div className="flex-1 overflow-y-auto">{renderCoachView()}</div>}
        {currentView === 'library' && <div className="flex-1 overflow-y-auto"><LibraryView exerciseLibrary={exerciseLibrary} saveExerciseToDB={saveExerciseToDB} /></div>}
        {currentView === 'clients' && <div className="flex-1 overflow-hidden"><ClientsView clients={clients} savedWorkouts={savedWorkouts} saveClientToDB={saveClientToDB} deleteClientFromDB={deleteClientFromDB} customPRs={customPRs} handleAddCustomPR={handleAddCustomPR} assignWorkoutToClient={assignWorkoutToClient} removeWorkoutFromClient={removeWorkoutFromClient} clientToOpen={clientToOpen} /></div>}
        {currentView === 'tv' && <div className="flex-1 overflow-y-auto">{renderTVView()}</div>}
      </div>
    </div>
  );
}