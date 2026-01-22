const API_URL = "https://script.google.com/macros/s/AKfycbyP81vncGaBaH1IBjz8Kjvkepr92KzuPJoOjSPb5FUg8I4seT3OT0rTu2qRlBNfBMZ2/exec";
let dataSiswa = [];

// ================= LOAD SISWA =================
function loadSiswa() {
  fetch(API_URL)
    .then(r=>r.json())
    .then(d=>{
      dataSiswa = d.filter(x => x[0]===jurusan.value && x[1]===kelas.value);
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
    .then(r=>r.json())
    .then(d=>{
      const btn = document.querySelector(".simpan");
      if(d.kelasSudah){
        btn.disabled=true;
        btn.innerText="Sudah Diabsen";
      } else {
        btn.disabled=false;
        btn.innerText="Simpan Absensi";
      }
    });
}

// ================= SIMPAN =================
function simpanAbsensi() {
  if(!petugas.value){alert("Petugas wajib diisi");return;}
  const payload = dataSiswa.map((s,i)=>({
    tanggal:tanggal.value,
    jurusan:jurusan.value,
    kelas:kelas.value,
    nama:s[2],
    status:document.getElementById("st"+i).value,
    petugas:petugas.value
  }));

  fetch(API_URL,{method:"POST",mode:"no-cors",body:JSON.stringify(payload)});
  alert("Absensi tersimpan");
  cekKunciAbsen();
}

// ================= REKAP PER KELAS =================
function tampilRekap(){
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

// ================= DOWNLOAD PER KELAS =================
function downloadLaporan(){
  fetch(`${API_URL}?action=harian&tanggal=${lapTanggal.value}&jurusan=${lapJurusan.value}&kelas=${lapKelas.value}`)
    .then(r=>r.json())
    .then(data=>{
      if(!data.length){alert("Tidak ada data");return;}
      let html=`<h2>Laporan ${lapJurusan.value} ${lapKelas.value}</h2><table border=1>`;
      data.forEach((d,i)=>html+=`<tr><td>${i+1}</td><td>${d.nama}</td><td>${d.status}</td></tr>`);
      html+="</table>";
      downloadFile(html,`Laporan_${lapJurusan.value}_${lapKelas.value}_${lapTanggal.value}.html`);
    });
}

// ================= DOWNLOAD SEMUA KELAS =================
function downloadRekapSemua(){
  fetch(`${API_URL}?action=rekapSemua&tanggal=${rekapSemuaTanggal.value}`)
    .then(r=>r.json())
    .then(data=>{
      if(!Object.keys(data).length){alert("Tidak ada data");return;}
      let html=`<h2>Rekap Semua Kelas</h2>`;
      for(let k in data){
        html+=`<h3>${k}</h3><ul>`;
        for(let s in data[k]) html+=`<li>${s}: ${data[k][s]}</li>`;
        html+="</ul>";
      }
      downloadFile(html,`Rekap_Semua_Kelas_${rekapSemuaTanggal.value}.html`);
    });
}

function downloadFile(content,filename){
  const blob=new Blob([content],{type:"text/html"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=filename;
  a.click();
}
