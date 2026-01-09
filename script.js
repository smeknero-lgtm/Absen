/*************************************************
 * KONFIGURASI API
 *************************************************/
const API_URL = "https://script.google.com/macros/s/AKfycbwzPRaMNSjlxNkU7KisKy7J8by-tlgM3RYQReRZde6caP8C4OCPJjQNx3s1HEqyLKMq/exec";

let dataSiswa = [];

/*************************************************
 * IMPORT DATA SISWA
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
      body: JSON.stringify(rows)
    })
      .then(() => alert("✅ Data siswa berhasil diimport"))
      .catch(() => alert("❌ Gagal import data siswa"));
  };
  reader.readAsText(fileInput.files[0]);
}

/*************************************************
 * EXPORT ABSENSI
 *************************************************/
function exportAbsensi() {
  window.open(API_URL + "?action=export", "_blank");
}

/*************************************************
 * LOAD DATA SISWA
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
        html += `
          <tr>
            <td>${i + 1}</td>
            <td>${s[2].replace(/\r/g,"")}</td>
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
    });
}

/*************************************************
 * SIMPAN ABSENSI
 *************************************************/
function simpanAbsensi() {
  if (!dataSiswa.length) return alert("Data siswa belum dimuat");

  const payload = dataSiswa.map((s, i) => ({
    tanggal: tanggal.value,
    jurusan: jurusan.value,
    kelas: kelas.value,
    nama: s[2].replace(/\r/g,""),
    status: document.getElementById("status"+i).value,
    petugas: petugas.value
  }));

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  })
    .then(res => res.text())
    .then(r => {
      info.innerText =
        r === "DUPLIKAT"
          ? "❌ Absensi sudah pernah diisi"
          : "✅ Absensi berhasil disimpan";
    });
}

/*************************************************
 * TAMPILKAN REKAP
 *************************************************/
function tampilRekap() {
  const url = `${API_URL}?action=rekap&bulan=${bulan.value}&jurusan=${rekapJurusan.value}&kelas=${rekapKelas.value}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      let html = "";
      Object.keys(data).forEach(nama => {
        const d = data[nama];
        html += `
          <tr>
            <td>${nama}</td>
            <td>${d.Hadir}</td>
            <td>${d.Sakit}</td>
            <td>${d.Izin}</td>
            <td>${d.Alpha}</td>
            <td>${d.Bolos}</td>
          </tr>`;
      });
      rekapTable.querySelector("tbody").innerHTML =
        html || `<tr><td colspan="6">Tidak ada data</td></tr>`;
    });
}
