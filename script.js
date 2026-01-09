const API_URL = "https://script.google.com/macros/s/AKfycbx246mMlaedozcd2zQIMCvdorMsMzDYthhJYniUzyDnHR-wL3zCJhRqqZeQEkWb_g/exec";

let dataSiswa = [];
let editData = [];

/* ================= RESET TOMBOL ================= */
function resetTombol() {
  const btn = document.querySelector(".simpan");
  btn.disabled = false;
  btn.innerText = "Simpan Absensi";
}

/* ================= CEK KUNCI ABSEN ================= */
function cekKunciAbsen() {
  const btn = document.querySelector(".simpan");
  const tgl = tanggal.value;
  const jrs = jurusan.value;
  const kls = kelas.value;

  resetTombol(); // ⬅️ PENTING: buka dulu

  if (!tgl || !jrs || !kls) return;

  fetch(`${API_URL}?action=cekAbsen&tanggal=${tgl}&jurusan=${jrs}&kelas=${kls}`)
    .then(r => r.json())
    .then(r => {
      if (r.sudah) {
        btn.disabled = true;
        btn.innerText = "Absensi Terkunci";
      }
    });
}

/* ================= IMPORT DATA SISWA ================= */
function importSiswa() {
  const file = fileSiswa.files[0];
  if (!file) return alert("Pilih file CSV");

  const reader = new FileReader();
  reader.onload = e => {
    const rows = e.target.result
      .split("\n")
      .map(r => r.split(",").map(x => x.trim()))
      .filter(r => r.length === 3 && r[0]);

    fetch(API_URL + "?action=import", {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(rows)
    });

    alert("Import diproses, cek Google Sheets");
  };
  reader.readAsText(file);
}

/* ================= LOAD SISWA ================= */
function loadSiswa() {
  resetTombol(); // ⬅️ BUKA TOMBOL SAAT GANTI KELAS

  fetch(API_URL)
    .then(r => r.json())
    .then(d => {
      dataSiswa = d.filter(
        x => x[0] === jurusan.value && x[1] === kelas.value
      );

      tabel.querySelector("tbody").innerHTML = dataSiswa
        .map((s, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${s[2]}</td>
            <td>
              <select id="st${i}">
                <option>Hadir</option>
                <option>Sakit</option>
                <option>Izin</option>
                <option>Alpha</option>
                <option>Bolos</option>
              </select>
            </td>
          </tr>
        `).join("");

      cekKunciAbsen(); // ⬅️ CEK SETELAH DATA MUNCUL
    });
}

/* ================= SIMPAN ABSENSI ================= */
function simpanAbsensi() {
  if (!dataSiswa.length) {
    alert("Data siswa belum dimuat");
    return;
  }

  if (!petugas.value) {
    alert("Nama petugas wajib diisi");
    return;
  }

  const btn = document.querySelector(".simpan");
  btn.disabled = true;
  btn.innerText = "Absensi Terkunci";

  const payload = dataSiswa.map((s, i) => ({
    tanggal: tanggal.value,
    jurusan: jurusan.value,
    kelas: kelas.value,
    nama: s[2],
    status: document.getElementById("st" + i).value,
    petugas: petugas.value
  }));

  fetch(API_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(payload)
  });

  alert("✅ Absensi tersimpan");
}

/* ================= REKAP ================= */
function tampilRekap() {
  fetch(`${API_URL}?action=rekap&bulan=${bulan.value}&jurusan=${rekapJurusan.value}&kelas=${rekapKelas.value}`)
    .then(r => r.json())
    .then(d => {
      rekapTable.querySelector("tbody").innerHTML = Object.keys(d)
        .map(n => `
          <tr>
            <td>${n}</td>
            <td>${d[n].Hadir}</td>
            <td>${d[n].Sakit}</td>
            <td>${d[n].Izin}</td>
            <td>${d[n].Alpha}</td>
            <td>${d[n].Bolos}</td>
          </tr>
        `).join("");
    });
}

/* ================= EDIT ABSENSI ================= */
function loadEditAbsen() {
  fetch(`${API_URL}?action=getAbsen&tanggal=${editTanggal.value}&jurusan=${editJurusan.value}&kelas=${editKelas.value}`)
    .then(r => r.json())
    .then(d => {
      editData = d;
      editTable.querySelector("tbody").innerHTML = d
        .map((x, i) => `
          <tr>
            <td>${x.nama}</td>
            <td>
              <select id="es${i}">
                <option ${x.status === "Hadir" ? "selected" : ""}>Hadir</option>
                <option ${x.status === "Sakit" ? "selected" : ""}>Sakit</option>
                <option ${x.status === "Izin" ? "selected" : ""}>Izin</option>
                <option ${x.status === "Alpha" ? "selected" : ""}>Alpha</option>
                <option ${x.status === "Bolos" ? "selected" : ""}>Bolos</option>
              </select>
            </td>
          </tr>
        `).join("");
    });
}

function simpanEditAbsen() {
  fetch(API_URL + "?action=updateAbsen", {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(
      editData.map((x, i) => ({
        row: x.row,
        status: document.getElementById("es" + i).value
      }))
    )
  });

  alert("✅ Perubahan disimpan");
}

/* ================= EXPORT ================= */
function exportAbsensi() {
  fetch(API_URL + "?action=export")
    .then(r => r.text())
    .then(url => window.open(url, "_blank"));
}
