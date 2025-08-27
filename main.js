// main.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js'
import { 
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDdr0fxnYpfeG2b6GlTQ_-4TqpmGk2uvOk",
  authDomain: "insan-cemerlang-80713.firebaseapp.com",
  projectId: "insan-cemerlang-80713",
  storageBucket: "insan-cemerlang-80713.appspot.com",
  messagingSenderId: "1016858047753",
  appId: "1:1016858047753:web:0534dda2085c2adab68fd8",
  measurementId: "G-E7G0K9XTCD"
};

// Inisialisasi Firebase
const aplikasi = initializeApp(firebaseConfig)
const basisdata = getFirestore(aplikasi)

// Fungsi untuk mengambil daftar jadwal pelajaran
export async function ambilDaftarJadwal() {
  const refDokumen = collection(basisdata, "jadwal pelajaran");
  const kueri = query(refDokumen, orderBy("hari"), orderBy("jamKe"));
  const cuplikanKueri = await getDocs(kueri);
  
  let hasilKueri = [];
  cuplikanKueri.forEach((dokumen) => {
    hasilKueri.push({
      id: dokumen.id,
      hari: dokumen.data().hari,
      jamKe: dokumen.data().jamKe,
      waktu: dokumen.data().waktu,
      pelajaran: dokumen.data().pelajaran,
      jenis: dokumen.data().jenis
    })
  })
  
  return hasilKueri;
}

// Fungsi untuk menambahkan jadwal baru
export async function tambahJadwal(hari, jamKe, waktu, pelajaran, jenis) {
  try {
    // Menyimpan data ke Firebase
    const refDokumen = await addDoc(collection(basisdata, "jadwal pelajaran"), {
      hari: hari, 
      jamKe: jamKe,
      waktu: waktu,
      pelajaran: pelajaran,
      jenis: jenis
    })
    
    // Menampilkan pesan berhasil
    console.log('Berhasil menyimpan data jadwal')
    return refDokumen.id;
  } catch (error) {
    // Menampilkan pesan gagal 
    console.log('Gagal menyimpan data jadwal:', error)
    throw error;
  }
}

// Fungsi untuk menghapus jadwal
export async function hapusJadwal(id) {
  try {
    await deleteDoc(doc(basisdata, "jadwal pelajaran", id))
    console.log('Berhasil menghapus data jadwal')
  } catch (error) {
    console.log('Gagal menghapus data jadwal:', error)
    throw error;
  }
}

// Fungsi untuk mengubah jadwal
export async function ubahJadwal(id, hari, jamKe, waktu, pelajaran, jenis) {
  try {
    await updateDoc(
      doc(basisdata, "jadwal pelajaran", id),
      { 
        hari: hari, 
        jamKe: jamKe, 
        waktu: waktu, 
        pelajaran: pelajaran, 
        jenis: jenis 
      }
    )
    console.log('Berhasil mengubah data jadwal pelajaran')
  } catch (error) {
    console.log('Gagal mengubah data jadwal pelajaran:', error)
    throw error;
  }
}

// Fungsi untuk mengambil data jadwal berdasarkan ID
export async function ambilJadwal(id) {
  try {
    const refDokumen = doc(basisdata, "jadwal pelajaran", id)
    const snapshotDokumen = await getDoc(refDokumen)
    
    if (snapshotDokumen.exists()) {
      return {
        id: snapshotDokumen.id,
        ...snapshotDokumen.data()
      };
    } else {
      console.log('Dokumen tidak ditemukan')
      return null;
    }
  } catch (error) {
    console.log('Gagal mengambil data jadwal pelajaran:', error)
    throw error;
  }
}

// Fungsi untuk memuat dan menampilkan jadwal ke tabel
export async function muatJadwalKeTabel() {
  try {
    const jadwal = await ambilDaftarJadwal();
    const tbody = document.querySelector('#jadwalpelajaran tbody');
    
    // Kosongkan tabel terlebih dahulu
    tbody.innerHTML = '';
    
    // Kelompokkan jadwal berdasarkan hari
    const jadwalPerHari = {};
    jadwal.forEach(item => {
      if (!jadwalPerHari[item.hari]) {
        jadwalPerHari[item.hari] = [];
      }
      jadwalPerHari[item.hari].push(item);
    });
    
    // Urutan hari
    const urutanHari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    
    // Render jadwal per hari
    urutanHari.forEach(hari => {
      if (jadwalPerHari[hari]) {
        const jadwalHariIni = jadwalPerHari[hari];
        let rowspan = jadwalHariIni.length;
        
        jadwalHariIni.forEach((item, index) => {
          const row = document.createElement('tr');
          row.id = `row-${item.id}`;
          
          // Tentukan kelas CSS berdasarkan jenis
          let kelasPelajaran = '';
          if (item.jenis === 'istirahat') {
            kelasPelajaran = 'istirahat';
          } else if (item.jenis === 'shalat') {
            kelasPelajaran = 'shalat';
          }
          
          if (index === 0) {
            // Baris pertama untuk hari ini, tambahkan rowspan
            row.innerHTML = `
              <td rowspan="${rowspan}">${hari}</td>
              <td>${item.jamKe}</td>
              <td>${item.waktu}</td>
              <td class="${kelasPelajaran}">${item.pelajaran}</td>
              <td class="action-buttons">
                <button class="edit-btn" onclick="bukaModalUbah('${item.id}')">Ubah</button>
                <button class="delete-btn" onclick="hapusJadwalDariTabel('${item.id}')">Hapus</button>
              </td>
            `;
          } else {
            // Baris berikutnya untuk hari yang sama
            row.innerHTML = `
              <td>${item.jamKe}</td>
              <td>${item.waktu}</td>
              <td class="${kelasPelajaran}">${item.pelajaran}</td>
              <td class="action-buttons">
                <button class="edit-btn" onclick="bukaModalUbah('${item.id}')">Ubah</button>
                <button class="delete-btn" onclick="hapusJadwalDariTabel('${item.id}')">Hapus</button>
              </td>
            `;
          }
          
          tbody.appendChild(row);
        });
      }
    });
  } catch (error) {
    console.error('Gagal memuat jadwal pelajaran:', error);
  }
}

