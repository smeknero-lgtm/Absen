const API_URL="https://script.google.com/macros/s/AKfycbz3hYpCJ7nhfQLeVU9PWqYwWM0jGVki13A4wJceb7oaz5lUk0OjYIClR554PQy5Woin/exec";
let dataSiswa=[];
document.getElementById("tanggal").value=new Date().toISOString().slice(0,10);

function loadSiswa(){
fetch(API_URL).then(r=>r.json()).then(data=>{
const j=jurusan.value,k=kelas.value;
dataSiswa=data.filter(d=>d[0]==j && d[1]==k);
let h="";
dataSiswa.forEach((s,i)=>{
h+=`<tr><td>${i+1}</td><td>${s[2]}</td>
<td><select id="st${i}">
<option>Hadir</option><option>Izin</option>
<option>Sakit</option><option>Alpha</option><option>Bolos</option>
</select></td></tr>`});
document.querySelector("tbody").innerHTML=h;
})}

function simpanAbsensi(){
const t=tanggal.value,j=jurusan.value,k=kelas.value,p=petugas.value;
const payload=dataSiswa.map((s,i)=>({
tanggal:t,jurusan:j,kelas:k,nama:s[2],
status:document.getElementById("st"+i).value,petugas:p
}));
fetch(API_URL,{method:"POST",body:JSON.stringify(payload)})
.then(r=>r.text()).then(res=>{
info.innerText=res==="DUPLIKAT"
?"❌ Absensi kelas ini sudah diisi hari ini"
:"✅ Absensi berhasil disimpan";
});
}

function exportExcel(){
fetch(API_URL+"?action=export").then(r=>r.text())
.then(url=>window.open(url,"_blank"));
}

function importExcel(){
const f=document.getElementById("fileExcel").files[0];
if(!f)return alert("Pilih file CSV");
const r=new FileReader();
r.onload=e=>{
const rows=e.target.result.split("\n").slice(1).map(x=>x.split(","));
fetch(API_URL+"?action=import",{method:"POST",body:JSON.stringify(rows)})
.then(()=>alert("✅ Data siswa berhasil diimport"));
};
r.readAsText(f);
}