const dataAwal = [
  {
    id: 1,
    tanggal: "2026-09-01",
    keterangan: "Uang saku bulanan",
    jenis: "pemasukan",
    kategori: "Uang Saku",
    nominal: 1000000,
    detail: "detail1.html",
  },
  {
    id: 2,
    tanggal: "2026-09-05",
    keterangan: "Sarapan",
    jenis: "pengeluaran",
    kategori: "Makanan",
    nominal: 21000,
    detail: "detail2.html",
  },
  {
    id: 3,
    tanggal: "2026-09-26",
    keterangan: "Gojek",
    jenis: "pengeluaran",
    kategori: "Transportasi",
    nominal: 42000,
    detail: "detail3.html",
  },
];

let daftarTransaksi = muatData();

function muatData() {
  const tersimpan = localStorage.getItem("fintrack-transaksi");
  if (tersimpan === null) {
    return [...dataAwal];
  }
  return JSON.parse(tersimpan);
}

function simpanData() {
  localStorage.setItem("fintrack-transaksi", JSON.stringify(daftarTransaksi));
}

function formatRupiah(angka) {
  return "Rp" + angka.toLocaleString("id-ID");
}

function formatTanggal(tanggal) {
  const [tahun, bulan, hari] = tanggal.split("-");
  return `${hari}-${bulan}-${tahun}`;
}

function hitungTotal(data, jenis) {
  let total = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i].jenis === jenis) {
      total += data[i].nominal;
    }
  }
  return total;
}

function hitungJumlah(data, jenis) {
  return data.filter((t) => t.jenis === jenis).length;
}

function filterTransaksi(data, jenis) {
  if (jenis === "semua") {
    return data;
  }
  return data.filter((t) => t.jenis === jenis);
}

function urutkanTerbaru(data) {
  return [...data].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}

function hitungPerKategori(data) {
  const hasil = {};
  data.forEach((t) => {
    if (t.jenis === "pengeluaran") {
      if (hasil[t.kategori] === undefined) {
        hasil[t.kategori] = 0;
      }
      hasil[t.kategori] += t.nominal;
    }
  });
  return hasil;
}

function renderDashboard() {
  const pemasukan = hitungTotal(daftarTransaksi, "pemasukan");
  const pengeluaran = hitungTotal(daftarTransaksi, "pengeluaran");
  const saldo = pemasukan - pengeluaran;

  document.getElementById("total-pemasukan").textContent = formatRupiah(pemasukan);
  document.getElementById("total-pengeluaran").textContent = formatRupiah(pengeluaran);
  document.getElementById("sisa-saldo").textContent = formatRupiah(saldo);
  document.getElementById("jumlah-transaksi").textContent = daftarTransaksi.length;

  document.getElementById("info-pemasukan").textContent =
    hitungJumlah(daftarTransaksi, "pemasukan") + " transaksi";
  document.getElementById("info-pengeluaran").textContent =
    hitungJumlah(daftarTransaksi, "pengeluaran") + " transaksi";

  const infoSaldo = document.getElementById("info-saldo");
  if (pemasukan === 0) {
    infoSaldo.textContent = "belum ada pemasukan";
  } else {
    infoSaldo.textContent = Math.round((saldo / pemasukan) * 100) + "% tersisa";
  }

  const perKategori = hitungPerKategori(daftarTransaksi);
  const tabelKategori = document.getElementById("tabel-kategori");
  tabelKategori.innerHTML = "";

  if (pengeluaran === 0) {
    tabelKategori.innerHTML =
      '<tr><td colspan="3" class="text-center text-muted">Belum ada pengeluaran</td></tr>';
  } else {
    for (const kategori in perKategori) {
      const jumlah = perKategori[kategori];
      const persen = Math.round((jumlah / pengeluaran) * 100);
      tabelKategori.innerHTML += `
        <tr>
          <td>${kategori}</td>
          <td class="text-end">${formatRupiah(jumlah)}</td>
          <td class="text-end">${persen}%</td>
        </tr>`;
    }
  }

  const daftarTerakhir = document.getElementById("transaksi-terakhir");
  daftarTerakhir.innerHTML = "";
  const terbaru = urutkanTerbaru(daftarTransaksi).slice(0, 3);

  terbaru.forEach((t) => {
    let warna = "text-success";
    let tanda = "+";
    if (t.jenis === "pengeluaran") {
      warna = "text-danger";
      tanda = "-";
    }
    daftarTerakhir.innerHTML += `
      <li class="list-group-item px-0 d-flex justify-content-between align-items-center">
        <div>
          <div class="fw-semibold">${t.keterangan}</div>
          <small class="text-muted">${formatTanggal(t.tanggal)} &middot; ${t.kategori}</small>
        </div>
        <span class="${warna} fw-semibold">${tanda}${formatRupiah(t.nominal)}</span>
      </li>`;
  });
}

