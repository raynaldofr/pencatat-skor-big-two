import React, { useState, useEffect } from 'react';

// Main App Component
const App = () => {
  // State untuk daftar pemain dan skor mereka
  const [players, setPlayers] = useState([]);
  // State untuk mengontrol apakah permainan sudah dimulai
  const [gameStarted, setGameStarted] = useState(false);
  // State sementara untuk input pemain saat pengaturan
  const [tempPlayerName, setTempPlayerName] = useState('');

  // State untuk pelacakan putaran dan babak
  const [currentRound, setCurrentRound] = useState(1); // Dimulai dari putaran 1
  const [currentChapter, setCurrentChapter] = useState(1); // Dimulai dari babak 1
  const [chapterSummaries, setChapterSummaries] = useState([]); // Menyimpan ringkasan skor setiap babak

  // State untuk pesan notifikasi atau error
  const [message, setMessage] = useState('');
  // State untuk mengontrol tampilan modal konfirmasi umum
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => () => {}); // Fungsi yang akan dijalankan jika dikonfirmasi

  // State untuk mengontrol tampilan modal akhir babak
  const [showChapterEndModal, setShowChapterEndModal] = useState(false);

  // State untuk mengontrol tampilan modal aturan permainan
  const [showRulesModal, setShowRulesModal] = useState(false);

  // State untuk input hasil putaran
  const [winnerId, setWinnerId] = useState('');
  const [winnerClosingType, setWinnerClosingType] = useState(''); // '1_card', 'pair', '3_cards', 'set_5', 'dragon'
  const [winnerBonus2s, setWinnerBonus2s] = useState({
    diamond2: false, // 2 Wajik
    club2: false,    // 2 Keriting
    heart2: false,   // 2 Hati
    spade2: false,   // 2 Skop
  });
  const [winnerSpecialHands, setWinnerSpecialHands] = useState({
    royalStraightFlush: false,
    fourOfAKind: false,
  });

  // State untuk input kartu sisa pemain yang kalah
  const [loserInputs, setLoserInputs] = useState({});

  // Inisialisasi loserInputs saat komponen dimuat atau pemain berubah
  useEffect(() => {
    const initialLoserInputs = {};
    players.forEach(player => {
      initialLoserInputs[player.id] = {
        remainingCards: 0,
        bonus2s: {
          diamond2: false,
          club2: false,
          heart2: false,
          spade2: false,
        },
      };
    });
    setLoserInputs(initialLoserInputs);
  }, [players]);

  // Fungsi untuk menampilkan pesan (alert kustom)
  const showAlert = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000); // Pesan hilang setelah 3 detik
  };

  // Fungsi untuk menampilkan modal konfirmasi umum
  const showCustomConfirm = (msg, onConfirm) => {
    setMessage(msg); // Gunakan area pesan untuk menampilkan pertanyaan
    setConfirmAction(() => { // Gunakan fungsi pembungkus untuk memastikan fungsi terbaru
      return () => {
        onConfirm();
        setShowConfirmModal(false);
        setMessage(''); // Clear message after action
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
    if (players.length >= 4) { // Batasi maksimal 4 pemain untuk Big Two
      showAlert('Maksimal 4 pemain untuk Big Two.');
      return;
    }
    const newPlayer = {
      id: `player_${Date.now()}`, // ID unik untuk setiap pemain
      name: tempPlayerName.trim(),
      score: 0,
    };
    setPlayers([...players, newPlayer]);
    setTempPlayerName(''); // Bersihkan input
  };

  // Fungsi untuk menghapus pemain
  const removePlayer = (idToRemove) => {
    setPlayers(players.filter(player => player.id !== idToRemove));
  };

  // Fungsi untuk memulai permainan
  const startGame = () => {
    if (players.length < 2) { // Minimal 2 pemain
      showAlert('Minimal 2 pemain diperlukan untuk memulai permainan.');
      return;
    }
    setGameStarted(true);
    setCurrentRound(1); // Pastikan putaran dimulai dari 1
    setCurrentChapter(1); // Pastikan babak dimulai dari 1
    setChapterSummaries([]); // Reset ringkasan babak
  };

  // Fungsi untuk mereset semua input form putaran
  const resetRoundForm = () => {
    setWinnerId('');
    setWinnerClosingType('');
    setWinnerBonus2s({
      diamond2: false,
      club2: false,
      heart2: false,
      spade2: false,
    });
    setWinnerSpecialHands({
      royalStraightFlush: false,
      fourOfAKind: false,
    });
    const resetLoserInputs = {};
    players.forEach(player => {
      resetLoserInputs[player.id] = {
        remainingCards: 0,
        bonus2s: {
          diamond2: false,
          club2: false,
          heart2: false,
          spade2: false,
        },
      };
    });
    setLoserInputs(resetLoserInputs);
  };

  // Fungsi untuk menghitung poin pemenang
  const calculateWinnerPoints = () => {
    let points = 0;
    if (winnerClosingType === '1_card') {
      points += 5;
    } else if (winnerClosingType === 'pair') {
      points += 10;
    } else if (winnerClosingType === '3_cards') {
      points += 15;
    } else if (winnerClosingType === 'set_5') {
      points += 25;
    } else if (winnerClosingType === 'dragon') {
      points += 65; // Corrected to 65 points for Dragon
    }

    // Bonus kartu '2' dalam set pemenang
    if (winnerBonus2s.diamond2) points += 5;
    if (winnerBonus2s.club2) points += 7;
    if (winnerBonus2s.heart2) points += 9;
    if (winnerBonus2s.spade2) points += 11;

    // Bonus kartu spesial
    if (winnerSpecialHands.royalStraightFlush) points += 30;
    if (winnerSpecialHands.fourOfAKind) points += 20;

    return points;
  };

  // Fungsi untuk menghitung poin pemain yang kalah
  const calculateLoserPoints = (playerId) => {
    const loserInput = loserInputs[playerId];
    if (!loserInput) return 0; // Should not happen if loserInputs is correctly initialized

    const remainingCards = parseInt(loserInput.remainingCards, 10);
    if (isNaN(remainingCards) || remainingCards === 0) return 0;

    let baseMinusPoints = 0;
    let specialCardBonus = 0;

    // Hitung poin dari kartu non-spesial
    let nonSpecialCards = remainingCards;
    if (loserInput.bonus2s.diamond2) { nonSpecialCards--; specialCardBonus += 5; }
    if (loserInput.bonus2s.club2) { nonSpecialCards--; specialCardBonus += 7; }
    if (loserInput.bonus2s.heart2) { nonSpecialCards--; specialCardBonus += 9; }
    if (loserInput.bonus2s.spade2) { nonSpecialCards--; specialCardBonus += 11; }

    baseMinusPoints = nonSpecialCards * 1; // Setiap kartu non-spesial bernilai 1 poin

    // Jumlahkan semua poin minus sebelum multiplier
    let totalMinusPointsBeforeMultiplier = baseMinusPoints + specialCardBonus;

    // Tentukan multiplier berdasarkan total sisa kartu
    let multiplier = 1;
    if (remainingCards >= 7 && remainingCards <= 8) {
      multiplier = 2;
    } else if (remainingCards >= 9 && remainingCards <= 11) {
      multiplier = 3;
    } else if (remainingCards === 12) {
      multiplier = 4;
    } else if (remainingCards === 13) {
      multiplier = 5;
    }

    return -(totalMinusPointsBeforeMultiplier * multiplier);
  };

  // Fungsi untuk menerapkan skor putaran ke total skor pemain
  const applyRoundScores = () => {
    if (!winnerId) {
      showAlert('Pilih pemenang terlebih dahulu!');
      return;
    }

    const newPlayers = players.map(player => {
      let roundScore = 0;
      if (player.id === winnerId) {
        roundScore = calculateWinnerPoints();
      } else {
        roundScore = calculateLoserPoints(player.id);
      }
      return { ...player, score: player.score + roundScore };
    });
    setPlayers(newPlayers);
    resetRoundForm(); // Reset form setelah skor diterapkan
    showAlert('Skor putaran berhasil ditambahkan!');

    // Cek apakah babak berakhir (setelah putaran ke-13)
    if (currentRound === 13) {
      // Simpan ringkasan skor babak saat ini
      const currentChapterSummary = {
        chapter: currentChapter,
        scores: newPlayers.reduce((acc, player) => {
          acc[player.name] = player.score;
          return acc;
        }, {})
      };
      setChapterSummaries(prev => [...prev, currentChapterSummary]);
      setShowChapterEndModal(true); // Tampilkan modal akhir babak
    } else {
      setCurrentRound(prev => prev + 1); // Lanjut ke putaran berikutnya
    }
  };

  // Fungsi untuk melanjutkan ke babak berikutnya
  const continueToNextChapter = () => {
    setShowChapterEndModal(false);
    setCurrentChapter(prev => prev + 1); // Lanjut ke babak baru
    setCurrentRound(1); // Reset putaran ke 1
    showAlert(`Memulai Babak ${currentChapter + 1}!`);
  };

  // Fungsi untuk mereset seluruh permainan
  const resetGame = () => {
    showCustomConfirm(
      "Apakah Anda yakin ingin mereset seluruh permainan? Semua skor akan kembali ke nol, riwayat babak akan dihapus, dan Anda akan kembali ke pengaturan pemain.",
      () => {
        setPlayers([]); // Reset pemain
        setGameStarted(false); // Kembali ke layar pengaturan pemain
        setCurrentRound(1); // Reset putaran
        setCurrentChapter(1); // Reset babak
        setChapterSummaries([]); // Reset ringkasan babak
        resetRoundForm(); // Reset form putaran
        showAlert('Permainan berhasil direset!');
      }
    );
  };

  // Handler untuk mengubah jumlah kartu sisa
  const handleRemainingCardsChange = (playerId, value) => {
    const parsedValue = parseInt(value, 10);
    const newValue = isNaN(parsedValue) ? 0 : Math.max(0, Math.min(13, parsedValue)); // Batasi antara 0 dan 13
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-inter text-gray-800 flex flex-col items-center">
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
          /* Custom checkbox/radio styling */
          input[type="checkbox"], input[type="radio"] {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            display: inline-block;
            width: 1.25rem; /* 20px */
            height: 1.25rem; /* 20px */
            border: 2px solid #60A5FA; /* blue-400 */
            border-radius: 0.25rem; /* rounded */
            cursor: pointer;
            vertical-align: middle;
            position: relative;
            outline: none;
            transition: all 0.2s ease-in-out;
          }
          input[type="radio"] {
            border-radius: 50%; /* rounded-full */
          }
          input[type="checkbox"]:checked, input[type="radio"]:checked {
            background-color: #3B82F6; /* blue-500 */
            border-color: #3B82F6; /* blue-500 */
          }
          input[type="checkbox"]:checked::after {
            content: '✔';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 0.75rem; /* text-xs */
          }
          input[type="radio"]:checked::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 0.5rem; /* 8px */
            height: 0.5rem; /* 8px */
            border-radius: 50%;
            background-color: white;
          }
          input[type="checkbox"]:focus, input[type="radio"]:focus {
            box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.5); /* focus:ring-blue-300 */
          }
        `}
      </style>

      {/* Custom Alert/Message */}
      {message && !showConfirmModal && !showChapterEndModal && !showRulesModal && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-down">
          {message}
        </div>
      )}

      {/* Custom Confirmation Modal (General) */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl text-gray-800 max-w-sm w-full mx-auto transform scale-105 transition-transform duration-300 ease-out">
            <p className="mb-6 text-lg font-semibold text-center text-gray-700">{message}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setMessage('');
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105"
              >
                Batal
              </button>
              <button
                onClick={confirmAction}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chapter End Summary Modal */}
      {showChapterEndModal && chapterSummaries.length > 0 && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl text-gray-800 max-w-md w-full mx-auto transform scale-105 transition-transform duration-300 ease-out">
            <h2 className="text-3xl font-bold text-center text-blue-700 mb-4">Babak {currentChapter} Berakhir!</h2>
            <p className="text-center text-lg mb-6 text-gray-700">Ringkasan Skor Babak {currentChapter}:</p>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full bg-white rounded-lg shadow-md border border-gray-200">
                <thead className="bg-blue-100 border-b border-blue-200">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-blue-800 uppercase tracking-wider rounded-tl-lg">Pemain</th>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-blue-800 uppercase tracking-wider rounded-tr-lg">Skor</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(chapterSummaries[chapterSummaries.length - 1].scores)
                        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA) // Sort by score descending
                        .map(([playerName, score], index) => (
                      <tr key={playerName} className={`${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'} border-b border-gray-100 last:border-b-0`}>
                        <td className="py-3 px-4 text-left text-gray-700 font-medium">{playerName}</td>
                        <td className="py-3 px-4 text-right text-gray-900 font-bold text-lg">{score}</td>
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
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
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
          <div className="bg-white p-6 rounded-xl shadow-2xl text-gray-800 max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto transform scale-105 transition-transform duration-300 ease-out">
            <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Aturan Permainan Big Two</h2>
            <div className="text-base leading-relaxed text-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Pemenang (Tutup Kartu):</h3>
              <ul className="list-disc list-inside mb-5 pl-4">
                <li>**Tutup 1 Kartu:** +5 poin</li>
                <li>**Tutup Pair (2 Kartu):** +10 poin</li>
                <li>**Tutup 3 Kartu:** +15 poin</li>
                <li>**Tutup Set 5 (Straight, Full House, Flush - 5 Kartu):** +25 poin</li>
                <li>**Tutup Dragon (13 Kartu Berurut):** +65 poin</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Bonus Kartu '2' dalam Set Pemenang (jika ada):</h3>
              <ul className="list-disc list-inside mb-5 pl-4">
                <li>Ada 2 ♦ (Wajik): Tambah +5 poin</li>
                <li>Ada 2 ♣ (Keriting): Tambah +7 poin</li>
                <li>Ada 2 ♥ (Hati): Tambah +9 poin</li>
                <li>Ada 2 ♠ (Skop): Tambah +11 poin</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Bonus Kartu Spesial (Tambahan Poin di Putaran Itu):</h3>
              <ul className="list-disc list-inside mb-5 pl-4">
                <li>**Royal Flush / Straight Flush:** Tambah +30 poin</li>
                <li>**Four of a Kind:** Tambah +20 poin</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Poin Minus (Kalah - Berdasarkan Sisa Kartu Lawan):</h3>
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
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-6 md:p-8 mb-8 border border-gray-100">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-blue-800 mb-4 drop-shadow-lg">
          <span role="img" aria-label="cards" className="mr-2">🃏</span> Pencatat Skor Big Two
        </h1>
        <p className="text-center text-lg text-gray-600 mb-6 font-semibold">by : raynaldofr</p>

        {/* Menu Bar for Rules */}
        <div className="flex justify-end mb-6">
            <button
                onClick={() => setShowRulesModal(true)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-5 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open-text"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/><path d="M10 12H8"/><path d="M16 12h2"/><path d="M16 18h2"/><path d="M10 18H8"/></svg>
                Lihat Aturan
            </button>
        </div>

        {!gameStarted ? (
          // Bagian Pengaturan Pemain
          <div className="bg-purple-50 p-6 rounded-xl shadow-inner mb-8 border border-purple-200">
            <h2 className="text-2xl font-semibold text-purple-700 mb-5 text-center">Pengaturan Pemain</h2>
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
                className="flex-grow p-3 border border-purple-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition duration-200 ease-in-out shadow-sm outline-none"
              />
              <button
                onClick={addPlayer}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Tambah Pemain
              </button>
            </div>

            {players.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-purple-700 mb-3">Daftar Pemain:</h3>
                <ul className="space-y-3">
                  {players.map(player => (
                    <li key={player.id} className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-purple-100 transition-all duration-200 hover:shadow-md">
                      <span className="text-gray-800 font-medium text-lg">{player.name}</span>
                      <button
                        onClick={() => removePlayer(player.id)}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              disabled={players.length < 2}
            >
              Mulai Permainan
            </button>
          </div>
        ) : (
          // Bagian Input Hasil Putaran dan Papan Skor (Setelah Game Dimulai)
          <>
            <div className="text-center text-xl font-bold text-blue-700 mb-6 p-3 bg-blue-100 rounded-lg shadow-md">
              Babak: {currentChapter} | Putaran: {currentRound}/13
            </div>

            {/* Bagian Input Hasil Putaran */}
            <div className="bg-blue-50 p-6 rounded-xl shadow-inner mb-8 border border-blue-200">
              <h2 className="text-2xl font-semibold text-blue-700 mb-5 text-center">Input Hasil Putaran</h2>

              {/* Pemilihan Pemenang - Menggunakan Radio Button */}
              <div className="mb-5">
                <label className="block text-lg font-medium text-gray-700 mb-3">Pemenang Putaran:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {players.map(player => (
                    <label key={player.id} className="flex items-center justify-center bg-white bg-opacity-80 px-4 py-3 rounded-full cursor-pointer hover:bg-opacity-100 transition-colors shadow-sm border border-gray-200 has-[:checked]:bg-blue-500 has-[:checked]:text-white has-[:checked]:border-blue-600 has-[:checked]:shadow-md">
                      <input
                        type="radio"
                        name="winner"
                        value={player.id}
                        checked={winnerId === player.id}
                        onChange={(e) => setWinnerId(e.target.value)}
                        className="hidden" // Sembunyikan radio button asli
                      />
                      <span className="relative flex items-center justify-center w-5 h-5 border-2 border-blue-400 rounded-full mr-2">
                        {winnerId === player.id && <span className="absolute w-3 h-3 bg-white rounded-full"></span>}
                      </span>
                      <span className="text-gray-800 font-medium text-base has-[:checked]:text-white">{player.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {winnerId && (
                <>
                  {/* Cara Pemenang Menutup Kartu */}
                  <div className="mb-5">
                    <label className="block text-lg font-medium text-gray-700 mb-3">Pemenang Menutup Dengan:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <label className="flex items-center justify-center bg-white bg-opacity-80 px-4 py-3 rounded-full cursor-pointer hover:bg-opacity-100 transition-colors shadow-sm border border-gray-200 has-[:checked]:bg-blue-500 has-[:checked]:text-white has-[:checked]:border-blue-600 has-[:checked]:shadow-md">
                        <input
                          type="radio"
                          name="closingType"
                          value="1_card"
                          checked={winnerClosingType === '1_card'}
                          onChange={(e) => setWinnerClosingType(e.target.value)}
                          className="hidden"
                        />
                        <span className="relative flex items-center justify-center w-5 h-5 border-2 border-blue-400 rounded-full mr-2">
                          {winnerClosingType === '1_card' && <span className="absolute w-3 h-3 bg-white rounded-full"></span>}
                        </span>
                        <span className="text-gray-800 font-medium text-base has-[:checked]:text-white">1 Kartu (+5)</span>
                      </label>
                      <label className="flex items-center justify-center bg-white bg-opacity-80 px-4 py-3 rounded-full cursor-pointer hover:bg-opacity-100 transition-colors shadow-sm border border-gray-200 has-[:checked]:bg-blue-500 has-[:checked]:text-white has-[:checked]:border-blue-600 has-[:checked]:shadow-md">
                        <input
                          type="radio"
                          name="closingType"
                          value="pair"
                          checked={winnerClosingType === 'pair'}
                          onChange={(e) => setWinnerClosingType(e.target.value)}
                          className="hidden"
                        />
                        <span className="relative flex items-center justify-center w-5 h-5 border-2 border-blue-400 rounded-full mr-2">
                          {winnerClosingType === 'pair' && <span className="absolute w-3 h-3 bg-white rounded-full"></span>}
                        </span>
                        <span className="text-gray-800 font-medium text-base has-[:checked]:text-white">2 Kartu (Pair) (+10)</span>
                      </label>
                      <label className="flex items-center justify-center bg-white bg-opacity-80 px-4 py-3 rounded-full cursor-pointer hover:bg-opacity-100 transition-colors shadow-sm border border-gray-200 has-[:checked]:bg-blue-500 has-[:checked]:text-white has-[:checked]:border-blue-600 has-[:checked]:shadow-md">
                        <input
                          type="radio"
                          name="closingType"
                          value="3_cards"
                          checked={winnerClosingType === '3_cards'}
                          onChange={(e) => setWinnerClosingType(e.target.value)}
                          className="hidden"
                        />
                        <span className="relative flex items-center justify-center w-5 h-5 border-2 border-blue-400 rounded-full mr-2">
                          {winnerClosingType === '3_cards' && <span className="absolute w-3 h-3 bg-white rounded-full"></span>}
                        </span>
                        <span className="text-gray-800 font-medium text-base has-[:checked]:text-white">3 Kartu (+15)</span>
                      </label>
                      <label className="flex items-center justify-center bg-white bg-opacity-80 px-4 py-3 rounded-full cursor-pointer hover:bg-opacity-100 transition-colors shadow-sm border border-gray-200 has-[:checked]:bg-blue-500 has-[:checked]:text-white has-[:checked]:border-blue-600 has-[:checked]:shadow-md">
                        <input
                          type="radio"
                          name="closingType"
                          value="set_5"
                          checked={winnerClosingType === 'set_5'}
                          onChange={(e) => setWinnerClosingType(e.target.value)}
                          className="hidden"
                        />
                        <span className="relative flex items-center justify-center w-5 h-5 border-2 border-blue-400 rounded-full mr-2">
                          {winnerClosingType === 'set_5' && <span className="absolute w-3 h-3 bg-white rounded-full"></span>}
                        </span>
                        <span className="text-gray-800 font-medium text-base has-[:checked]:text-white">5 Kartu (Set) (+25)</span>
                      </label>
                      <label className="flex items-center justify-center bg-white bg-opacity-80 px-4 py-3 rounded-full cursor-pointer hover:bg-opacity-100 transition-colors shadow-sm border border-gray-200 has-[:checked]:bg-blue-500 has-[:checked]:text-white has-[:checked]:border-blue-600 has-[:checked]:shadow-md">
                        <input
                          type="radio"
                          name="closingType"
                          value="dragon"
                          checked={winnerClosingType === 'dragon'}
                          onChange={(e) => setWinnerClosingType(e.target.value)}
                          className="hidden"
                        />
                        <span className="relative flex items-center justify-center w-5 h-5 border-2 border-blue-400 rounded-full mr-2">
                          {winnerClosingType === 'dragon' && <span className="absolute w-3 h-3 bg-white rounded-full"></span>}
                        </span>
                        <span className="text-gray-800 font-medium text-base has-[:checked]:text-white">13 Kartu (Dragon) (+65)</span>
                      </label>
                    </div>
                  </div>

                  {/* Bonus Kartu '2' dalam Set Pemenang */}
                  <div className="mb-5">
                    <label className="block text-lg font-medium text-gray-700 mb-3">Bonus Kartu '2' dalam Set Pemenang:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <label className="flex items-center bg-white bg-opacity-80 px-4 py-3 rounded-lg cursor-pointer hover:bg-opacity-100 transition-colors shadow-sm border border-gray-200 has-[:checked]:bg-blue-500 has-[:checked]:text-white has-[:checked]:border-blue-600 has-[:checked]:shadow-md">
                        <input
                          type="checkbox"
                          checked={winnerBonus2s.diamond2}
                          onChange={(e) => setWinnerBonus2s({ ...winnerBonus2s, diamond2: e.target.checked })}
                          className="hidden"
                        />
                        <span className="relative flex items-center justify-center w-5 h-5 border-2 border-blue-400 rounded-md mr-2">
                          {winnerBonus2s.diamond2 && <span className="absolute text-white text-xs">✔</span>}
                        </span>
                        <span className="text-gray-800 font-medium text-base has-[:checked]:text-white">2 ♦ (+5)</span>
                      </label>
                      <label className="flex items-center bg-white bg-opacity-80 px-4 py-3 rounded-lg cursor-pointer hover:bg-opacity-100 transition-colors shadow-sm border border-gray-200 has-[:checked]:bg-blue-500 has-[:checked]:text-white has-[:checked]:border-blue-600 has-[:checked]:shadow-md">
                        <input
                          type="checkbox"
                          checked={winnerBonus2s.club2}
                          onChange={(e) => setWinnerBonus2s({ ...winnerBonus2s, club2: e.target.checked })}
                          className="hidden"
                        />
                        <span className="relative flex items-center justify-center w-5 h-5 border-2 border-blue-400 rounded-md mr-2">
                          {winnerBonus2s.club2 && <span className="absolute text-white text-xs">✔</span>}
                        </span>
                        <span className="ml-2 text-gray-800 font-medium text-base has-[:checked]:text-white">2 ♣ (+7)</span>
                      </label>
                      <label className="flex items-center bg-white bg-opacity-80 px-4 py-3 rounded-lg cursor-pointer hover:bg-opacity-100 transition-colors shadow-sm border border-gray-200 has-[:checked]:bg-blue-500 has-[:checked]:text-white has-[:checked]:border-blue-600 has-[:checked]:shadow-md">
                        <input
                          type="checkbox"
                          checked={winnerBonus2s.heart2}
                          onChange={(e) => setWinnerBonus2s({ ...winnerBonus2s, heart2: e.target.checked })}
                          className="hidden"
                        />
                        <span className="relative flex items-center justify-center w-5 h-5 border-2 border-blue-400 rounded-md mr-2">
                          {winnerBonus2s.heart2 && <span className="absolute text-white text-xs">✔</span>}
                        </span>
                        <span className="ml-2 text-gray-800 font-medium text-base has-[:checked]:text-white">2 ♥ (+9)</span>
                      </label>
                      <label className="flex items-center bg-white bg-opacity-80 px-4 py-3 rounded-lg cursor-pointer hover:bg-opacity-100 transition-colors shadow-sm border border-gray-200 has-[:checked]:bg-blue-500 has-[:checked]:text-white has-[:checked]:border-blue-600 has-[:checked]:shadow-md">
                        <input
                          type="checkbox"
                          checked={winnerBonus2s.spade2}
                          onChange={(e) => setWinnerBonus2s({ ...winnerBonus2s, spade2: e.target.checked })}
                          className="hidden"
                        />
                        <span className="relative flex items-center justify-center w-5 h-5 border-2 border-blue-400 rounded-md mr-2">
                          {winnerBonus2s.spade2 && <span className="absolute text-white text-xs">✔</span>}
                        </span>
                        <span className="ml-2 text-gray-800 font-medium text-base has-[:checked]:text-white">2 ♠ (+11)</span>
                      </label>
                    </div>
                  </div>

                  {/* Bonus Kartu Spesial */}
                  <div className="mb-5">
                    <label className="block text-lg font-medium text-gray-700 mb-3">Bonus Kartu Spesial:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-center bg-white bg-opacity-80 px-4 py-3 rounded-lg cursor-pointer hover:bg-opacity-100 transition-colors shadow-sm border border-gray-200 has-[:checked]:bg-blue-500 has-[:checked]:text-white has-[:checked]:border-blue-600 has-[:checked]:shadow-md">
                        <input
                          type="checkbox"
                          checked={winnerSpecialHands.royalStraightFlush}
                          onChange={(e) => setWinnerSpecialHands({ ...winnerSpecialHands, royalStraightFlush: e.target.checked })}
                          className="hidden"
                        />
                        <span className="relative flex items-center justify-center w-5 h-5 border-2 border-blue-400 rounded-md mr-2">
                          {winnerSpecialHands.royalStraightFlush && <span className="absolute text-white text-xs">✔</span>}
                        </span>
                        <span className="ml-2 text-gray-800 font-medium text-base has-[:checked]:text-white">Royal/Straight Flush (+30)</span>
                      </label>
                      <label className="flex items-center bg-white bg-opacity-80 px-4 py-3 rounded-lg cursor-pointer hover:bg-opacity-100 transition-colors shadow-sm border border-gray-200 has-[:checked]:bg-blue-500 has-[:checked]:text-white has-[:checked]:border-blue-600 has-[:checked]:shadow-md">
                        <input
                          type="checkbox"
                          checked={winnerSpecialHands.fourOfAKind}
                          onChange={(e) => setWinnerSpecialHands({ ...winnerSpecialHands, fourOfAKind: e.target.checked })}
                          className="hidden"
                        />
                        <span className="relative flex items-center justify-center w-5 h-5 border-2 border-blue-400 rounded-md mr-2">
                          {winnerSpecialHands.fourOfAKind && <span className="absolute text-white text-xs">✔</span>}
                        </span>
                        <span className="ml-2 text-gray-800 font-medium text-base has-[:checked]:text-white">Four of a Kind (+20)</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* Input Kartu Sisa Pemain yang Kalah */}
              <h3 className="text-2xl font-semibold text-blue-700 mb-4 mt-8 text-center">Kartu Sisa Pemain yang Kalah:</h3>
              {players.filter(p => p.id !== winnerId).map(player => (
                <div key={player.id} className="bg-white p-5 rounded-xl shadow-md mb-6 border border-blue-100">
                  <h4 className="text-xl font-medium text-gray-800 mb-4">{player.name}</h4>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                    <div className="flex-grow w-full">
                      <label htmlFor={`remaining-cards-${player.id}`} className="block text-base font-medium text-gray-700 mb-2">
                        Jumlah Kartu Sisa:
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustRemainingCards(player.id, -1)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors shadow-sm"
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
                          className="w-20 text-center p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 outline-none text-lg font-bold"
                        />
                        <button
                          onClick={() => adjustRemainingCards(player.id, 1)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors shadow-sm"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {[0, 5, 10, 13].map(count => (
                          <button
                            key={count}
                            onClick={() => handleRemainingCardsChange(player.id, count)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm ${
                              parseInt(loserInputs[player.id]?.remainingCards) === count
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {count}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                      <label className="block text-base font-medium text-gray-700 mb-2">Kartu '2' yang Tersisa:</label>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                        <label className="flex items-center text-sm bg-white bg-opacity-80 px-3 py-2 rounded-lg cursor-pointer hover:bg-opacity-100 transition-colors shadow-sm border border-gray-200 has-[:checked]:bg-red-500 has-[:checked]:text-white has-[:checked]:border-red-600 has-[:checked]:shadow-md">
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
                            className="hidden"
                          />
                          <span className="relative flex items-center justify-center w-5 h-5 border-2 border-red-400 rounded-md mr-2">
                            {loserInputs[player.id]?.bonus2s.diamond2 && <span className="absolute text-white text-xs">✔</span>}
                          </span>
                          <span className="text-gray-800 font-medium text-base has-[:checked]:text-white">2 ♦ (-5)</span>
                        </label>
                        <label className="flex items-center text-sm bg-white bg-opacity-80 px-3 py-2 rounded-lg cursor-pointer hover:bg-opacity-100 transition-colors shadow-sm border border-gray-200 has-[:checked]:bg-green-500 has-[:checked]:text-white has-[:checked]:border-green-600 has-[:checked]:shadow-md">
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
                            className="hidden"
                          />
                          <span className="relative flex items-center justify-center w-5 h-5 border-2 border-green-400 rounded-md mr-2">
                            {loserInputs[player.id]?.bonus2s.club2 && <span className="absolute text-white text-xs">✔</span>}
                          </span>
                          <span className="text-gray-800 font-medium text-base has-[:checked]:text-white">2 ♣ (-7)</span>
                        </label>
                        <label className="flex items-center text-sm bg-white bg-opacity-80 px-3 py-2 rounded-lg cursor-pointer hover:bg-opacity-100 transition-colors shadow-sm border border-gray-200 has-[:checked]:bg-red-600 has-[:checked]:text-white has-[:checked]:border-red-700 has-[:checked]:shadow-md">
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
                            className="hidden"
                          />
                          <span className="relative flex items-center justify-center w-5 h-5 border-2 border-red-500 rounded-md mr-2">
                            {loserInputs[player.id]?.bonus2s.heart2 && <span className="absolute text-white text-xs">✔</span>}
                          </span>
                          <span className="text-gray-800 font-medium text-base has-[:checked]:text-white">2 ♥ (-9)</span>
                        </label>
                        <label className="flex items-center text-sm bg-white bg-opacity-80 px-3 py-2 rounded-lg cursor-pointer hover:bg-opacity-100 transition-colors shadow-sm border border-gray-200 has-[:checked]:bg-gray-800 has-[:checked]:text-white has-[:checked]:border-gray-900 has-[:checked]:shadow-md">
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
                            className="hidden"
                          />
                          <span className="relative flex items-center justify-center w-5 h-5 border-2 border-gray-600 rounded-md mr-2">
                            {loserInputs[player.id]?.bonus2s.spade2 && <span className="absolute text-white text-xs">✔</span>}
                          </span>
                          <span className="text-gray-800 font-medium text-base has-[:checked]:text-white">2 ♠ (-11)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Tombol Aksi */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <button
                  onClick={applyRoundScores}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Hitung & Tambah Skor
                </button>
                <button
                  onClick={resetRoundForm}
                  className="flex-1 bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-800 font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Reset Form
                </button>
              </div>
            </div>

            {/* Bagian Tabel Skor */}
            <div className="bg-green-50 p-6 rounded-xl shadow-2xl border border-green-200">
              <h2 className="text-3xl font-bold text-green-700 mb-5 text-center">Papan Skor</h2>
              <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                <table className="min-w-full bg-white">
                  <thead className="bg-green-100 border-b border-green-200">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-green-800 uppercase tracking-wider rounded-tl-lg">Pemain</th>
                      <th className="py-3 px-4 text-right text-sm font-semibold text-green-800 uppercase tracking-wider rounded-tr-lg">Skor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.sort((a, b) => b.score - a.score).map((player, index) => (
                      <tr key={player.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-green-50'} border-b border-gray-100 last:border-b-0 transition-all duration-150 hover:bg-green-100`}>
                        <td className="py-3 px-4 text-left text-gray-700 font-medium text-lg">{player.name}</td>
                        <td className="py-3 px-4 text-right text-gray-900 font-extrabold text-2xl">{player.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Ringkasan Skor Babak Sebelumnya */}
              {chapterSummaries.length > 0 && (
                <div className="mt-8 bg-white p-5 rounded-xl shadow-md border border-gray-200">
                  <h3 className="text-2xl font-semibold text-green-700 mb-4 text-center">Riwayat Babak:</h3>
                  {chapterSummaries.map((summary, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm mb-4 border border-gray-100 last:mb-0">
                      <h4 className="text-lg font-bold text-green-800 mb-2">Babak {summary.chapter}</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {Object.entries(summary.scores).map(([playerName, score]) => (
                          <li key={playerName} className="text-gray-700 text-base">{playerName}: <span className="font-semibold">{score}</span></li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={resetGame}
                className="mt-8 w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
