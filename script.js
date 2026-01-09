/*************************************************
 * KONFIGURASI API
 *************************************************/
const API_URL = "https://script.google.com/macros/s/AKfycbyGQj38BqGzfLyRBf7cFY1Dm1jR50XDx1rRFThsFDSoZO23px8GTkC9BhZ3tM5TmKKO/exec";

let dataSiswa = [];

/*************************************************
 * LOAD DATA SISWA PER KELAS
 *************************************************/
function loadSiswa() {
  const jurusan = document.getElementById("jurusan").value;
  const kelas = document.getElementById("kelas").value;

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      // filter siswa sesuai jurusan & kelas
      dataSiswa = data.filter(d =>
        d[0] === jurusan && d[1] === kelas
      );

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
          </tr>
        `;
      });

      document.querySelector("#tabel tbody").innerHTML = html;
    })
    .catch(err => {
      alert("Gagal memuat data siswa");
      console.error(err);
    });
}

/*************************************************
 * SIMPAN ABSENSI (ANTI DOBEL)
 *************************************************/
function simpanAbsensi() {
  if (dataSiswa.length === 0) {
    alert("Data siswa belum ditampilkan");
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
    body: JSON.stringify(payload)
  })
    .then(res => res.text())
    .then(res => {
      const info = document.getElementById("info");
      if (res === "DUPLIKAT") {
        info.innerText = "❌ Absensi kelas ini sudah diisi hari ini";
        info.style.color = "red";
      } else {
        info.innerText = "✅ Absensi berhasil disimpan";
        info.style.color = "green";
      }
    })
    .catch(err => {
      alert("Gagal menyimpan absensi");
      console.error(err);
    });
}

/*************************************************
 * TAMPILKAN REKAP PER KELAS & BULAN
 *************************************************/
function tampilRekap() {
  const bulan = document.getElementById("bulan").value;
  const jurusan = document.getElementById("rekapJurusan").value;
  const kelas = document.getElementById("rekapKelas").value;

  if (!bulan) {
    alert("Pilih bulan terlebih dahulu");
    return;
  }

  const url = `${API_URL}?action=rekap&bulan=${bulan}&jurusan=${jurusan}&kelas=${kelas}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      let html = "";

      const namaSiswa = Object.keys(data);
      if (namaSiswa.length === 0) {
        html = `
          <tr>
            <td colspan="6" style="text-align:center">
              Tidak ada data absensi
            </td>
          </tr>`;
      } else {
        namaSiswa.forEach(nama => {
          const d = data[nama];
          html += `
            <tr>
              <td>${nama}</td>
              <td>${d.Hadir || 0}</td>
              <td>${d.Sakit || 0}</td>
              <td>${d.Izin || 0}</td>
              <td>${d.Alpha || 0}</td>
              <td>${d.Bolos || 0}</td>
            </tr>
          `;
        });
      }

      document.querySelector("#rekapTable tbody").innerHTML = html;
    })
    .catch(err => {
      alert("Gagal memuat rekap");
      console.error(err);
    });
}
