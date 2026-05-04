/* ========================================
   KONFIGURASI GLOBAL
   ======================================== */

// Password admin (bisa diubah)
const ADMIN_PASSWORD = '12345';

// Teks yang ditampilkan di halaman 4
const DISPLAY_TEXT = 'Terima kasih telah mengunjungi website kami. Semoga Anda menikmati pengalaman interaktif ini! 🎉';

// URL gambar galeri
const GALLERY_IMAGES = [
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&h=400&fit=crop'
];

// Lagu default (jika belum ada di localStorage)
const DEFAULT_SONGS = [
    { title: 'Lagu Sampel 1', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { title: 'Lagu Sampel 2', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { title: 'Lagu Sampel 3', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
];

// Emoji untuk halaman terakhir
const EMOJIS = ['🎉', '🎊', '✨', '🌟', '💫', '⭐', '🎈', '🎁', '🏆', '👏', '🙌', '💖'];

/* ========================================
   VARIABEL GLOBAL
   ======================================== */

let currentPage = 1; // Halaman saat ini
let currentSongIndex = 0; // Index lagu saat ini
let isPlaying = false; // Status audio
let adminMode = false; // Status admin
let songs = []; // Daftar lagu
let currentGalleryIndex = 0; // Index galeri foto
let typingInterval; // Interval untuk typing effect

/* ========================================
   FUNGSI INISIALISASI
   ======================================== */

// Jalankan saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Website dimulai!');
    
    // Load lagu dari localStorage atau gunakan default
    loadSongs();
    
    // Setup event listeners
    setupEventListeners();
    
    // Render daftar lagu
    renderSongsList();
});

/* ========================================
   SETUP EVENT LISTENERS
   ======================================== */

function setupEventListeners() {
    // Halaman 1: Tombol Play
    document.getElementById('btn-play').addEventListener('click', function() {
        console.log('🎮 Tombol Play diklik!');
        goToPage(2);
    });

    // Halaman 2: Tombol Admin
    document.getElementById('btn-admin').addEventListener('click', function() {
        console.log('🔐 Tombol Admin diklik!');
        if (!adminMode) {
            showAdminModal();
        } else {
            hideAdminPanel();
            adminMode = false;
        }
    });

    // Modal Admin: Tombol Confirm
    document.getElementById('btn-modal-confirm').addEventListener('click', function() {
        const password = document.getElementById('admin-password').value;
        if (password === ADMIN_PASSWORD) {
            console.log('✅ Password benar!');
            adminMode = true;
            hideAdminModal();
            showAdminPanel();
            document.getElementById('admin-password').value = '';
        } else {
            alert('❌ Password salah!');
        }
    });

    // Modal Admin: Tombol Cancel
    document.getElementById('btn-modal-cancel').addEventListener('click', hideAdminModal);

    // Halaman 2: Tombol Tambah Lagu
    document.getElementById('btn-add-song').addEventListener('click', addNewSong);

    // Audio Player: Play/Pause
    document.getElementById('btn-play-pause').addEventListener('click', function() {
        const audio = document.getElementById('audio-player');
        if (isPlaying) {
            audio.pause();
            this.textContent = '▶';
            isPlaying = false;
        } else {
            audio.play();
            this.textContent = '⏸';
            isPlaying = true;
        }
    });

    // Audio Player: Next
    document.getElementById('btn-next').addEventListener('click', playNextSong);

    // Audio Player: Previous
    document.getElementById('btn-prev').addEventListener('click', playPreviousSong);

    // Audio Player: Progress bar
    document.getElementById('audio-player').addEventListener('timeupdate', updateProgressBar);
    document.getElementById('audio-player').addEventListener('ended', playNextSong);
    document.getElementById('audio-player').addEventListener('loadedmetadata', updateDuration);

    // Audio Player: Click progress bar
    document.querySelector('.progress-bar').addEventListener('click', function(e) {
        const audio = document.getElementById('audio-player');
        const rect = this.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * audio.duration;
    });

    // Halaman 5: Klik untuk emoji
    document.getElementById('clickable-final').addEventListener('click', function() {
        console.log('🎉 Area diklik! Emoji akan muncul!');
        createEmojiRain();
    });
}

/* ========================================
   NAVIGASI HALAMAN
   ======================================== */

// Fungsi pindah halaman
function goToPage(pageNumber) {
    console.log(`📄 Pindah ke halaman ${pageNumber}`);
    
    // Sembunyikan semua halaman
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    // Tampilkan halaman yang diminta
    const targetPage = document.getElementById(`page-entrance`);
    if (pageNumber === 1) {
        document.getElementById('page-entrance').classList.add('active');
    } else if (pageNumber === 2) {
        document.getElementById('page-music').classList.add('active');
    } else if (pageNumber === 3) {
        document.getElementById('page-gallery').classList.add('active');
        startGallery();
    } else if (pageNumber === 4) {
        document.getElementById('page-text').classList.add('active');
        startTypingEffect();
    } else if (pageNumber === 5) {
        document.getElementById('page-final').classList.add('active');
    }

    currentPage = pageNumber;
    
    // Reset audio saat pindah halaman
    if (pageNumber !== 2) {
        stopAudio();
    }
}

/* ========================================
   HALAMAN 2: MUSIK
   ======================================== */

// Load lagu dari localStorage atau gunakan default
function loadSongs() {
    const saved = localStorage.getItem('songs');
    if (saved) {
        songs = JSON.parse(saved);
        console.log('📁 Lagu dimuat dari localStorage:', songs.length, 'lagu');
    } else {
        songs = JSON.parse(JSON.stringify(DEFAULT_SONGS));
        saveSongs();
        console.log('📁 Menggunakan lagu default:', songs.length, 'lagu');
    }
}

// Simpan lagu ke localStorage
function saveSongs() {
    localStorage.setItem('songs', JSON.stringify(songs));
    console.log('💾 Lagu disimpan ke localStorage');
}

// Render daftar lagu di halaman
function renderSongsList() {
    const container = document.getElementById('songs-container');
    container.innerHTML = '';

    songs.forEach((song, index) => {
        const songCard = document.createElement('div');
        songCard.className = 'song-card';
        songCard.innerHTML = `
            <div class="song-title">🎵 ${song.title}</div>
            <div class="song-actions">
                <button class="btn-play-song" data-index="${index}">Play</button>
                ${adminMode ? `<button class="btn-delete-song" data-index="${index}">Hapus</button>` : ''}
            </div>
        `;
        container.appendChild(songCard);

        // Event listener untuk tombol play lagu
        songCard.querySelector('.btn-play-song').addEventListener('click', function() {
            const idx = parseInt(this.dataset.index);
            playSong(idx);
            goToPage(2); // Tetap di halaman musik
        });

        // Event listener untuk tombol hapus (hanya untuk admin)
        if (adminMode) {
            const deleteBtn = songCard.querySelector('.btn-delete-song');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function() {
                    const idx = parseInt(this.dataset.index);
                    deleteSong(idx);
                });
            }
        }
    });

    console.log('🎵 Daftar lagu di-render:', songs.length, 'lagu ditampilkan');
}