function renderTabelTransaksi(jenis) {
  const data = urutkanTerbaru(filterTransaksi(daftarTransaksi, jenis));
  const tabel = document.getElementById("tabel-transaksi");
  tabel.innerHTML = "";

  if (data.length === 0) {
    tabel.innerHTML =
      '<tr><td colspan="7" class="text-center text-muted py-4">Belum ada transaksi</td></tr>';
  }

  for (let i = 0; i < data.length; i++) {
    const t = data[i];

    let badge = '<span class="badge bg-success-subtle text-success">Pemasukan</span>';
    if (t.jenis === "pengeluaran") {
      badge = '<span class="badge bg-danger-subtle text-danger">Pengeluaran</span>';
    }

    let tombolDetail = "";
    if (t.detail) {
      tombolDetail = `<a href="${t.detail}" class="btn btn-sm btn-light border">Detail</a>`;
    }

    tabel.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${formatTanggal(t.tanggal)}</td>
        <td class="fw-semibold">${t.keterangan}</td>
        <td>${badge}</td>
        <td>${t.kategori}</td>
        <td class="text-end fw-semibold">${formatRupiah(t.nominal)}</td>
        <td class="text-center">
          ${tombolDetail}
          <button class="btn btn-sm btn-outline-danger btn-hapus" data-id="${t.id}">Hapus</button>
        </td>
      </tr>`;
  }

  document.getElementById("jumlah-tampil").textContent =
    "Menampilkan " + data.length + " transaksi";
}

$(document).ready(function () {
  if ($("#total-pemasukan").length) {
    renderDashboard();

    $("#btn-saldo").on("click", function () {
      const tombol = $(this);

      if ($(".nominal-saldo").is(":visible")) {
        $(".nominal-saldo").fadeOut(400).promise().done(function () {
          $(".nominal-tersembunyi").fadeIn(400);
        });
        tombol.text("Tampilkan Saldo");
      } else {
        $(".nominal-tersembunyi").fadeOut(400).promise().done(function () {
          $(".nominal-saldo").fadeIn(400);
        });
        tombol.text("Sembunyikan Saldo");
      }
    });
  }

  if ($("#tabel-transaksi").length) {
    let filterAktif = "semua";
    renderTabelTransaksi(filterAktif);

    $(".btn-filter").on("click", function () {
      filterAktif = $(this).data("jenis");
      $(".btn-filter").removeClass("active");
      $(this).addClass("active");

      $("#tabel-transaksi").hide();
      renderTabelTransaksi(filterAktif);
      $("#tabel-transaksi").fadeIn(400);
    });

    $("#tabel-transaksi").on("click", ".btn-hapus", function () {
      const id = $(this).data("id");
      const baris = $(this).closest("tr");

      baris.fadeOut(400, function () {
        daftarTransaksi = daftarTransaksi.filter((t) => t.id !== id);
        simpanData();
        renderTabelTransaksi(filterAktif);
      });
    });

    $("#btn-reset-data").on("click", function () {
      daftarTransaksi = [...dataAwal];
      simpanData();
      renderTabelTransaksi(filterAktif);
      $("#tabel-transaksi").hide().fadeIn(400);
    });
  }

  if ($("#form-transaksi").length) {
    $("#form-transaksi").on("submit", function (event) {
      event.preventDefault();

      const tanggal = $("#tanggal").val();
      const nominal = $("#nominal").val();
      const keterangan = $("#keterangan").val().trim();
      const jenis = $("input[name='jenis']:checked").val();
      const kategori = $("#kategori").val();

      const kosong = [];
      if (tanggal === "") kosong.push("Tanggal");
      if (nominal === "" || Number(nominal) <= 0) kosong.push("Nominal");
      if (keterangan === "") kosong.push("Keterangan");
      if (jenis === undefined) kosong.push("Jenis Transaksi");
      if (kategori === "") kosong.push("Kategori");

      $("#pesan-sukses").hide();

      if (kosong.length > 0) {
        $("#isi-pesan-error").text(kosong.join(", "));
        $("#pesan-error").slideDown(300);
        return;
      }

      $("#pesan-error").slideUp(200);

      const transaksiBaru = {
        id: Date.now(),
        tanggal: tanggal,
        keterangan: keterangan,
        jenis: jenis,
        kategori: $("#kategori option:selected").text().trim(),
        nominal: Number(nominal),
      };

      daftarTransaksi.push(transaksiBaru);
      simpanData();

      $("#isi-pesan-sukses").text(
        `${transaksiBaru.keterangan} (${formatRupiah(transaksiBaru.nominal)})`
      );
      $("#pesan-sukses").fadeIn(400);
      this.reset();
    });

    $("#btn-reset-form").on("click", function () {
      $("#pesan-error").slideUp(200);
      $("#pesan-sukses").fadeOut(200);
    });
  }
});