// Fungsi untuk menambahkan jadwal dari form
export async function tambahJadwalDariForm() {
  const hari = document.getElementById('tambahHari').value;
  const jamKe = document.getElementById('tambahJamKe').value;
  const waktu = document.getElementById('tambahWaktu').value;
  const pelajaran = document.getElementById('tambahPelajaran').value;
  const jenis = document.getElementById('tambahJenis').value;
  
  try {
    await tambahJadwal(hari, parseInt(jamKe), waktu, pelajaran, jenis);
    await muatJadwalKeTabel();
    tutupModal('tambah');
    alert('Jadwal berhasil ditambahkan!');
  } catch (error) {
    alert('Gagal menambahkan jadwal pelajaran: ' + error.message);
  }
}

// Fungsi untuk mengubah jadwal dari form
export async function ubahJadwalDariForm() {
  const id = document.getElementById('ubahId').value;
  const hari = document.getElementById('ubahHari').value;
  const jamKe = document.getElementById('ubahJamKe').value;
  const waktu = document.getElementById('ubahWaktu').value;
  const pelajaran = document.getElementById('ubahPelajaran').value;
  const jenis = document.getElementById('ubahJenis').value;
  
  try {
    await ubahJadwal(id, hari, parseInt(jamKe), waktu, pelajaran, jenis);
    await muatJadwalKeTabel();
    tutupModal('ubah');
    alert('Jadwal berhasil diubah!');
  } catch (error) {
    alert('Gagal mengubah jadwal: ' + error.message);
  }
}

// Fungsi untuk menghapus jadwal dari tabel
export async function hapusJadwalDariTabel(id) {
  if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
    try {
      await hapusJadwal(id);
      await muatJadwalKeTabel();
      alert('Jadwal berhasil dihapus!');
    } catch (error) {
      alert('Gagal menghapus jadwal: ' + error.message);
    }
  }
}

// Fungsi untuk membuka modal ubah
export async function bukaModalUbah(id) {
  try {
    const jadwal = await ambilJadwal(id);
    if (jadwal) {
      document.getElementById('ubahId').value = jadwal.id;
      document.getElementById('ubahHari').value = jadwal.hari;
      document.getElementById('ubahJamKe').value = jadwal.jamKe;
      document.getElementById('ubahWaktu').value = jadwal.waktu;
      document.getElementById('ubahPelajaran').value = jadwal.pelajaran;
      document.getElementById('ubahJenis').value = jadwal.jenis;
      bukaModal('ubah');
    }
  } catch (error) {
    alert('Gagal memuat data jadwal: ' + error.message);
  }
}

// Fungsi untuk membuka modal
export function bukaModal(jenis) {
  document.getElementById(`modal${jenis.charAt(0).toUpperCase() + jenis.slice(1)}`).style.display = 'block';
}

// Fungsi untuk menutup modal
export function tutupModal(jenis) {
  document.getElementById(`modal${jenis.charAt(0).toUpperCase() + jenis.slice(1)}`).style.display = 'none';
}

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', async function() {
  // Muat jadwal ke tabel
  await muatJadwalKeTabel();
  
  // Event listener untuk form tambah
  document.getElementById('formTambah').addEventListener('submit', function(e) {
    e.preventDefault();
    tambahJadwalDariForm();
  });
  
  // Event listener untuk form ubah
  document.getElementById('formUbah').addEventListener('submit', function(e) {
    e.preventDefault();
    ubahJadwalDariForm();
  });
  
  // Event listener untuk tombol tutup modal
  document.querySelectorAll('.close').forEach(function(closeBtn) {
    closeBtn.addEventListener('click', function() {
      const modalId = this.closest('.modal').id;
      const jenis = modalId.replace('modal', '').toLowerCase();
      tutupModal(jenis);
    });
  });
  
  // Event listener untuk klik di luar modal
  window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
      const modalId = event.target.id;
      const jenis = modalId.replace('modal', '').toLowerCase();
      tutupModal(jenis);
    }
  });
});

// Ekspor fungsi untuk digunakan di HTML
window.bukaModalUbah = bukaModalUbah;
window.hapusJadwalDariTabel = hapusJadwalDariTabel;
window.bukaModal = bukaModal;
window.tutupModal = tutupModal;