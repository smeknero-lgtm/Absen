const API_URL = "https://script.google.com/macros/s/AKfycbxGoSGX7QrVBilAg8SBUtKbt1D3Y6PUYnmwdWP8quLMol1oVOQkv4qnrdbdV6k3txF6/exec";

let dataSiswa = [];
let chartAbsensi = null;

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

      cekKunciAbsen();
    });
}

// ================= CEK KUNCI =================
function cekKunciAbsen() {
  fetch(`${API_URL}?action=cekAbsen&tanggal=${tanggal.value}&jurusan=${jurusan.value}&kelas=${kelas.value}`)
    .then(r => r.json())
    .then(r => {
      const btn = document.querySelector(".simpan");

      if (r.semuaSudah) {
        btn.disabled = true;
        btn.innerText = "Semua Kelas Hari Ini Sudah Terkunci";
      } else if (r.kelasSudah) {
        btn.disabled = true;
        btn.innerText = "Kelas Ini Sudah Diabsen";
      } else {
        btn.disabled = false;
        btn.innerText = "Simpan Absensi";
      }
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
  }).then(()=>{
    alert("Absensi kelas berhasil disimpan");
    cekKunciAbsen();
  });
}

// ================= REKAP BULANAN =================
function tampilRekap() {
  fetch(`${API_URL}?action=rekap&bulan=${bulan.value}&jurusan=${rekapJurusan.value}&kelas=${rekapKelas.value}`)
    .then(r=>r.json())
    .then(d=>{
      const tbody = rekapTable.querySelector("tbody");
      if (!Object.keys(d).length) {
        tbody.innerHTML = `<tr><td colspan="6">Tidak ada data</td></tr>`;
        return;
      }

      tbody.innerHTML = Object.keys(d).map(n=>`
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

// ================= GRAFIK BULANAN =================
function tampilkanGrafik() {
  fetch(`${API_URL}?action=rekap&bulan=${grafikBulan.value}&jurusan=${grafikJurusan.value}&kelas=${grafikKelas.value}`)
    .then(r=>r.json())
    .then(data=>{
      let total = {Hadir:0,Sakit:0,Izin:0,Alpha:0,Bolos:0};
      Object.values(data).forEach(d=>{
        for(let k in total) total[k]+=d[k]||0;
      });

      const totalSemua = Object.values(total).reduce((a,b)=>a+b,0);
      const persen = totalSemua ? ((total.Hadir/totalSemua)*100).toFixed(1) : 0;

      persentaseBox.innerHTML = `<b>Kehadiran:</b> ${persen}%`;

      if(chartAbsensi) chartAbsensi.destroy();
      chartAbsensi = new Chart(grafikAbsensi,{
        type:"bar",
        data:{
          labels:Object.keys(total),
          datasets:[{label:"Rekap Kehadiran", data:Object.values(total)}]
        },
        options:{responsive:true, scales:{y:{beginAtZero:true}}}
      });
    });
}

// ================= LAPORAN HARIAN PER KELAS =================
function downloadLaporan() {
  fetch(`${API_URL}?action=harian&tanggal=${lapTanggal.value}&jurusan=${lapJurusan.value}&kelas=${lapKelas.value}`)
    .then(r=>r.json())
    .then(data=>{
      if (!data.length) {
        alert("Tidak ada data absensi");
        return;
      }

      let html = `<h2>SMKN 1 ROBATAL</h2><h3>Laporan Absensi Harian</h3>
      <p>${lapTanggal.value} - ${lapJurusan.value} ${lapKelas.value}</p>
      <table border="1" cellpadding="5" cellspacing="0">
      <tr><th>No</th><th>Nama</th><th>Status</th></tr>`;

      data.forEach((d,i)=>{
        html += `<tr><td>${i+1}</td><td>${d.nama}</td><td>${d.status}</td></tr>`;
      });

      html += "</table>";

      const blob = new Blob([html], {type:"text/html"});
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `Laporan_${lapJurusan.value}_${lapKelas.value}_${lapTanggal.value}.html`;
      a.click();
    });
}
