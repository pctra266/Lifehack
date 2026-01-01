import React, { useState } from 'react';
import { Wheel } from 'react-custom-roulette';

// Định nghĩa kiểu dữ liệu cho ô
interface WheelData {
  option: string;
  style?: { backgroundColor: string; textColor?: string };
}

// Danh sách món ăn
const data: WheelData[] = [
  { option: 'Sườn xào chua ngọt', style: { backgroundColor: '#ffffff', textColor: '#d81b60' } },
  { option: 'Chả lá lốt', style: { backgroundColor: '#ffc1e3', textColor: '#ffffff' } },
  { option: 'Thị kho trứng', style: { backgroundColor: '#ffffff', textColor: '#d81b60' } },
  { option: 'Trứng rán', style: { backgroundColor: '#ffc1e3', textColor: '#ffffff' } },
  { option: 'Thịt kho tàu', style: { backgroundColor: '#ffffff', textColor: '#d81b60' } },
  { option: 'Nem rán', style: { backgroundColor: '#ffc1e3', textColor: '#ffffff' } },
  { option: 'Mỳ tôm', style: { backgroundColor: '#ffffff', textColor: '#d81b60' } },
  { option: 'Đậu nhồi thịt', style: { backgroundColor: '#ffc1e3', textColor: '#ffffff' } },
  { option: 'Hoa bí nhồi thịt', style: { backgroundColor: '#ffffff', textColor: '#d81b60' } },
  { option: 'Cá kho thịt', style: { backgroundColor: '#ffc1e3', textColor: '#ffffff' } },
  { option: 'Thịt rang cháy cạnh', style: { backgroundColor: '#ffffff', textColor: '#d81b60' } },
  { option: 'Gà xào sả ớt', style: { backgroundColor: '#ffc1e3', textColor: '#ffffff' } }, 
];

const PinkWheel: React.FC = () => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [winMessage, setWinMessage] = useState('');
  const [showModal, setShowModal] = useState(false); // State kiểm soát Popup

  const handleSpinClick = () => {
    if (mustSpin) return;

    // Reset popup cũ nếu có
    setShowModal(false);

    // Random công bằng
    const newPrizeNumber = Math.floor(Math.random() * data.length);
    
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
    setWinMessage('');
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    setWinMessage(data[prizeNumber].option);
    setShowModal(true); // Hiển thị Popup khi dừng quay
  };

  return (
    <div style={styles.container}>
      {/* Inject Keyframes animation cho Popup */}
      <style>
        {`
          @keyframes popupScale {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>

      <h1 style={styles.title}>✨ Hôm nay nấu món gì nhỉ? ✨</h1>

      <div style={styles.wheelWrapper}>
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={data}
          
          // --- CẤU HÌNH MÀU SẮC ---
          outerBorderColor="#ffffff" 
          outerBorderWidth={8}
          innerRadius={10} 
          innerBorderColor="#ffffff"
          innerBorderWidth={4}
          radiusLineColor="#ffffff"
          radiusLineWidth={2}
          
          // Font chữ
          fontFamily="Arial"
          fontSize={16}
          perpendicularText={false}
          
          // Tốc độ
          spinDuration={0.8}
          onStopSpinning={handleStopSpinning}
        />
        
        <button 
          onClick={handleSpinClick} 
          style={mustSpin ? styles.disabledButton : styles.button} 
          disabled={mustSpin}
        >
          {mustSpin ? 'Đang chọn...' : 'Start now :3'}
        </button>
      </div>

      {/* --- PHẦN POPUP (MODAL) --- */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modalContent}>
            <h2 style={{ color: '#888', margin: '0 0 10px 0', fontSize: '1.2rem' }}>
              Hôm nay em phải nấu món:
            </h2>
            <h1 style={{ color: '#d81b60', fontSize: '2.5rem', margin: '10px 0' }}>
              {winMessage}
            </h1>
            <div style={{ fontSize: '3rem', margin: '10px 0' }}>😋</div>
            
            <button 
              onClick={() => setShowModal(false)}
              style={styles.closeButton}
            >
              Tuyệt vời ❤️
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// CSS in JS
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #ffe6fa 0%, #ffffff 100%)', 
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: '20px',
  },
  title: {
    color: '#d81b60', 
    marginBottom: '20px',
    textShadow: '2px 2px 0px white',
    fontSize: '2rem',
  },
  wheelWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    filter: 'drop-shadow(0 10px 15px rgba(255, 105, 180, 0.3))',
  },
  pointer: {
    position: 'absolute',
    top: '-25px',
    zIndex: 10,
    fontSize: '50px',
    color: '#ff4081',
    filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))',
  },
  button: {
    marginTop: '30px',
    padding: '15px 50px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    backgroundColor: '#ff4081', 
    color: 'white',
    border: '4px solid white',
    borderRadius: '50px',
    boxShadow: '0 4px 10px rgba(255, 64, 129, 0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    outline: 'none',
  },
  disabledButton: {
    marginTop: '30px',
    padding: '15px 50px',
    fontSize: '18px',
    fontWeight: 'bold',
    backgroundColor: '#ffc1e3',
    color: 'white',
    border: '4px solid white',
    borderRadius: '50px',
    cursor: 'not-allowed',
  },
  // --- Style cho Popup ---
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', // Nền tối mờ
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '25px',
    textAlign: 'center',
    maxWidth: '90%',
    width: '350px',
    border: '4px solid #ffc1e3',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    animation: 'popupScale 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Hiệu ứng bung
  },
  closeButton: {
    marginTop: '20px',
    padding: '10px 30px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    backgroundColor: '#ff4081',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    boxShadow: '0 4px 6px rgba(255, 64, 129, 0.3)',
  }
};

export default PinkWheel;