// Tambah lagu baru
function addNewSong() {
    const title = document.getElementById('song-title').value.trim();
    const url = document.getElementById('song-url').value.trim();

    if (!title || !url) {
        alert('⚠️ Judul dan URL harus diisi!');
        return;
    }

    songs.push({ title, url });
    saveSongs();
    renderSongsList();
    
    // Bersihkan form
    document.getElementById('song-title').value = '';
    document.getElementById('song-url').value = '';
    
    alert(`✅ Lagu "${title}" berhasil ditambahkan!`);
    console.log('🎵 Lagu baru ditambahkan:', title);
}

// Hapus lagu
function deleteSong(index) {
    const title = songs[index].title;
    if (confirm(`Yakin ingin menghapus "${title}"?`)) {
        songs.splice(index, 1);
        saveSongs();
        renderSongsList();
        console.log('🗑️ Lagu dihapus:', title);
    }
}

// Putar lagu
function playSong(index) {
    if (index < 0 || index >= songs.length) return;

    currentSongIndex = index;
    const song = songs[index];
    const audio = document.getElementById('audio-player');

    console.log('🎵 Memutar:', song.title);

    // Update info lagu
    document.getElementById('current-song').textContent = `▶ ${song.title}`;

    // Muat dan putar audio
    audio.src = song.url;
    audio.play();
    isPlaying = true;
    document.getElementById('btn-play-pause').textContent = '⏸';

    // Highlight lagu yang sedang diputar
    document.querySelectorAll('.song-card').forEach((card, i) => {
        if (i === index) {
            card.style.borderColor = '#64b5f6';
            card.style.background = 'rgba(100, 181, 246, 0.3)';
        } else {
            card.style.borderColor = '#2196F3';
            card.style.background = 'rgba(33, 150, 243, 0.2)';
        }
    });
}

// Lagu berikutnya
function playNextSong() {
    if (songs.length === 0) return;
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSong(currentSongIndex);
}

// Lagu sebelumnya
function playPreviousSong() {
    if (songs.length === 0) return;
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(currentSongIndex);
}

// Update progress bar
function updateProgressBar() {
    const audio = document.getElementById('audio-player');
    if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        document.getElementById('progress').style.width = percent + '%';
        document.getElementById('current-time').textContent = formatTime(audio.currentTime);
    }
}

