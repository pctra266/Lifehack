import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, Circle, Plus, Edit3, Trash2 } from 'lucide-react';
import './DailyGoal.css';

// Import Firebase
import { db } from '../../firebase';
import {
  collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc, query, orderBy, setDoc
} from 'firebase/firestore';

interface Goal {
  id: string;
  content: string;
  isCompleted: boolean;
  stars: number;
  createdAt: number;
}

const DailyGoal: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [note, setNote] = useState('');
  const [tempNote, setTempNote] = useState('');
  const [newGoal, setNewGoal] = useState('');

  // Lắng nghe Goals
  useEffect(() => {
    const q = query(collection(db, "daily_goals"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGoals(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Goal)));
    });
    return () => unsubscribe();
  }, []);

  // Lắng nghe Note
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "daily_notes", "user"), (d) => {
      const content = d.data()?.content ?? '';
      setNote(content);
      setTempNote(content);
    });
    return () => unsubscribe();
  }, []);

  const handleAddGoal = async () => {
    if (!newGoal.trim()) return;
    await addDoc(collection(db, "daily_goals"), {
      content: newGoal,
      isCompleted: false,
      stars: 0,
      createdAt: Date.now(),
    });
    setNewGoal('');
  };

  const toggleComplete = async (goal: Goal) => {
    await updateDoc(doc(db, "daily_goals", goal.id), { isCompleted: !goal.isCompleted });
  };

  const starGoal = async (goal: Goal) => {
    await updateDoc(doc(db, "daily_goals", goal.id), { stars: goal.stars + 1 });
  };

  const handleDeleteGoal = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa mục tiêu này không?")) {
      await deleteDoc(doc(db, "daily_goals", id));
    }
  };

  const saveNote = async () => {
    await setDoc(doc(db, "daily_notes", "user"), { content: tempNote }, { merge: true });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h2>⚡ Goal Dashboard</h2>
        </div>
      </div>

      <div className="main-content">
        {/* GHI CHÚ */}
        <div className="note-board">
          <div className="note-title"><Edit3 size={14} /> Ghi chú hôm nay</div>
          <textarea
            value={tempNote}
            onChange={(e) => setTempNote(e.target.value)}
            onBlur={saveNote}
            placeholder="Hôm nay thế nào..."
          />
        </div>

        {/* THÊM MỤC TIÊU */}
        <div className="add-goal-box">
          <input
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
            placeholder="Thêm mục tiêu mới..."
          />
          <button onClick={handleAddGoal}><Plus size={18} /></button>
        </div>

        {/* DANH SÁCH MỤC TIÊU */}
        <div className="goal-list">
          {goals.length === 0 && <p className="empty-text">Chưa có mục tiêu nào. Hãy thêm một cái!</p>}
          {goals.map((goal) => (
            <div key={goal.id} className={`goal-item ${goal.isCompleted ? 'done' : ''}`}>
              <div className="goal-left">
                <button
                  className="check-btn"
                  onClick={() => toggleComplete(goal)}
                >
                  {goal.isCompleted ? <CheckCircle size={18} color="#22c55e" /> : <Circle size={18} color="#4b5563" />}
                </button>
                <span>{goal.content}</span>
              </div>
              <div className="goal-right">
                <button onClick={() => starGoal(goal)} className="star-btn">
                  <Star size={16} color={goal.stars > 0 ? '#f59e0b' : '#4b5563'} fill={goal.stars > 0 ? '#f59e0b' : 'none'} />
                </button>
                {goal.stars > 0 && <span className="star-count">{goal.stars}</span>}
                <button onClick={() => handleDeleteGoal(goal.id)} className="delete-btn" title="Xóa">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyGoal;