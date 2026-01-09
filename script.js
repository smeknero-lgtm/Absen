const API_URL = "https://script.google.com/macros/s/AKfycbzb13t8Gv6eMl5QCrGtWNP_zngryYpYanEP0IBIyGhqpir1FI5NgcXE7mCsin15xtkr/exec";

let dataSiswa = [];
let editData = [];

// ================= IMPORT SISWA =================
function importSiswa() {
  const file = fileSiswa.files[0];
  if (!file) return alert("Pilih file CSV");

  const r = new FileReader();
  r.onload = e => {
    const rows = e.target.result
      .split("\n")
      .map(x => x.split(",").map(y => y.trim()))
      .filter(x => x.length === 3 && x[0]);

    fetch(API_URL + "?action=import", {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(rows)
    });

    alert("Import diproses, cek Google Sheets");
  };
  r.readAsText(file);
}

// ================= LOAD SISWA =================
function loadSiswa() {
  fetch(API_URL)
    .then(r => r.json())
    .then(d => {
      dataSiswa = d.filter(x => x[0] === jurusan.value && x[1] === kelas.value);
      tabel.querySelector("tbody").innerHTML = dataSiswa.map((s,i)=>`
        <tr>
          <td>${i+1}</td>
          <td>${s[2]}</td>
          <td>
            <select id="st${i}">
              <option>Hadir</option><option>Sakit</option>
              <option>Izin</option><option>Alpha</option><option>Bolos</option>
            </select>
          </td>
        </tr>`).join("");
    });
}

// ================= SIMPAN ABSEN (ANTI DOBEL) =================
function simpanAbsensi() {
  const btn = document.querySelector(".simpan");

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

  // 🔒 KUNCI TOMBOL LANGSUNG
  btn.disabled = true;
  btn.innerText = "Absensi Terkunci";

  const payload = dataSiswa.map((s, i) => ({
    tanggal,
    jurusan,
    kelas,
    nama: s[2],
    status: document.getElementById("st" + i).value,
    petugas
  }));

  fetch(API_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(payload)
  });

  alert("✅ Absensi tersimpan (1x saja)");
}


// ================= REKAP =================
function tampilRekap(){
  fetch(`${API_URL}?action=rekap&bulan=${bulan.value}&jurusan=${rekapJurusan.value}&kelas=${rekapKelas.value}`)
    .then(r=>r.json())
    .then(d=>{
      rekapTable.querySelector("tbody").innerHTML =
        Object.keys(d).map(n=>`
        <tr>
          <td>${n}</td>
          <td>${d[n].Hadir}</td><td>${d[n].Sakit}</td>
          <td>${d[n].Izin}</td><td>${d[n].Alpha}</td><td>${d[n].Bolos}</td>
        </tr>`).join("");
    });
}

// ================= EDIT ABSEN =================
function loadEditAbsen(){
  fetch(`${API_URL}?action=getAbsen&tanggal=${editTanggal.value}&jurusan=${editJurusan.value}&kelas=${editKelas.value}`)
    .then(r=>r.json())
    .then(d=>{
      editData=d;
      editTable.querySelector("tbody").innerHTML=d.map((x,i)=>`
        <tr>
          <td>${x.nama}</td>
          <td>
            <select id="es${i}">
              <option ${x.status=="Hadir"?"selected":""}>Hadir</option>
              <option ${x.status=="Sakit"?"selected":""}>Sakit</option>
              <option ${x.status=="Izin"?"selected":""}>Izin</option>
              <option ${x.status=="Alpha"?"selected":""}>Alpha</option>
              <option ${x.status=="Bolos"?"selected":""}>Bolos</option>
            </select>
          </td>
        </tr>`).join("");
    });
}

function simpanEditAbsen(){
  fetch(API_URL+"?action=updateAbsen",{
    method:"POST",mode:"no-cors",
    body:JSON.stringify(editData.map((x,i)=>({row:x.row,status:document.getElementById("es"+i).value})))
  });
  alert("Perubahan disimpan");
}
