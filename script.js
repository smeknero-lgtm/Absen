/*************************************************
 * KONFIGURASI API GOOGLE APPS SCRIPT
 *************************************************/
const API_URL =
  "https://script.google.com/macros/s/AKfycbzAaG7ZJo8IkopG31A28ZnJszTH0AVJd3hR5a9BwIRokjqrN9eQVwXYYhqvWe7RHPbi/exec";

let dataSiswa = [];

/*************************************************
 * IMPORT DATA SISWA (CSV) - NO CORS
 *************************************************/
function importSiswa() {
  const fileInput = document.getElementById("fileSiswa");
  if (!fileInput.files.length) {
    alert("Pilih file CSV terlebih dahulu");
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    const rows = e.target.result
      .split("\n")
      .map(r => r.split(",").map(c => c.trim()))
      .filter(r => r.length === 3 && r[0]);

    fetch(API_URL + "?action=import", {
      method: "POST",
      mode: "no-cors", // 🔑 penting untuk GitHub Pages
      body: JSON.stringify(rows)
    });

    alert("✅ Import diproses. Silakan cek Google Sheets.");
    fileInput.value = "";
  };

  reader.readAsText(fileInput.files[0]);
}

/*************************************************
 * EXPORT ABSENSI (EXCEL)
 *************************************************/
function exportAbsensi() {
  window.open(API_URL + "?action=export", "_blank");
}

/*************************************************
 * LOAD DATA SISWA PER JURUSAN & KELAS
 *************************************************/
function loadSiswa() {
  const jurusan = document.getElementById("jurusan").value;
  const kelas = document.getElementById("kelas").value;

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      dataSiswa = data.filter(d => d[0] === jurusan && d[1] === kelas);

      let html = "";
      dataSiswa.forEach((s, i) => {
        const nama = s[2].toString().replace(/\r/g, "").trim();
        html += `
          <tr>
            <td>${i + 1}</td>
            <td>${nama}</td>
            <td>
              <select id="status${i}">
                <option>Hadir</option>
                <option>Sakit</option>
                <option>Izin</option>
                <option>Alpha</option>
                <option>Bolos</option>
              </select>
            </td>
          </tr>`;
      });

      document.querySelector("#tabel tbody").innerHTML = html;
    })
    .catch(err => {
      alert("Gagal memuat data siswa");
      console.error(err);
    });
}

/*************************************************
 * SIMPAN ABSENSI (ANTI DOBEL PER KELAS & TANGGAL)
 *************************************************/
function simpanAbsensi() {
  if (!dataSiswa.length) {
    alert("Data siswa belum dimuat");
    return;
  }

  const tanggal = document.getElementById("tanggal").value;
  const jurusan = document.getElementById("jurusan").value;
  const kelas = document.getElementById("kelas").value;
  const petugas = document.getElementById("petugas").value;

  if (!petugas) {
    alert("Nama petugas wajib diisi");
    return;
  }

  const payload = dataSiswa.map((s, i) => ({
    tanggal: tanggal,
    jurusan: jurusan,
    kelas: kelas,
    nama: s[2].toString().replace(/\r/g, "").trim(),
    status: document.getElementById("status" + i).value,
    petugas: petugas
  }));

  fetch(API_URL, {
    method: "POST",
    mode: "no-cors", // aman untuk GitHub Pages
    body: JSON.stringify(payload)
  });

  document.getElementById("info").innerText =
    "✅ Absensi dikirim. Cek Google Sheets.";
  document.getElementById("info").style.color = "green";
}

/*************************************************
 * TAMPILKAN REKAP BULANAN PER KELAS
 *************************************************/
function tampilRekap() {
  const bulan = document.getElementById("bulan").value;
  const jurusan = document.getElementById("rekapJurusan").value;
  const kelas = document.getElementById("rekapKelas").value;

  if (!bulan) {
    alert("Pilih bulan terlebih dahulu");
    return;
  }

  const url =
    API_URL +
    `?action=rekap&bulan=${bulan}&jurusan=${jurusan}&kelas=${kelas}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      let html = "";
      const namaList = Object.keys(data);

      if (!namaList.length) {
        html = `<tr><td colspan="6">Tidak ada data</td></tr>`;
      } else {
        namaList.forEach(nama => {
          const d = data[nama];
          html += `
            <tr>
              <td>${nama}</td>
              <td>${d.Hadir || 0}</td>
              <td>${d.Sakit || 0}</td>
              <td>${d.Izin || 0}</td>
              <td>${d.Alpha || 0}</td>
              <td>${d.Bolos || 0}</td>
            </tr>`;
        });
      }

      document.querySelector("#rekapTable tbody").innerHTML = html;
    })
    .catch(err => {
      alert("Gagal memuat rekap");
      console.error(err);
    });
}