// Update durasi lagu
function updateDuration() {
    const audio = document.getElementById('audio-player');
    document.getElementById('duration').textContent = formatTime(audio.duration);
}

// Format waktu (mm:ss)
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Stop audio
function stopAudio() {
    const audio = document.getElementById('audio-player');
    audio.pause();
    isPlaying = false;
    document.getElementById('btn-play-pause').textContent = '▶';
}

/* ========================================
   HALAMAN 2: ADMIN MODE
   ======================================== */

// Tampilkan modal admin
function showAdminModal() {
    document.getElementById('admin-modal').classList.add('active');
    document.getElementById('admin-password').focus();
}

// Sembunyikan modal admin
function hideAdminModal() {
    document.getElementById('admin-modal').classList.remove('active');
    document.getElementById('admin-password').value = '';
}

// Tampilkan admin panel
function showAdminPanel() {
    document.getElementById('admin-panel').classList.remove('hidden');
    document.getElementById('btn-admin').textContent = '🔓 Mode Admin (Aktif)';
    renderSongsList();
}

// Sembunyikan admin panel
function hideAdminPanel() {
    document.getElementById('admin-panel').classList.add('hidden');
    document.getElementById('btn-admin').textContent = '🔐 Mode Admin';
    renderSongsList();
}

/* ========================================
   HALAMAN 3: GALERI FOTO
   ======================================== */

// Mulai galeri otomatis
function startGallery() {
    console.log('📸 Galeri dimulai');
    currentGalleryIndex = 0;
    showGalleryImage(0);

    // Ganti gambar setiap 3 detik
    const galleryInterval = setInterval(() => {
        currentGalleryIndex++;
        
        if (currentGalleryIndex >= GALLERY_IMAGES.length) {
            // Foto terakhir: tambah blur
            document.getElementById('gallery-image').classList.add('blur');
            clearInterval(galleryInterval);
            
            // Pindah ke halaman berikutnya setelah 2 detik
            setTimeout(() => {
                document.getElementById('gallery-image').classList.remove('blur');
                goToPage(4);
            }, 2000);
        } else {
            showGalleryImage(currentGalleryIndex);
        }
    }, 3000);
}

// Tampilkan gambar galeri
function showGalleryImage(index) {
    const img = document.getElementById('gallery-image');
    img.src = GALLERY_IMAGES[index];
    
    document.getElementById('photo-count').textContent = index + 1;
    document.getElementById('photo-total').textContent = GALLERY_IMAGES.length;
    
    console.log(`📸 Menampilkan foto ${index + 1}/${GALLERY_IMAGES.length}`);
}

/* ========================================
   HALAMAN 4: TYPING EFFECT
   ======================================== */

// Mulai efek mengetik
function startTypingEffect() {
    console.log('⌨️ Typing effect dimulai');
    
    const textElement = document.getElementById('typing-text');
    textElement.textContent = '';
    
    let index = 0;
    
    // Ketik karakter satu per satu
    typingInterval = setInterval(() => {
        if (index < DISPLAY_TEXT.length) {
            textElement.textContent += DISPLAY_TEXT[index];
            index++;
        } else {
            // Selesai mengetik, pindah ke halaman berikutnya setelah 2 detik
            clearInterval(typingInterval);
            setTimeout(() => {
                goToPage(5);
            }, 2000);
        }
    }, 50); // Kecepatan mengetik (ms per karakter)
}

/* ========================================
   HALAMAN 5: EMOJI RAIN
   ======================================== */

// Buat emoji rain animation
function createEmojiRain() {
    console.log('🎉 Emoji rain dimulai!');
    
    const container = document.getElementById('emoji-container');
    
    // Buat 20 emoji jatuh
    for (let i = 0; i < 20; i++) {
        const emoji = document.createElement('div');
        emoji.className = 'emoji';
        emoji.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        
        // Posisi random di atas layar
        emoji.style.left = Math.random() * 100 + '%';
        emoji.style.top = '-50px';
        
        // Durasi jatuh random
        const duration = 2 + Math.random() * 2;
        emoji.style.animationDuration = duration + 's';
        
        // Delay random
        emoji.style.animationDelay = Math.random() * 0.5 + 's';
        
        container.appendChild(emoji);
        
        // Hapus emoji setelah selesai animasi
        setTimeout(() => {
            emoji.remove();
        }, (duration + 0.5) * 1000);
    }
}

/* ========================================
   DEBUGGING
   ======================================== */

// Log info saat halaman dimuat
console.log('%c🚀 Website Interaktif Dimulai!', 'color: #00ff00; font-size: 16px; font-weight: bold;');
console.log('📋 Total gambar galeri:', GALLERY_IMAGES.length);
console.log('🎵 Total lagu default:', DEFAULT_SONGS.length);
console.log('⭐ Total emoji:', EMOJIS.length);
