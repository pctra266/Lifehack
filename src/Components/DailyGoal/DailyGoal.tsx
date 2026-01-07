import React, { useState, useEffect } from 'react';
import { Heart, CheckCircle, Circle, Plus, Edit3, User, LogOut, Trash2 } from 'lucide-react'; // Thêm Trash2
import './DailyGoal.css';

// Import Firebase
import { db } from '../../firebase'; 
import { 
  collection, addDoc, onSnapshot, updateDoc, setDoc, deleteDoc, doc, query, orderBy 
} from 'firebase/firestore'; // Thêm deleteDoc

interface Goal {
  id: string;
  content: string;
  isCompleted: boolean;
  cheers: number;
  createdAt: number;
  creatorRole: string;
}

const DailyGoal: React.FC = () => {
  // --- STATE QUẢN LÝ NGƯỜI DÙNG ---
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem('love_role');
    if (savedRole) {
      setCurrentUser(savedRole);
    }
  }, []);

  const handleSelectRole = (role: string) => {
    localStorage.setItem('love_role', role);
    setCurrentUser(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('love_role');
    setCurrentUser(null);
  };

  // --- MÀN HÌNH CHÀO (CHỌN VAI TRÒ) ---
  if (!currentUser) {
    return (
      <div className="welcome-container">
        <div className="welcome-box">
          <div className="role-buttons">
            <button className="role-btn boy" onClick={() => handleSelectRole('boy')}>
              👦 Trang của anh
            </button>
            <button className="role-btn girl" onClick={() => handleSelectRole('girl')}>
              👧 Trang của em
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <MainDashboard currentUser={currentUser} onLogout={handleLogout} />;
};

// --- DASHBOARD CHÍNH ---
const MainDashboard: React.FC<{ currentUser: string, onLogout: () => void }> = ({ currentUser, onLogout }) => {
  const MY_ROLE = currentUser; // 'boy' hoặc 'girl'
  const PARTNER_ROLE = MY_ROLE === 'boy' ? 'girl' : 'boy';

  // Helper để hiển thị tên hiển thị (Display Name)
  const getDisplayName = (role: string) => (role === 'boy' ? 'Anh' : 'Em');

  const [goals, setGoals] = useState<Goal[]>([]);
  const [notes, setNotes] = useState<{ [key: string]: string }>({ [MY_ROLE]: '', [PARTNER_ROLE]: '' });
  const [newGoal, setNewGoal] = useState('');
  const [myTempNote, setMyTempNote] = useState(''); 

  // 1. Lắng nghe Goals
  useEffect(() => {
    const q = query(collection(db, "daily_goals"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal)));
    });
    return () => unsubscribe();
  }, []);

  // 2. Lắng nghe Notes
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "daily_notes"), (snapshot) => {
      const loadedNotes: { [key: string]: string } = {};
      snapshot.forEach((doc) => {
        loadedNotes[doc.id] = doc.data().content;
      });
      setNotes(prev => ({ ...prev, ...loadedNotes }));
      
      if (loadedNotes[MY_ROLE] !== undefined) {
         setMyTempNote(loadedNotes[MY_ROLE]);
      }
    });
    return () => unsubscribe();
  }, [MY_ROLE]);

  const handleAddGoal = async () => {
    if (!newGoal.trim()) return;
    await addDoc(collection(db, "daily_goals"), {
      content: newGoal,
      isCompleted: false,
      cheers: 0,
      createdAt: Date.now(),
      creatorRole: MY_ROLE,
    });
    setNewGoal('');
  };

  const toggleComplete = async (goal: Goal) => {
    if (goal.creatorRole !== MY_ROLE) return; 
    await updateDoc(doc(db, "daily_goals", goal.id), { isCompleted: !goal.isCompleted });
  };

  const cheerGoal = async (goal: Goal) => {
    await updateDoc(doc(db, "daily_goals", goal.id), { cheers: goal.cheers + 1 });
  };

  // --- HÀM XÓA MỤC TIÊU MỚI ---
  const handleDeleteGoal = async (id: string) => {
    // Hỏi xác nhận trước khi xóa để tránh lỡ tay
    if (window.confirm("Bạn có chắc muốn xóa mục tiêu này không?")) {
      await deleteDoc(doc(db, "daily_goals", id));
    }
  };

  const saveMyNote = async () => {
    await setDoc(doc(db, "daily_notes", MY_ROLE), { content: myTempNote }, { merge: true });
  };

  const myGoals = goals.filter(g => g.creatorRole === MY_ROLE);
  const partnerGoals = goals.filter(g => g.creatorRole === PARTNER_ROLE);

  const GoalList = ({ list, isMine }: { list: Goal[], isMine: boolean }) => (
    <div className="goal-list-mini">
      {list.length === 0 && <p className="empty-text">Chưa có mục tiêu nào.</p>}
      {list.map((goal) => (
        <div key={goal.id} className={`goal-item-mini ${goal.isCompleted ? 'done' : ''}`}>
          <div className="goal-left">
            <button 
              className={`check-btn-mini ${!isMine ? 'disabled' : ''}`}
              onClick={() => isMine && toggleComplete(goal)}
              disabled={!isMine}
            >
              {goal.isCompleted ? <CheckCircle size={18} color="#22c55e" /> : <Circle size={18} color="#d1d5db" />}
            </button>
            <span>{goal.content}</span>
          </div>
          <div className="goal-right">
            {/* Nếu là của mình thì hiện nút xóa */}
            {isMine && (
              <button onClick={() => handleDeleteGoal(goal.id)} className="delete-btn" title="Xóa">
                <Trash2 size={16} />
              </button>
            )}

            {/* Nếu không phải của mình thì hiện nút thả tim */}
            {!isMine && (
              <button onClick={() => cheerGoal(goal)} className="cheer-btn">
                <Heart size={16} color={goal.cheers > 0 ? '#ec4899' : '#9ca3af'} fill={goal.cheers > 0 ? '#ec4899' : 'none'}/>
              </button>
            )}
            
            {/* Hiển thị số lượt tim */}
            {goal.cheers > 0 && <span className="cheer-count">{goal.cheers}</span>}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
           <h2>Goal Dashboard</h2>
           <div className="user-badge">
             <User size={14}/> 
             Đăng xuất
             <button onClick={onLogout} className="logout-btn" title="Đổi người dùng"><LogOut size={14}/></button>
           </div>
        </div>
      </div>

      <div className="main-grid">
        <div className="column my-column">
          <div className="column-header">
            <h3>{getDisplayName(MY_ROLE)} (Tôi)</h3>
          </div>
          
          <div className="note-board my-note">
            <div className="note-title"><Edit3 size={14}/> Ghi chú của tôi</div>
            <textarea
              value={myTempNote}
              onChange={(e) => setMyTempNote(e.target.value)}
              onBlur={saveMyNote}
              placeholder={`Hôm nay thế nào...`}
            />
          </div>

          <div className="add-goal-box">
             <input 
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                placeholder="Thêm mục tiêu..."
             />
             <button onClick={handleAddGoal}><Plus size={18}/></button>
          </div>

          <GoalList list={myGoals} isMine={true} />
        </div>

        {/* CỘT NGƯỜI YÊU */}
        <div className="column partner-column">
          <div className="column-header">
            <h3>{getDisplayName(PARTNER_ROLE)}</h3>
          </div>

          <div className="note-board partner-note">
             <div className="note-title">Lời nhắn :</div>
             <div className="note-content-display">
               {notes[PARTNER_ROLE] || "Chưa có ghi chú nào..."}
             </div>
          </div>

          <GoalList list={partnerGoals} isMine={false} />
        </div>
      </div>
    </div>
  );
};

export default DailyGoal;