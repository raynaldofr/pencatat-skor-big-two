import React, { useState, useEffect } from 'react';

// Fungsi untuk mendapatkan state awal dari localStorage
const getInitialState = () => {
  try {
    const savedState = localStorage.getItem('bigTwoScoreApp');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      // Pastikan semua properti yang diharapkan ada, jika tidak, gunakan default
      return {
        players: parsedState.players || [],
        gameStarted: parsedState.gameStarted || false,
        currentRound: parsedState.currentRound || 1,
        currentChapter: parsedState.currentChapter || 1,
        chapterSummaries: parsedState.chapterSummaries || [],
        roundHistory: parsedState.roundHistory || [],
        // Inisialisasi semua temporary inputs dari savedState atau default
        tempPlayerName: parsedState.tempPlayerName || '',
        winnerId: parsedState.winnerId || '',
        winnerClosingType: parsedState.winnerClosingType || '',
        winnerBonus2s: parsedState.winnerBonus2s || { diamond2: false, club2: false, heart2: false, spade2: false },
        winnerSpecialHands: parsedState.winnerSpecialHands || { royalStraightFlush: false, fourOfAKind: false, others: false, otherPoints: 0 },
        loserInputs: parsedState.loserInputs || {},
        manualPointsTemp: parsedState.manualPointsTemp || {},
      };
    }
  } catch (error) {
    console.error("Failed to load state from localStorage:", error);
  }
  // Default state jika tidak ada yang tersimpan atau ada error
  return {
    players: [],
    gameStarted: false,
    currentRound: 1,
    currentChapter: 1,
    chapterSummaries: [],
    roundHistory: [],
    tempPlayerName: '',
    winnerId: '',
    winnerClosingType: '',
    winnerBonus2s: { diamond2: false, club2: false, heart2: false, spade2: false },
    winnerSpecialHands: { royalStraightFlush: false, fourOfAKind: false, others: false, otherPoints: 0 },
    loserInputs: {},
    manualPointsTemp: {},
  };
};

