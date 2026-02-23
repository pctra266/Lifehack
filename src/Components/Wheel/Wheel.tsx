import React, { useState } from 'react';
import { Wheel } from 'react-custom-roulette';

interface WheelData {
  option: string;
  style?: { backgroundColor: string; textColor?: string };
}

const data: WheelData[] = [
  { option: 'Sườn xào chua ngọt', style: { backgroundColor: '#1e1e3f', textColor: '#e2e8f0' } },
  { option: 'Chả lá lốt', style: { backgroundColor: '#16213e', textColor: '#a78bfa' } },
  { option: 'Thịt kho trứng', style: { backgroundColor: '#1e1e3f', textColor: '#e2e8f0' } },
  { option: 'Trứng rán', style: { backgroundColor: '#16213e', textColor: '#a78bfa' } },
  { option: 'Thịt kho tàu', style: { backgroundColor: '#1e1e3f', textColor: '#e2e8f0' } },
  { option: 'Nem rán', style: { backgroundColor: '#16213e', textColor: '#a78bfa' } },
  { option: 'Mỳ tôm', style: { backgroundColor: '#1e1e3f', textColor: '#e2e8f0' } },
  { option: 'Đậu nhồi thịt', style: { backgroundColor: '#16213e', textColor: '#a78bfa' } },
  { option: 'Hoa bí nhồi thịt', style: { backgroundColor: '#1e1e3f', textColor: '#e2e8f0' } },
  { option: 'Cá kho thịt', style: { backgroundColor: '#16213e', textColor: '#a78bfa' } },
  { option: 'Thịt rang cháy cạnh', style: { backgroundColor: '#1e1e3f', textColor: '#e2e8f0' } },
  { option: 'Gà xào sả ớt', style: { backgroundColor: '#16213e', textColor: '#a78bfa' } },
];

const PinkWheel: React.FC = () => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [winMessage, setWinMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSpinClick = () => {
    if (mustSpin) return;
    setShowModal(false);
    const newPrizeNumber = Math.floor(Math.random() * data.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
    setWinMessage('');
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    setWinMessage(data[prizeNumber].option);
    setShowModal(true);
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes popupScale {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>

      <h1 style={styles.title}>🎡 Quay Số Hôm Nay</h1>

      <div style={styles.wheelWrapper}>
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={data}
          outerBorderColor="#2d2d5e"
          outerBorderWidth={8}
          innerRadius={10}
          innerBorderColor="#2d2d5e"
          innerBorderWidth={4}
          radiusLineColor="#2d2d5e"
          radiusLineWidth={2}
          fontFamily="Arial"
          fontSize={16}
          perpendicularText={false}
          spinDuration={0.8}
          onStopSpinning={handleStopSpinning}
        />
        
        <button 
          onClick={handleSpinClick} 
          style={mustSpin ? styles.disabledButton : styles.button} 
          disabled={mustSpin}
        >
          {mustSpin ? 'Đang chọn...' : 'Quay ngay ✨'}
        </button>
      </div>

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modalContent}>
               <>
                  <div style={{ margin: '15px 0', border: '2px dashed #4f46e5', padding: '10px', borderRadius: '15px', backgroundColor: '#1e1e3f' }}>
                    <h1 style={{ color: '#a78bfa', fontSize: '1rem', margin: '0' }}>
                      Hôm nay nấu món: {winMessage}
                    </h1>
                    <span style={{ fontSize: '3rem' }}>😼😼😼</span>
                  </div>
               </>
            <button 
              onClick={() => setShowModal(false)}
              style={styles.closeButton}
            >
              OK ✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0d0d0d 0%, #1a1a2e 100%)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: '20px',
  },
  title: {
    color: '#a78bfa',
    marginBottom: '20px',
    textShadow: '0 0 20px rgba(167, 139, 250, 0.4)',
    fontSize: '2rem',
    textAlign: 'center',
  },
  wheelWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    filter: 'drop-shadow(0 10px 15px rgba(124, 58, 237, 0.3))',
  },
  button: {
    marginTop: '30px',
    padding: '15px 50px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    backgroundColor: '#7c3aed',
    color: 'white',
    border: '2px solid #5b21b6',
    borderRadius: '50px',
    boxShadow: '0 4px 15px rgba(124, 58, 237, 0.5)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    outline: 'none',
  },
  disabledButton: {
    marginTop: '30px',
    padding: '15px 50px',
    fontSize: '18px',
    fontWeight: 'bold',
    backgroundColor: '#3730a3',
    color: '#a5b4fc',
    border: '2px solid #312e81',
    borderRadius: '50px',
    cursor: 'not-allowed',
  },
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#13131f',
    padding: '30px',
    borderRadius: '25px',
    textAlign: 'center',
    maxWidth: '90%',
    width: '380px',
    border: '2px solid #3f3f6e',
    boxShadow: '0 10px 40px rgba(124, 58, 237, 0.3)',
    animation: 'popupScale 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  closeButton: {
    marginTop: '10px',
    padding: '10px 30px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    backgroundColor: '#7c3aed',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    boxShadow: '0 4px 10px rgba(124, 58, 237, 0.4)',
  }
};

export default PinkWheel;