const API_URL = "https://script.google.com/macros/s/AKfycbzLOZDZQc7eBTjgTbyqEFPzCWHK1N3UDFPKN-2ZmeJEWG8xZq5PrRb0V61Zpf9VdOJF/exec";

let dataSiswa = [];

// ================= LOAD SISWA =================
function loadSiswa() {
  fetch(API_URL)
    .then(r => r.json())
    .then(d => {
      dataSiswa = d.filter(x =>
        x[0] === jurusan.value && x[1] === kelas.value
      );

      tabel.querySelector("tbody").innerHTML = dataSiswa.map((s,i)=>`
        <tr>
          <td>${i+1}</td>
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
        </tr>`).join("");
    });
}

// ================= SIMPAN ABSENSI =================
function simpanAbsensi() {
  if (!petugas.value) {
    alert("Nama petugas wajib diisi");
    return;
  }

  const payload = dataSiswa.map((s,i)=>({
    tanggal: tanggal.value,
    jurusan: jurusan.value,
    kelas: kelas.value,
    nama: s[2],
    status: document.getElementById("st"+i).value,
    petugas: petugas.value
  }));

  fetch(API_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(payload)
  });

  alert("Absensi tersimpan");
}

// ================= REKAP BULANAN =================
function tampilRekap() {
  fetch(`${API_URL}?action=rekap&bulan=${bulan.value}&jurusan=${rekapJurusan.value}&kelas=${rekapKelas.value}`)
    .then(r=>r.json())
    .then(d=>{
      rekapTable.querySelector("tbody").innerHTML =
        Object.keys(d).map(n=>`
        <tr>
          <td>${n}</td>
          <td>${d[n].Hadir}</td>
          <td>${d[n].Sakit}</td>
          <td>${d[n].Izin}</td>
          <td>${d[n].Alpha}</td>
          <td>${d[n].Bolos}</td>
        </tr>`).join("");
    });
}

// ================= DOWNLOAD LAPORAN HARIAN =================
function downloadLaporan() {
  const tgl = lapTanggal.value;
  const jur = lapJurusan.value;
  const kel = lapKelas.value;

  fetch(`${API_URL}?action=harian&tanggal=${tgl}&jurusan=${jur}&kelas=${kel}`)
    .then(r => r.json())
    .then(data => {
      if (!data || data.length === 0) {
        alert("Tidak ada data absensi");
        return;
      }

      let html = `
      <h2>SMKN 1 ROBATAL</h2>
      <h3>Laporan Absensi Harian</h3>
      <p>${tgl} | ${jur} ${kel}</p>
      <table border="1" cellpadding="5" cellspacing="0">
      <tr><th>No</th><th>Nama</th><th>Status</th></tr>`;

      data.forEach((d,i)=>{
        html += `<tr><td>${i+1}</td><td>${d.nama}</td><td>${d.status}</td></tr>`;
      });

      html += `</table>`;

      const blob = new Blob([html], { type: "text/html" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Laporan_${jur}_${kel}_${tgl}.html`;
      link.click();
    });
}

// ================= DOWNLOAD REKAP SEMUA KELAS =================
function downloadRekapSemua() {
  const tgl = document.getElementById("rekapSemuaTanggal").value;

  fetch(`${API_URL}?action=rekapSemua&tanggal=${tgl}`)
    .then(r => r.json())
    .then(data => {
      if (!data || Object.keys(data).length === 0) {
        alert("Tidak ada data rekap");
        return;
      }

      let html = `<h2>REKAP SEMUA KELAS</h2><p>Tanggal: ${tgl}</p>`;

      for (let k in data) {
        html += `<h3>${k}</h3><ul>`;
        for (let s in data[k]) {
          html += `<li>${s}: ${data[k][s]}</li>`;
        }
        html += `</ul>`;
      }

      const blob = new Blob([html], { type:"text/html" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `Rekap_Semua_Kelas_${tgl}.html`;
      a.click();
    });
}