// Main App Component
const App = () => {
  // Menggunakan fungsi getInitialState untuk inisialisasi state
  const initialState = getInitialState();

  const [players, setPlayers] = useState(initialState.players);
  const [gameStarted, setGameStarted] = useState(initialState.gameStarted);
  const [currentRound, setCurrentRound] = useState(initialState.currentRound);
  const [currentChapter, setCurrentChapter] = useState(initialState.currentChapter);
  const [chapterSummaries, setChapterSummaries] = useState(initialState.chapterSummaries);
  const [roundHistory, setRoundHistory] = useState(initialState.roundHistory);

  const [message, setMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => () => {});

  const [showChapterEndModal, setShowChapterEndModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showRoundHistoryModal, setShowRoundHistoryModal] = useState(false);
  const [showAddManualPointsModal, setShowAddManualPointsModal] = useState(false);

  // Temporary states for forms, now initialized directly from initialState
  const [tempPlayerName, setTempPlayerName] = useState(initialState.tempPlayerName);
  const [winnerId, setWinnerId] = useState(initialState.winnerId);
  const [winnerClosingType, setWinnerClosingType] = useState(initialState.winnerClosingType);
  const [winnerBonus2s, setWinnerBonus2s] = useState(initialState.winnerBonus2s);
  const [winnerSpecialHands, setWinnerSpecialHands] = useState(initialState.winnerSpecialHands);
  const [loserInputs, setLoserInputs] = useState(initialState.loserInputs);
  const [manualPointsTemp, setManualPointsTemp] = useState(initialState.manualPointsTemp);


  // Effect untuk menyimpan state ke localStorage setiap kali ada perubahan penting
  useEffect(() => {
    const stateToSave = {
      players,
      gameStarted,
      currentRound,
      currentChapter,
      chapterSummaries,
      roundHistory,
      // Simpan juga temporary inputs agar tidak reset saat refresh
      tempPlayerName,
      winnerId,
      winnerClosingType,
      winnerBonus2s,
      winnerSpecialHands,
      loserInputs,
      manualPointsTemp,
    };
    localStorage.setItem('bigTwoScoreApp', JSON.stringify(stateToSave));
  }, [players, gameStarted, currentRound, currentChapter, chapterSummaries, roundHistory, tempPlayerName, winnerId, winnerClosingType, winnerBonus2s, winnerSpecialHands, loserInputs, manualPointsTemp]);

  // Effect untuk menginisialisasi loserInputs dan manualPointsTemp saat players berubah (misal: pemain ditambah/dihapus)
  useEffect(() => {
    const newLoserInputs = {};
    const newManualPointsTemp = {};
    players.forEach(player => {
      // Preserve existing data if available, otherwise initialize with full structure
      newLoserInputs[player.id] = {
        remainingCards: loserInputs[player.id]?.remainingCards || 0,
        bonus2s: loserInputs[player.id]?.bonus2s || { diamond2: false, club2: false, heart2: false, spade2: false },
        specialHands: loserInputs[player.id]?.specialHands || { royalStraightFlush: false, fourOfAKind: false, others: false, otherPoints: 0 },
      };
      newManualPointsTemp[player.id] = manualPointsTemp[player.id] || 0;
    });
    setLoserInputs(newLoserInputs);
    setManualPointsTemp(newManualPointsTemp);
  }, [players]); // Dependency array includes players, so it runs when players array changes.


  // Effect untuk memberikan peringatan sebelum refresh/menutup tab
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (gameStarted) { // Hanya berikan peringatan jika permainan sedang berjalan
        event.returnValue = 'Data permainan Anda mungkin hilang jika Anda me-refresh atau menutup halaman. Apakah Anda yakin ingin melanjutkan?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [gameStarted]);


  // Fungsi untuk menampilkan pesan (alert kustom)
  const showAlert = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // Fungsi untuk menampilkan modal konfirmasi umum
  const showCustomConfirm = (msg, onConfirm) => {
    setMessage(msg);
    setConfirmAction(() => {
      return () => {
        onConfirm();
        setShowConfirmModal(false);
        setMessage('');
      };
    });
    setShowConfirmModal(true);
  };

  // Fungsi untuk menambahkan pemain baru
  const addPlayer = () => {
    if (tempPlayerName.trim() === '') {
      showAlert('Nama pemain tidak boleh kosong!');
      return;
    }
    if (players.length >= 4) {
      showAlert('Maksimal 4 pemain untuk Big Two.');
      return;
    }
    const newPlayer = {
      id: `player_${Date.now()}`,
      name: tempPlayerName.trim(),
      score: 0,
    };
    setPlayers([...players, newPlayer]);
    setTempPlayerName('');
  };

  // Fungsi untuk menghapus pemain
  const removePlayer = (idToRemove) => {
    setPlayers(players.filter(player => player.id !== idToRemove));
  };

  // Fungsi untuk memulai permainan
  const startGame = () => {
    if (players.length < 2) {
      showAlert('Minimal 2 pemain diperlukan untuk memulai permainan.');
      return;
    }
    setGameStarted(true);
    setCurrentRound(1);
    setCurrentChapter(1);
    setChapterSummaries([]);
    setRoundHistory([]);
  };

  // Fungsi untuk mereset semua input form putaran
  const resetRoundForm = () => {
    setWinnerId('');
    setWinnerClosingType('');
    setWinnerBonus2s({
      diamond2: false, club2: false, heart2: false, spade2: false,
    });
    setWinnerSpecialHands({
      royalStraightFlush: false, fourOfAKind: false, others: false, otherPoints: 0,
    });
    const resetLoserInputs = {};
    players.forEach(player => {
      resetLoserInputs[player.id] = {
        remainingCards: 0,
        bonus2s: {
          diamond2: false, club2: false, heart2: false, spade2: false,
        },
        specialHands: {
          royalStraightFlush: false, fourOfAKind: false, others: false, otherPoints: 0,
        },
      };
    });
    setLoserInputs(resetLoserInputs);
  };

  // Fungsi untuk menghitung poin pemenang
  const calculateWinnerPoints = () => {
    let regularPoints = 0;
    let specialBonusPoints = 0;

    if (winnerClosingType === '1_card') regularPoints += 5;
    else if (winnerClosingType === 'pair') regularPoints += 10;
    else if (winnerClosingType === '3_cards') regularPoints += 15;
    else if (winnerClosingType === 'set_5') regularPoints += 25;
    else if (winnerClosingType === 'dragon') regularPoints += 65;

    if (winnerBonus2s.diamond2) regularPoints += 5;
    if (winnerBonus2s.club2) regularPoints += 7;
    if (winnerBonus2s.heart2) regularPoints += 9;
    if (winnerBonus2s.spade2) regularPoints += 11;

    if (winnerSpecialHands.royalStraightFlush) specialBonusPoints += 30;
    if (winnerSpecialHands.fourOfAKind) specialBonusPoints += 20;
    if (winnerSpecialHands.others) specialBonusPoints += parseInt(winnerSpecialHands.otherPoints || 0);

    return { regular: regularPoints, bonus: specialBonusPoints, total: regularPoints + specialBonusPoints };
  };

  // Fungsi untuk menghitung poin pemain yang kalah
  const calculateLoserPoints = (playerId) => {
    const loserInput = loserInputs[playerId];
    if (!loserInput) return { regular: 0, bonus: 0, total: 0 };

    const totalCardsLeft = parseInt(loserInput.remainingCards, 10);
    let pointsFromCards = 0;
    let specialBonusPoints = 0;

    if (totalCardsLeft > 0) {
        let nonSpecialCardsCount = totalCardsLeft;
        let pointsFrom2sValue = 0;

        if (loserInput.bonus2s.diamond2) { nonSpecialCardsCount--; pointsFrom2sValue += 5; }
        if (loserInput.bonus2s.club2) { nonSpecialCardsCount--; pointsFrom2sValue += 7; }
        if (loserInput.bonus2s.heart2) { nonSpecialCardsCount--; pointsFrom2sValue += 9; }
        if (loserInput.bonus2s.spade2) { nonSpecialCardsCount--; pointsFrom2sValue += 11; }

        let basePointsBeforeMultiplier = (nonSpecialCardsCount * -1) - pointsFrom2sValue;

        let multiplier = 1;
        if (totalCardsLeft >= 7 && totalCardsLeft <= 8) {
            multiplier = 2;
        } else if (totalCardsLeft >= 9 && totalCardsLeft <= 11) {
            multiplier = 3;
        } else if (totalCardsLeft === 12) {
            multiplier = 4;
        } else if (totalCardsLeft === 13) {
            multiplier = 5;
        }
        pointsFromCards = basePointsBeforeMultiplier * multiplier;
    }

    if (loserInput.specialHands.royalStraightFlush) specialBonusPoints += 30;
    if (loserInput.specialHands.fourOfAKind) specialBonusPoints += 20;
    if (loserInput.specialHands.others) specialBonusPoints += parseInt(loserInput.specialHands.otherPoints || 0);

    return { regular: pointsFromCards, bonus: specialBonusPoints, total: pointsFromCards + specialBonusPoints };
  };

  // Fungsi untuk menerapkan skor putaran ke total skor pemain
  const applyRoundScores = () => {
    if (!winnerId) {
      showAlert('Pilih pemenang terlebih dahulu!');
      return;
    }

    const currentRoundScoresBreakdown = {};
    const newPlayersState = players.map(player => {
      let roundScoreBreakdown;
      if (player.id === winnerId) {
        roundScoreBreakdown = calculateWinnerPoints();
      } else {
        roundScoreBreakdown = calculateLoserPoints(player.id);
      }
      currentRoundScoresBreakdown[player.id] = roundScoreBreakdown;
      return { ...player, score: player.score + roundScoreBreakdown.total };
    });

    const newRoundEntry = {
      chapter: currentChapter,
      round: currentRound,
      winnerId: winnerId,
      winnerName: players.find(p => p.id === winnerId)?.name || 'N/A',
      playerScoresBreakdown: currentRoundScoresBreakdown,
      totalScoresSnapshot: newPlayersState.reduce((acc, player) => {
        acc[player.name] = player.score;
        return acc;
      }, {})
    };

    setRoundHistory(prev => [...prev, newRoundEntry]);
    setPlayers(newPlayersState);
    resetRoundForm();
    showAlert('Skor putaran berhasil ditambahkan!');

    if (currentRound === 13) {
      const currentChapterSummary = {
        chapter: currentChapter,
        scores: newPlayersState.reduce((acc, player) => {
          acc[player.name] = player.score;
          return acc;
        }, {})
      };
      setChapterSummaries(prev => [...prev, currentChapterSummary]);
      setShowChapterEndModal(true);
    } else {
      setCurrentRound(prev => prev + 1);
    }
  };

  // Fungsi untuk melanjutkan ke babak berikutnya
  const continueToNextChapter = () => {
    setShowChapterEndModal(false);
    setCurrentChapter(prev => prev + 1);
    setCurrentRound(1);
    showAlert(`Memulai Babak ${currentChapter + 1}!`);
  };

  // Fungsi untuk mereset seluruh permainan
  const resetGame = () => {
    showCustomConfirm(
      "Apakah Anda yakin ingin mereset seluruh permainan? Semua skor akan kembali ke nol, riwayat babak akan dihapus, dan Anda akan kembali ke pengaturan pemain.",
      () => {
        setPlayers([]);
        setGameStarted(false);
        setCurrentRound(1);
        setCurrentChapter(1);
        setChapterSummaries([]);
        setRoundHistory([]);
        resetRoundForm();
        showAlert('Permainan berhasil direset!');
      }
    );
  };

  // Handler untuk mengubah jumlah kartu sisa
  const handleRemainingCardsChange = (playerId, value) => {
    const parsedValue = parseInt(value, 10);
    const newValue = isNaN(parsedValue) ? 0 : Math.max(0, Math.min(13, parsedValue));
    setLoserInputs(prev => ({
      ...prev,
      [playerId]: { ...prev[playerId], remainingCards: newValue }
    }));
  };

  // Handler untuk menambah/mengurangi jumlah kartu sisa
  const adjustRemainingCards = (playerId, delta) => {
    setLoserInputs(prev => {
      const currentCount = parseInt(prev[playerId]?.remainingCards || 0, 10);
      const newCount = Math.max(0, Math.min(13, currentCount + delta));
      return {
        ...prev,
        [playerId]: { ...prev[playerId], remainingCards: newCount }
      };
    });
  };

  // Handler untuk mengubah bonus spesial pemain kalah
  const handleLoserSpecialHandChange = (playerId, handType, value) => {
    setLoserInputs(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        specialHands: {
          ...prev[playerId]?.specialHands,
          [handType]: value
        }
      }
    }));
  };

  // Fungsi untuk membuka modal penambahan poin manual
  const openAddManualPointsModal = () => {
    setShowAddManualPointsModal(true);
    const initialManualPoints = {};
    players.forEach(player => {
      initialManualPoints[player.id] = 0;
    });
    setManualPointsTemp(initialManualPoints);
  };

  // Fungsi untuk mengubah poin manual di modal penambahan poin
  const handleManualAddPointsChange = (playerId, value) => {
    setManualPointsTemp(prev => ({
      ...prev,
      [playerId]: parseInt(value) || 0
    }));
  };

  // Fungsi untuk menerapkan penambahan poin manual
  const applyManualPoints = () => {
    const newPlayers = players.map(player => {
      const pointsToAdd = manualPointsTemp[player.id] || 0;
      return { ...player, score: player.score + pointsToAdd };
    });
    setPlayers(newPlayers);
    setShowAddManualPointsModal(false);
    showAlert('Poin manual berhasil ditambahkan!');
    setManualPointsTemp({});
  };

  // Helper function to display 0 as '-'
  const formatScore = (score) => {
    return score === 0 ? '-' : score;
  };

  // Helper function to get text color based on score value
  const getScoreTextColor = (score) => {
    if (score > 0) return 'text-green-400';
    if (score < 0) return 'text-red-400';
    return 'text-gray-400'; // For zero
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A202C] to-[#2D3748] p-4 sm:p-8 font-inter text-gray-200 flex flex-col items-center"> {/* Darker background */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; }
          .animate-fade-in-down {
            animation: fadeInDown 0.5s ease-out forwards;
          }
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          /* Custom checkbox/radio styling - Hiding native inputs */
          input[type="checkbox"], input[type="radio"] {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            position: absolute;
            width: 1px;
            height: 1px;
            margin: -1px;
            padding: 0;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            border: 0;
            white-space: nowrap;
          }

          /* Base style for the custom visual indicator (the span right after the hidden input) */
          .custom-radio-visual, .custom-checkbox-visual {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 1.25rem; /* 20px */
            height: 1.25rem; /* 20px */
            border: 2px solid #66FCF1; /* Cyan-ish border */
            transition: all 0.2s ease-in-out;
            flex-shrink: 0; /* Prevent it from shrinking */
          }

          .custom-radio-visual {
            border-radius: 50%; /* rounded-full */
          }

          .custom-checkbox-visual {
            border-radius: 0.25rem; /* rounded-md */
          }

          /* Inner circle for radio, checkmark for checkbox (initially hidden) */
          .custom-radio-visual::after {
            content: '';
            width: 0.75rem; /* w-3 */
            height: 0.75rem; /* h-3 */
            border-radius: 50%;
            background-color: #66FCF1; /* Cyan-ish inner */
            opacity: 0;
            transition: opacity 0.2s ease-in-out;
          }

          .custom-checkbox-visual::after {
            content: '✔';
            position: absolute;
            color: #66FCF1; /* Cyan-ish checkmark */
            font-size: 0.75rem; /* text-xs */
            opacity: 0;
            transition: opacity 0.2s ease-in-out;
          }

          /* Styles when the hidden input is checked (using peer-checked on the sibling visual) */
          /* The background and border color of the visual indicator when checked */
          input[type="radio"]:checked + .custom-radio-visual,
          input[type="checkbox"]:checked + .custom-checkbox-visual {
            background-color: #66FCF1; /* Cyan-ish fill when checked */
            border-color: #66FCF1; /* Cyan-ish border when checked */
          }

          /* Show the inner circle/checkmark when checked */
          input[type="radio"]:checked + .custom-radio-visual::after,
          input[type="checkbox"]:checked + .custom-checkbox-visual::after {
            opacity: 1;
          }

          /* Focus styles for the visual indicator (when native input is focused) */
          input[type="radio"]:focus + .custom-radio-visual,
          input[type="checkbox"]:focus + .custom-checkbox-visual {
            box-shadow: 0 0 0 3px rgba(102, 252, 241, 0.5); /* focus:ring-cyan-300 */
          }
        `}
      </style>

      {/* Custom Alert/Message */}
      {message && !showConfirmModal && !showChapterEndModal && !showRulesModal && !showRoundHistoryModal && !showAddManualPointsModal && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-[#66FCF1] text-gray-900 py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-down font-bold">
          {message}
        </div>
      )}

      {/* Custom Confirmation Modal (General) */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl text-gray-200 max-w-sm w-full mx-auto transform scale-105 transition-transform duration-300 ease-out border border-gray-700">
            <p className="mb-6 text-lg font-semibold text-gray-200 text-center">{message}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setMessage('');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-gray-200 font-bold py-3 px-6 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105"
              >
                Batal
              </button>
              <button
                onClick={confirmAction}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chapter End Summary Modal */}
      {showChapterEndModal && chapterSummaries.length > 0 && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity:75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl text-gray-200 max-w-md w-full mx-auto transform scale-105 transition-transform duration-300 ease-out border border-gray-700">
            <h2 className="text-3xl font-bold text-center text-[#66FCF1] mb-4">Babak {currentChapter} Berakhir!</h2>
            <p className="text-center text-lg mb-6 text-gray-300">Ringkasan Skor Babak {currentChapter}:</p>
            <div className="overflow-x-auto mb-6 rounded-lg border border-gray-700">
              <table className="min-w-full bg-gray-900">
                <thead className="bg-gray-700 border-b border-gray-600">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-[#66FCF1] uppercase tracking-wider rounded-tl-lg">Pemain</th>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-[#66FCF1] uppercase tracking-wider rounded-tr-lg">Skor</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(chapterSummaries[chapterSummaries.length - 1].scores)
                        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA) // Sort by score descending
                        .map(([playerName, score], index) => (
                      <tr key={playerName} className={`${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'} border-b border-gray-700 last:border-b-0`}>
                        <td className="py-3 px-4 text-left text-gray-200 font-medium">{playerName}</td>
                        <td className="py-3 px-4 text-right text-[#66FCF1] font-bold text-lg">{score}</td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={continueToNextChapter}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                Lanjutkan ke Babak {currentChapter + 1}
              </button>
              <button
                onClick={resetGame} // Opsi untuk mereset seluruh permainan
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                Akhiri Permainan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl text-gray-200 max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto transform scale-105 transition-transform duration-300 ease-out border border-gray-700">
            <h2 className="text-3xl font-bold text-center text-[#66FCF1] mb-6">Aturan Permainan Big Two</h2>
            <div className="text-base leading-relaxed text-gray-300">
              <h3 className="text-xl font-semibold text-[#66FCF1] mb-3">Pemenang (Tutup Kartu):</h3>
              <ul className="list-disc list-inside mb-5 pl-4">
                <li>**Tutup 1 Kartu:** +5 poin</li>
                <li>**Tutup Pair (2 Kartu):** +10 poin</li>
                <li>**Tutup 3 Kartu:** +15 poin</li>
                <li>**Tutup Set 5 (Straight, Full House, Flush - 5 Kartu):** +25 poin</li>
                <li>**Tutup Dragon (13 Kartu Berurut):** +65 poin</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#66FCF1] mb-3">Bonus Kartu '2' dalam Set Pemenang (jika ada):</h3>
              <ul className="list-disc list-inside mb-5 pl-4">
                <li>Ada 2 ♦ (Wajik): Tambah +5 poin</li>
                <li>Ada 2 ♣ (Keriting): Tambah +7 poin</li>
                <li>Ada 2 ♥ (Hati): Tambah +9 poin</li>
                <li>Ada 2 ♠ (Skop): Tambah +11 poin</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#66FCF1] mb-3">Bonus Kartu Spesial (Tambahan Poin di Putaran Itu):</h3>
              <ul className="list-disc list-inside mb-5 pl-4">
                <li>**Straight Flush:** Tambah +30 poin</li>
                <li>**4 of a Kind:** Tambah +20 poin</li>
                <li>**Lainnya:** Poin sesuai input</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#66FCF1] mb-3">Poin Minus (Kalah - Berdasarkan Sisa Kartu Lawan):</h3>
              <ol className="list-decimal list-inside mb-5 pl-4">
                <li>**Poin dari Kartu Non-Spesial:** Hitung jumlah kartu yang bukan merupakan kartu spesial (2 Wajik, 2 Keriting, 2 Hati, 2 Skop) yang tersisa di tangan. Setiap kartu ini bernilai -1 poin.</li>
                <li>**Poin dari Kartu Spesial yang Tersisa:** Jika ada kartu spesial (2 Wajik, 2 Keriting, 2 Hati, 2 Skop) yang tersisa di tangan, kartu tersebut juga berkontribusi poin minus sesuai nilainya:
                  <ul className="list-disc list-inside ml-4">
                    <li>Sisa 2 Wajik: -5 poin</li>
                    <li>Sisa 2 Keriting: -7 poin</li>
                    <li>Sisa 2 Hati: -9 poin</li>
                    <li>Sisa 2 Skop: -11 poin</li>
                  </ul>
                </li>
                <li>**Jumlahkan** semua poin minus dari kartu non-spesial dan kartu spesial yang tersisa.</li>
                <li>**Kalikan** total poin minus tersebut dengan **multiplier** berdasarkan **total sisa kartu** di tangan:
                  <ul className="list-disc list-inside ml-4">
                    <li>Sisa 1-6 kartu: multiplier x1</li>
                    <li>Sisa 7-8 kartu: multiplier x2</li>
                    <li>Sisa 9-11 kartu: multiplier x3</li>
                    <li>Sisa 12 kartu: multiplier x4</li>
                    <li>Sisa 13 kartu: multiplier x5</li>
                  </ul>
                </li>
              </ol>
            </div>
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowRulesModal(false)}
                className="bg-[#4A90E2] hover:bg-[#3B82F6] text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Round History Modal */}
      {showRoundHistoryModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl text-gray-200 max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto transform scale-105 transition-transform duration-300 ease-out border border-gray-700">
            <h2 className="text-3xl font-bold text-center text-[#66FCF1] mb-6">Riwayat Putaran</h2>
            {roundHistory.length === 0 ? (
              <p className="text-center text-gray-400">Belum ada putaran yang dicatat.</p>
            ) : (
              <div className="space-y-6">
                {roundHistory.map((roundEntry, index) => {
                  const prevRoundEntry = roundHistory[index - 1];
                  return (
                    <div key={index} className="bg-gray-900 p-4 rounded-lg shadow-md border border-gray-700">
                      <p className="text-lg font-bold text-[#66FCF1] mb-2">Babak {roundEntry.chapter}, Putaran {roundEntry.round}</p>
                      <p className="text-md text-gray-300 mb-3">Pemenang: <span className="font-semibold">{roundEntry.winnerName}</span></p>
                      <table className="min-w-full bg-gray-800 rounded-lg shadow-sm border border-gray-700">
                        <thead className="bg-gray-700">
                          <tr>
                            <th className="py-2 px-3 text-left text-xs font-semibold text-[#66FCF1] uppercase tracking-wider">Pemain</th>
                            <th className="py-2 px-3 text-right text-xs font-semibold text-[#66FCF1] uppercase">Skor Putaran</th>
                            <th className="py-2 px-3 text-right text-xs font-semibold text-[#66FCF1] uppercase">Skor Bonus</th>
                            <th className="py-2 px-3 text-right text-xs font-semibold text-[#66FCF1] uppercase">Total Putaran + Bonus</th>
                            <th className="py-2 px-3 text-right text-xs font-semibold text-[#66FCF1] uppercase">Total Skor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {players.map(player => {
                            const playerBreakdown = roundEntry.playerScoresBreakdown[player.id];
                            const regularScore = playerBreakdown?.regular || 0;
                            const bonusScore = playerBreakdown?.bonus || 0;
                            const totalRoundScore = playerBreakdown?.total || 0;
                            const totalSnapshot = roundEntry.totalScoresSnapshot[player.name] || 0;

                            // Apply color based on score for 'Total Putaran + Bonus'
                            const totalRoundScoreColorClass = getScoreTextColor(totalRoundScore);

                            return (
                              <tr key={player.id} className="border-b border-gray-700 last:border-b-0">
                                <td className="py-2 px-3 text-left text-gray-300 text-sm">{player.name}</td>
                                <td className="py-2 px-3 text-right text-gray-200 font-medium text-sm">{formatScore(regularScore)}</td>
                                <td className="py-2 px-3 text-right text-gray-200 font-medium text-sm">{formatScore(bonusScore)}</td>
                                <td className={`py-2 px-3 text-right font-bold text-sm ${totalRoundScoreColorClass}`}>
                                  {formatScore(totalRoundScore)}
                                </td>
                                <td className="py-2 px-3 text-right text-[#66FCF1] font-bold text-sm">{formatScore(totalSnapshot)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowRoundHistoryModal(false)}
                className="bg-[#4A90E2] hover:bg-[#3B82F6] text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Manual Points Modal */}
      {showAddManualPointsModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity:75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl text-gray-200 max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto transform scale-105 transition-transform duration-300 ease-out border border-gray-700">
            <h2 className="text-3xl font-bold text-center text-[#66FCF1] mb-6">Tambahkan Poin Manual</h2>
            <p className="text-center text-gray-400 mb-4">Masukkan poin tambahan (positif atau negatif) untuk setiap pemain.</p>
            <div className="space-y-4">
              {players.map(player => (
                <div key={player.id} className="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-gray-700">
                  <label htmlFor={`manual-add-points-${player.id}`} className="text-lg font-medium text-gray-300 w-1/2">
                    {player.name}:
                  </label>
                  <input
                    type="number"
                    id={`manual-add-points-${player.id}`}
                    value={manualPointsTemp[player.id] || 0}
                    onChange={(e) => handleManualAddPointsChange(player.id, e.target.value)}
                    className="w-1/2 p-2 border border-gray-600 rounded-lg text-center text-lg font-bold focus:outline focus:ring-2 focus:ring-[#66FCF1] focus:border-[#66FCF1] transition duration-200 outline-none bg-gray-700 text-gray-200"
                    placeholder="Poin"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={applyManualPoints}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                Tambahkan Poin
              </button>
              <button
                onClick={() => {
                  setShowAddManualPointsModal(false);
                  setManualPointsTemp({});
                }}
                className="bg-gray-600 hover:bg-gray-700 text-gray-200 font-bold py-3 px-6 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}


      <div className="w-full max-w-4xl bg-gradient-to-br from-[#1A202C] to-[#2D3748] rounded-2xl shadow-2xl p-6 md:p-8 mb-8 border border-gray-800"> {/* Darker background */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-[#66FCF1] mb-4 drop-shadow-lg"> {/* Cyan-ish color */}
          <span role="img" aria-label="cards" className="mr-2">🃏</span> Pencatat Skor Big Two Area Tegal
        </h1>
        <p className="text-center text-lg text-gray-300 mb-6 font-semibold">by : raynaldofr</p>

        {/* Menu Bar for Rules and History */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mb-6">
            <button
                onClick={() => setShowRulesModal(true)}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-5 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open-text"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/><path d="M10 12H8"/><path d="M16 12h2"/><path d="M16 18h2"/><path d="M10 18H8"/></svg>
                Lihat Aturan
            </button>
            <button
                onClick={() => setShowRoundHistoryModal(true)}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-5 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-history"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                Riwayat Putaran
            </button>
            <button
                onClick={openAddManualPointsModal}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-5 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus-circle"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                Tambahkan Poin Manual
            </button>
        </div>

        {!gameStarted ? (
          // Bagian Pengaturan Pemain
          <div className="bg-gray-800 p-8 rounded-2xl shadow-lg mb-8 border border-gray-700">
            <h2 className="text-2xl font-semibold text-[#66FCF1] mb-5 text-center">Pengaturan Pemain</h2>
            <div className="flex flex-col sm:flex-row gap-4 mb-5">
              <input
                type="text"
                placeholder="Nama Pemain Baru"
                value={tempPlayerName}
                onChange={(e) => setTempPlayerName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addPlayer();
                  }
                }}
                className="flex-grow p-3 border border-gray-600 rounded-lg focus:ring-[#66FCF1] focus:border-[#66FCF1] transition duration-200 ease-in-out shadow-sm outline-none bg-gray-700 text-gray-200 placeholder-gray-400"
              />
              <button
                onClick={addPlayer}
                className="bg-gradient-to-r from-[#4A90E2] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#4A90E2] text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#66FCF1] focus:ring-offset-2"
              >
                Tambah Pemain
              </button>
            </div>

            {players.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[#66FCF1] mb-3">Daftar Pemain:</h3>
                <ul className="space-y-3">
                  {players.map(player => (
                    <li key={player.id} className="flex justify-between items-center bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-600 transition-all duration-200 hover:shadow-md">
                      <span className="text-gray-200 font-medium text-lg">{player.name}</span>
                      <button
                        onClick={() => removePlayer(player.id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                      >
                        Hapus
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-[#50C878] to-[#3CB371] hover:from-[#3CB371] hover:to-[#50C878] text-white font-bold py-4 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#66FCF1] focus:ring-offset-2"
              disabled={players.length < 2}
            >
              Mulai Permainan
            </button>
          </div>
        ) : (
          // Bagian Input Hasil Putaran dan Papan Skor (Setelah Game Dimulai)
          <>
            <div className="text-center text-xl font-bold text-[#66FCF1] mb-6 p-3 bg-gray-800 rounded-lg shadow-md border border-gray-700">
              Babak: {currentChapter} | Putaran: {currentRound}/13
            </div>

            {/* Bagian Input Hasil Putaran */}
            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg mb-8 border border-gray-700">
              <h2 className="text-2xl font-semibold text-[#66FCF1] mb-5 text-center">Input Hasil Putaran</h2>

              {/* Pemilihan Pemenang - Menggunakan Radio Button */}
              <div className="mb-5">
                <label className="block text-lg font-medium text-gray-300 mb-3">Pemenang Putaran:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {players.map(player => (
                    <label key={player.id} className="flex items-center justify-center px-4 py-3 rounded-full cursor-pointer transition-all duration-200 shadow-sm border border-gray-600
                      hover:bg-gray-700
                      peer-checked:bg-[#4A90E2] peer-checked:border-[#3B82F6]">
                      <input
                        type="radio"
                        name="winner"
                        value={player.id}
                        checked={winnerId === player.id}
                        onChange={(e) => setWinnerId(e.target.value)}
                        className="peer hidden" // Sembunyikan radio button asli
                      />
                      {/* Custom visual indicator for radio */}
                      <span className="custom-radio-visual mr-2"></span>
                      <span className="text-gray-200 font-medium text-base peer-checked:text-white peer-checked:font-bold">{player.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {winnerId && (
                <>
                  {/* Cara Pemenang Menutup Kartu */}
                  <div className="mb-5">
                    <label className="block text-lg font-medium text-gray-300 mb-3">Kartu pemenang :</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <label className="flex items-center justify-center bg-gray-800 px-4 py-3 rounded-full cursor-pointer transition-all duration-200 shadow-sm border border-gray-600
                        hover:bg-gray-700
                        peer-checked:bg-[#4A90E2] peer-checked:border-[#3B82F6]">
                        <input
                          type="radio"
                          name="closingType"
                          value="1_card"
                          checked={winnerClosingType === '1_card'}
                          onChange={(e) => setWinnerClosingType(e.target.value)}
                          className="peer hidden"
                        />
                        <span className="custom-radio-visual mr-2"></span>
                        <span className="text-gray-200 font-medium text-base peer-checked:text-white peer-checked:font-bold">1 🃏 (+5)</span>
                      </label>
                      <label className="flex items-center justify-center bg-gray-800 px-4 py-3 rounded-full cursor-pointer hover:bg-gray-700 transition-colors shadow-sm border border-gray-600 peer-checked:bg-[#4A90E2] peer-checked:border-[#3B82F6]">
                        <input
                          type="radio"
                          name="closingType"
                          value="pair"
                          checked={winnerClosingType === 'pair'}
                          onChange={(e) => setWinnerClosingType(e.target.value)}
                          className="peer hidden"
                        />
                        <span className="custom-radio-visual mr-2"></span>
                        <span className="text-gray-200 font-medium text-base peer-checked:text-white peer-checked:font-bold">2 🃏 (+10)</span>
                      </label>
                      <label className="flex items-center justify-center bg-gray-800 px-4 py-3 rounded-full cursor-pointer hover:bg-gray-700 transition-colors shadow-sm border border-gray-600 peer-checked:bg-[#4A90E2] peer-checked:border-[#3B82F6]">
                        <input
                          type="radio"
                          name="closingType"
                          value="3_cards"
                          checked={winnerClosingType === '3_cards'}
                          onChange={(e) => setWinnerClosingType(e.target.value)}
                          className="peer hidden"
                        />
                        <span className="custom-radio-visual mr-2"></span>
                        <span className="text-gray-200 font-medium text-base peer-checked:text-white peer-checked:font-bold">3 🃏 (+15)</span>
                      </label>
                      <label className="flex items-center justify-center bg-gray-800 px-4 py-3 rounded-full cursor-pointer hover:bg-gray-700 transition-colors shadow-sm border border-gray-600 peer-checked:bg-[#4A90E2] peer-checked:border-[#3B82F6]">
                        <input
                          type="radio"
                          name="closingType"
                          value="set_5"
                          checked={winnerClosingType === 'set_5'}
                          onChange={(e) => setWinnerClosingType(e.target.value)}
                          className="peer hidden"
                        />
                        <span className="custom-radio-visual mr-2"></span>
                        <span className="text-gray-200 font-medium text-base peer-checked:text-white peer-checked:font-bold">5 🃏 (+25)</span>
                      </label>
                    </div>
                  </div>

                  {/* Bonus Kartu '2' dalam Set Pemenang */}
                  <div className="mb-5">
                    <label className="block text-lg font-medium text-gray-300 mb-3">Bonus Kartu '2' dalam Set Pemenang:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <label className="flex items-center bg-gray-800 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors shadow-sm border border-gray-600 peer-checked:bg-[#4A90E2] peer-checked:border-[#3B82F6]">
                        <input
                          type="checkbox"
                          checked={winnerBonus2s.diamond2}
                          onChange={(e) => setWinnerBonus2s({ ...winnerBonus2s, diamond2: e.target.checked })}
                          className="peer hidden"
                        />
                        <span className="custom-checkbox-visual mr-2"></span>
                        <span className="text-red-400 font-medium text-base peer-checked:text-white peer-checked:font-bold">2 ♦ (+5)</span>
                      </label>
                      <label className="flex items-center bg-gray-800 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors shadow-sm border border-gray-600 peer-checked:bg-[#4A90E2] peer-checked:border-[#3B82F6]">
                        <input
                          type="checkbox"
                          checked={winnerBonus2s.club2}
                          onChange={(e) => setWinnerBonus2s({ ...winnerBonus2s, club2: e.target.checked })}
                          className="peer hidden"
                        />
                        <span className="custom-checkbox-visual mr-2"></span>
                        <span className="ml-2 text-gray-200 font-medium text-base peer-checked:text-white peer-checked:font-bold">2 ♣ (+7)</span>
                      </label>
                      <label className="flex items-center bg-gray-800 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors shadow-sm border border-gray-600 peer-checked:bg-[#4A90E2] peer-checked:border-[#3B82F6]">
                        <input
                          type="checkbox"
                          checked={winnerBonus2s.heart2}
                          onChange={(e) => setWinnerBonus2s({ ...winnerBonus2s, heart2: e.target.checked })}
                          className="peer hidden"
                        />
                        <span className="custom-checkbox-visual mr-2"></span>
                        <span className="ml-2 text-red-400 font-medium text-base peer-checked:text-white">2 ♥ (+9)</span>
                      </label>
                      <label className="flex items-center bg-gray-800 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors shadow-sm border border-gray-600 peer-checked:bg-[#4A90E2] peer-checked:border-[#3B82F6]">
                        <input
                          type="checkbox"
                          checked={winnerBonus2s.spade2}
                          onChange={(e) => setWinnerBonus2s({ ...winnerBonus2s, spade2: e.target.checked })}
                          className="peer hidden"
                        />
                        <span className="custom-checkbox-visual mr-2"></span>
                        <span className="ml-2 text-gray-200 font-medium text-base peer-checked:text-white">2 ♠ (+11)</span>
                      </label>
                    </div>
                  </div>

                  {/* Bonus Kartu Spesial (Pemenang) */}
                  <div className="mb-5">
                    <label className="block text-lg font-medium text-gray-300 mb-3">Bonus Kartu Spesial (Pemenang):</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-center bg-gray-800 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors shadow-sm border border-gray-600 peer-checked:bg-[#4A90E2] peer-checked:border-[#3B82F6]">
                        <input
                          type="checkbox"
                          checked={winnerSpecialHands.royalStraightFlush}
                          onChange={(e) => setWinnerSpecialHands({ ...winnerSpecialHands, royalStraightFlush: e.target.checked })}
                          className="peer hidden"
                        />
                        <span className="custom-checkbox-visual mr-2"></span>
                        <span className="ml-2 text-gray-200 font-medium text-base peer-checked:text-white">Straight Flush (+30)</span>
                      </label>
                      <label className="flex items-center bg-gray-800 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors shadow-sm border border-gray-600 peer-checked:bg-[#4A90E2] peer-checked:border-[#3B82F6]">
                        <input
                          type="checkbox"
                          checked={winnerSpecialHands.fourOfAKind}
                          onChange={(e) => setWinnerSpecialHands({ ...winnerSpecialHands, fourOfAKind: e.target.checked })}
                          className="peer hidden"
                        />
                        <span className="custom-checkbox-visual mr-2"></span>
                        <span className="ml-2 text-gray-200 font-medium text-base peer-checked:text-white">4 of a Kind (+20)</span>
                      </label>
                      <label className="flex items-center bg-gray-800 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors shadow-sm border border-gray-600 peer-checked:bg-[#4A90E2] peer-checked:border-[#3B82F6]">
                        <input
                          type="checkbox"
                          checked={winnerSpecialHands.others}
                          onChange={(e) => setWinnerSpecialHands({ ...winnerSpecialHands, others: e.target.checked })}
                          className="peer hidden"
                        />
                        <span className="custom-checkbox-visual mr-2"></span>
                        <span className="text-gray-200 font-medium text-base peer-checked:text-white">Lainnya:</span>
                        {winnerSpecialHands.others && (
                          <input
                            type="number"
                            value={winnerSpecialHands.otherPoints || ''}
                            onChange={(e) => setWinnerSpecialHands({ ...winnerSpecialHands, otherPoints: parseInt(e.target.value) || 0 })}
                            className="ml-2 w-20 p-1 border border-gray-500 rounded-md text-center text-lg font-bold focus:outline focus:ring-2 focus:ring-[#66FCF1] bg-gray-700 text-gray-200"
                            placeholder="Poin"
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* Input Kartu Sisa Pemain yang Kalah */}
              <h3 className="text-2xl font-semibold text-[#66FCF1] mb-4 mt-8 text-center">Kartu Sisa Pemain yang Kalah:</h3>
              {players.filter(p => p.id !== winnerId).map(player => (
                <div key={player.id} className="bg-gray-800 p-5 rounded-xl shadow-md mb-6 border border-gray-700">
                  <h4 className="text-xl font-medium text-gray-200 mb-4">{player.name}</h4>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                    <div className="flex-grow w-full">
                      <label htmlFor={`remaining-cards-${player.id}`} className="block text-base font-medium text-gray-300 mb-2">
                        Jumlah Kartu Sisa:
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustRemainingCards(player.id, -1)}
                          className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-lg transition-colors shadow-sm"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          id={`remaining-cards-${player.id}`}
                          min="0"
                          max="13"
                          value={loserInputs[player.id]?.remainingCards || 0}
                          onChange={(e) => handleRemainingCardsChange(player.id, e.target.value)}
                          className="w-20 text-center p-2 border border-gray-500 rounded-lg focus:ring-[#66FCF1] focus:border-[#66FCF1] transition duration-200 outline-none bg-gray-700 text-gray-200 text-lg font-bold"
                        />
                        <button
                          onClick={() => adjustRemainingCards(player.id, 1)}
                          className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-lg transition-colors shadow-sm"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {[...Array(14).keys()].filter(count => count !== 0).map(count => ( // Generate 1 to 13
                          <button
                            key={count}
                            onClick={() => handleRemainingCardsChange(player.id, count)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm ${
                              parseInt(loserInputs[player.id]?.remainingCards) === count
                                ? 'bg-[#4A90E2] text-white hover:bg-[#3B82F6]'
                                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                            }`}
                          >
                            {count}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                      <label className="block text-base font-medium text-gray-300 mb-2">Kartu '2' yang Tersisa:</label>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                        <label className="flex items-center text-sm bg-gray-800 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors shadow-sm border border-gray-600">
                          <input
                            type="checkbox"
                            checked={loserInputs[player.id]?.bonus2s.diamond2 || false}
                            onChange={(e) => setLoserInputs({
                              ...loserInputs,
                              [player.id]: {
                                ...loserInputs[player.id],
                                bonus2s: { ...loserInputs[player.id]?.bonus2s, diamond2: e.target.checked }
                              }
                            })}
                            className="peer hidden"
                          />
                          <span className="custom-checkbox-visual mr-2"></span>
                          <span className="text-red-400 font-medium text-base peer-checked:text-white">2 ♦ (-5)</span>
                        </label>
                        <label className="flex items-center text-sm bg-gray-800 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors shadow-sm border border-gray-600">
                          <input
                            type="checkbox"
                            checked={loserInputs[player.id]?.bonus2s.club2 || false}
                            onChange={(e) => setLoserInputs({
                              ...loserInputs,
                              [player.id]: {
                                ...loserInputs[player.id],
                                bonus2s: { ...loserInputs[player.id]?.bonus2s, club2: e.target.checked }
                              }
                            })}
                            className="peer hidden"
                          />
                          <span className="custom-checkbox-visual mr-2"></span>
                          <span className="text-gray-200 font-medium text-base peer-checked:text-white">2 ♣ (-7)</span>
                        </label>
                        <label className="flex items-center text-sm bg-gray-800 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors shadow-sm border border-gray-600">
                          <input
                            type="checkbox"
                            checked={loserInputs[player.id]?.bonus2s.heart2 || false}
                            onChange={(e) => setLoserInputs({
                              ...loserInputs,
                              [player.id]: {
                                ...loserInputs[player.id],
                                bonus2s: { ...loserInputs[player.id]?.bonus2s, heart2: e.target.checked }
                              }
                            })}
                            className="peer hidden"
                          />
                          <span className="custom-checkbox-visual mr-2"></span>
                          <span className="ml-2 text-red-400 font-medium text-base peer-checked:text-white">2 ♥ (-9)</span>
                        </label>
                        <label className="flex items-center text-sm bg-gray-800 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors shadow-sm border border-gray-600">
                          <input
                            type="checkbox"
                            checked={loserInputs[player.id]?.bonus2s.spade2 || false}
                            onChange={(e) => setLoserInputs({
                              ...loserInputs,
                              [player.id]: {
                                ...loserInputs[player.id],
                                bonus2s: { ...loserInputs[player.id]?.bonus2s, spade2: e.target.checked }
                              }
                            })}
                            className="peer hidden"
                          />
                          <span className="custom-checkbox-visual mr-2"></span>
                          <span className="ml-2 text-gray-200 font-medium text-base peer-checked:text-white">2 ♠ (-11)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Bonus Kartu Spesial (Pemain Kalah) */}
              <h3 className="text-2xl font-semibold text-[#66FCF1] mb-4 mt-8 text-center">Bonus Kartu Spesial (Pemain Kalah):</h3>
              {players.filter(p => p.id !== winnerId).map(player => (
                <div key={`loser-special-${player.id}`} className="bg-gray-900 p-5 rounded-xl shadow-md mb-6 border border-gray-700">
                  <h4 className="text-xl font-medium text-gray-200 mb-4">{player.name}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center bg-gray-800 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors shadow-sm border border-gray-600 peer-checked:bg-[#4A90E2] peer-checked:border-[#3B82F6]">
                      <input
                        type="checkbox"
                        checked={loserInputs[player.id]?.specialHands.royalStraightFlush || false}
                        onChange={(e) => handleLoserSpecialHandChange(player.id, 'royalStraightFlush', e.target.checked)}
                        className="peer hidden"
                      />
                      <span className="custom-checkbox-visual mr-2"></span>
                      <span className="ml-2 text-gray-200 font-medium text-base peer-checked:text-white">Straight Flush (+30)</span>
                    </label>
                    <label className="flex items-center bg-gray-800 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors shadow-sm border border-gray-600 peer-checked:bg-[#4A90E2] peer-checked:border-[#3B82F6]">
                      <input
                        type="checkbox"
                        checked={loserInputs[player.id]?.specialHands.fourOfAKind || false}
                        onChange={(e) => handleLoserSpecialHandChange(player.id, 'fourOfAKind', e.target.checked)}
                        className="peer hidden"
                      />
                      <span className="custom-checkbox-visual mr-2"></span>
                      <span className="ml-2 text-gray-200 font-medium text-base peer-checked:text-white">4 of a Kind (+20)</span>
                    </label>
                    <label className="flex items-center bg-gray-800 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors shadow-sm border border-gray-600 peer-checked:bg-[#4A90E2] peer-checked:border-[#3B82F6]">
                      <input
                        type="checkbox"
                        checked={loserInputs[player.id]?.specialHands.others || false}
                        onChange={(e) => handleLoserSpecialHandChange(player.id, 'others', e.target.checked)}
                        className="peer hidden"
                      />
                      <span className="custom-checkbox-visual mr-2"></span>
                      <span className="text-gray-200 font-medium text-base peer-checked:text-white">Lainnya:</span>
                      {loserInputs[player.id]?.specialHands.others && (
                        <input
                          type="number"
                          value={loserInputs[player.id]?.specialHands.otherPoints || ''}
                          onChange={(e) => handleLoserSpecialHandChange(player.id, 'otherPoints', parseInt(e.target.value) || 0)}
                          className="ml-2 w-20 p-1 border border-gray-500 rounded-md text-center text-lg font-bold focus:outline focus:ring-2 focus:ring-[#66FCF1] bg-gray-700 text-gray-200"
                          placeholder="Poin"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </label>
                  </div>
                </div>
              ))}

              {/* Tombol Aksi */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <button
                  onClick={applyRoundScores}
                  className="flex-1 bg-gradient-to-r from-[#4A90E2] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#4A90E2] text-white font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#66FCF1] focus:ring-offset-2"
                >
                  Hitung & Tambah Skor
                </button>
                <button
                  onClick={resetRoundForm}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-gray-200 font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Reset Form
                </button>
              </div>
            </div>

            {/* Bagian Tabel Skor */}
            <div className="bg-[#2D3748] p-8 rounded-2xl shadow-lg mb-8 border border-[#4A5568]">
              <h2 className="text-2xl font-semibold text-[#66FCF1] mb-5 text-center">Papan Skor</h2>
              {/* Moved Round/Chapter info here */}
              <div className="text-center text-xl font-bold text-[#66FCF1] mb-6 p-3 bg-gray-800 rounded-lg shadow-md border border-gray-700">
                Babak: {currentChapter} | Putaran: {currentRound}/13
              </div>
              <div className="overflow-x-auto rounded-lg shadow-md border border-gray-700">
                <table className="min-w-full bg-gray-800">
                  <thead className="bg-gray-700 border-b border-gray-600">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-[#66FCF1] uppercase tracking-wider rounded-tl-lg">Pemain</th>
                      <th className="py-3 px-4 text-right text-sm font-semibold text-[#66FCF1] uppercase tracking-wider">Skor Total</th>
                      <th className="py-3 px-4 text-right text-sm font-semibold text-[#66FCF1] uppercase tracking-wider">Skor Putaran</th>
                      <th className="py-3 px-4 text-right text-sm font-semibold text-[#66FCF1] uppercase tracking-wider">Skor Bonus</th>
                      <th className="py-3 px-4 text-right text-sm font-semibold text-[#66FCF1] uppercase tracking-wider rounded-tr-lg">Total Skor Putaran + Bonus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.sort((a, b) => b.score - a.score).map((player, index) => {
                      const lastRoundEntry = roundHistory[roundHistory.length - 1];
                      const playerBreakdown = lastRoundEntry?.playerScoresBreakdown[player.id];
                      const regularScore = playerBreakdown?.regular; // Can be 0
                      const bonusScore = playerBreakdown?.bonus;     // Can be 0
                      const totalRoundScore = playerBreakdown?.total; // Can be 0

                      // Apply color based on score for 'Total Skor Putaran + Bonus'
                      const totalRoundScoreColorClass = getScoreTextColor(totalRoundScore);

                      const isWinner = lastRoundEntry && lastRoundEntry.winnerId === player.id;
                      let isLargestLoser = false;
                      if (lastRoundEntry && lastRoundEntry.playerScoresBreakdown) {
                        const loserRoundTotals = Object.entries(lastRoundEntry.playerScoresBreakdown)
                          .filter(([pId]) => pId !== lastRoundEntry.winnerId)
                          .map(([, scores]) => scores.total);
                        if (loserRoundTotals.length > 0) {
                          const minLoserTotal = Math.min(...loserRoundTotals);
                          isLargestLoser = playerBreakdown?.total === minLoserTotal && !isWinner;
                        }
                      }

                      return (
                        <tr key={player.id} className={`${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'} border-b border-gray-700 last:border-b-0 transition-all duration-150 hover:bg-gray-700`}>
                          <td className="py-3 px-4 text-left text-gray-200 font-medium text-lg">
                            {player.name}
                            {isWinner && <span className="ml-2 text-yellow-400 text-xl align-middle">★</span>}
                            {isLargestLoser && <span className="ml-2 text-red-500 text-xl align-middle">X</span>}
                          </td>
                          <td className="py-3 px-4 text-right text-[#66FCF1] font-extrabold text-2xl">{formatScore(player.score)}</td>
                          <td className="py-3 px-4 text-right text-gray-200 font-medium text-lg">
                            {roundHistory.length > 0 ? formatScore(regularScore) : '-'}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-200 font-medium text-lg">
                            {roundHistory.length > 0 ? formatScore(bonusScore) : '-'}
                          </td>
                          <td className={`py-3 px-4 text-right font-bold text-lg ${totalRoundScoreColorClass}`}>
                            {roundHistory.length > 0 ? formatScore(totalRoundScore) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Ringkasan Skor Babak Sebelumnya */}
              {chapterSummaries.length > 0 && (
                <div className="mt-8 bg-gray-800 p-5 rounded-xl shadow-md border border-gray-700">
                  <h3 className="text-2xl font-semibold text-[#66FCF1] mb-4 text-center">Riwayat Babak:</h3>
                  {chapterSummaries.map((summary, index) => (
                    <div key={index} className="bg-gray-900 p-4 rounded-lg shadow-sm mb-4 border border-gray-700 last:mb-0">
                      <h4 className="text-lg font-bold text-[#66FCF1] mb-2">Babak {summary.chapter}</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-300">
                        {Object.entries(summary.scores).map(([playerName, score]) => (
                          <li key={playerName} className="text-base">{playerName}: <span className="font-semibold">{formatScore(score)}</span></li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={resetGame}
                className="mt-8 w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
              >
                Reset Permainan
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
