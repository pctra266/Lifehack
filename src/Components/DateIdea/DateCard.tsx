import React, { useState, useEffect } from 'react';
import { RefreshCw, Heart } from 'lucide-react';
import './DateCard.css';

interface Activity {
    id: number;
    content: string;
    icon: string;
}

const allActivities: string[] = [
    'Ăn đồ vỉa hè🍲',
    'Nghe Podcast và dọn dẹp nhà cửa 🎧',
    'Lắp ráp LEGO hoặc xếp hình 1000 mảnh 🧩',
    'Viết nhật ký hoặc trang trí Bullet Journal ✍️',
    'Học một kỹ năng mới online (edit video, code...) 💻',
    'Uống nước tại một quán mới☕',
    'Nấu một món ăn mới tại nhà🍳',
    'Đi dạo hóng gió🚶',
    'Chụp một bộ ảnh kỷ niệm 📸',
    'Đi xem bảo tàng di tích lịch sử ',
    'Đi siêu thị mua sắm linh tinh 🛒',
    'Chơi board game hoặc game center 🎲',
    'Dã ngoại (picnic) ở ngoại ô 🧺',
    'Đi tô tượng 🎨',
    'Xem phim ở nhà 🎬',
];

const DateCard: React.FC = () => {
    const [cards, setCards] = useState<Activity[]>([]);
    const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

    const shuffleActivities = () => {
        setFlippedIndex(null);
        const shuffled = [...allActivities]
            .sort(() => Math.random() - 0.5)
            .slice(0, 6)
            .map((content, index) => ({ id: index, content, icon: '✨' }));
        setCards(shuffled);
    };

    useEffect(() => {
        shuffleActivities();
    }, []);

    const handleCardClick = (index: number) => {
        if (flippedIndex === null) {
            setFlippedIndex(index);
        }
    };

    return (
        <div className="date-discovery-container">
            <h1 className="title">✨ Khám phá ✨</h1>
            <p className="subtitle">Chọn một thẻ bài để xem điều bất ngờ nhé!</p>

            <div className="card-grid">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className={`card-wrapper ${flippedIndex === index ? 'flipped' : ''}`}
                        onClick={() => handleCardClick(index)}
                    >
                        <div className="card-inner">
                            <div className="card-front">
                                <div className="card-pattern">
                                    <Heart fill="#ff4081" color="#ff4081" size={40} />
                                </div>
                            </div>
                            <div className="card-back">
                                <div className="card-content">
                                    <p>{card.content}</p>
                                    <span className="love-icon">💖</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="shuffle-btn" onClick={shuffleActivities}>
                <RefreshCw size={20} /> Xáo bài mới
            </button>
        </div>
    );
};

export default DateCard;
