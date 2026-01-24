"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiChevronLeft,
  FiCoffee,
  FiPrinter,
  FiCornerUpLeft,
  FiActivity,
  FiCheckCircle,
  FiPackage,
} from "react-icons/fi";
import Swal from "sweetalert2";

export default function TransactionDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const res = await fetch(`/api/transaksi/${id}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setTransaction(data.data);

        // Set default payment method jika sudah ada di database
        if (
          data.data.metode_pembayaran &&
          data.data.metode_pembayaran !== "belum_bayar"
        ) {
          setPaymentMethod(data.data.metode_pembayaran);
        }
      } catch (err) {
        console.error("Error:", err);
        Swal.fire("Error", "Gagal memuat data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [id]);

  // --- FUNGSI 1: BAYAR DULU ---
  const handlePayment = async () => {
    if (!paymentMethod) {
      return Swal.fire({
        icon: "warning",
        title: "Pilih Metode Pembayaran",
        text: "Silakan pilih QRIS atau Tunai.",
        confirmButtonColor: "#E6A05B",
      });
    }

    try {
      // Kita update metode pembayaran saja, status pesanan TETAP (misal: menunggu)
      const res = await fetch(`/api/transaksi/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status_pesanan: transaction.status_pesanan, // Status tidak berubah
          metode_pembayaran: paymentMethod,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTransaction((prev) => ({
          ...prev,
          metode_pembayaran: paymentMethod,
        }));
        Swal.fire({
          icon: "success",
          title: "Pembayaran Diterima!",
          text: "Silakan lanjutkan proses pesanan.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      Swal.fire("Gagal", err.message, "error");
    }
  };

  // --- FUNGSI 2: UPDATE STATUS (PROSES -> SIAP -> SELESAI) ---
  const updateStatus = async (newStatus) => {
    try {
      const res = await fetch(`/api/transaksi/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status_pesanan: newStatus,
          metode_pembayaran: transaction.metode_pembayaran, // Kirim metode bayar yg sudah ada
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTransaction((prev) => ({ ...prev, status_pesanan: newStatus }));

        let message = "";
        if (newStatus === "diproses") message = "Pesanan mulai diproses";
        if (newStatus === "siap") message = "Pesanan siap disajikan";
        if (newStatus === "selesai") message = "Pesanan selesai & ditutup";

        Swal.fire({
          icon: "success",
          title: "Status Diperbarui",
          text: message,
          timer: 1000,
          showConfirmButton: false,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      Swal.fire("Gagal", err.message, "error");
    }
  };

  const parseLokasi = (catatan) => {
    if (!catatan) return "-";
    // if (catatan.toLowerCase().includes("meja")) {
    //   const parts = catatan.split(":");
    //   if (parts.length > 1) return `Meja : ${parts[1].trim()}`;
    // }
    return catatan;
  };

  const handlePrint = () => window.print();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] text-gray-500">
        Memuat data...
      </div>
    );
  if (!transaction)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE]">
        Transaksi tidak ditemukan
      </div>
    );

  const totalBayar = Number(transaction.total_bayar) || 0;
  const pajak = Number(transaction.pajak) || 0;
  const totalItem = totalBayar - pajak;

  // Cek Status Pembayaran
  const isPaid =
    transaction.metode_pembayaran &&
    transaction.metode_pembayaran !== "belum_bayar";

  // =================================================================================
  // TAMPILAN PROSES PESANAN (Menunggu -> Bayar -> Proses -> Siap -> Selesai)
  // =================================================================================
  if (transaction.status_pesanan !== "selesai") {
    return (
      <div className="min-h-screen bg-[#F4F7FE] text-[#2c2c2c] font-sans pb-10">
        <header className="bg-[#E6A05B] px-8 py-4 flex justify-between items-center shadow-sm">
          <div />
          <div className="text-sm font-semibold text-white">Halo, Admin</div>
        </header>

        <main className="px-8 py-6 max-w-[1600px] mx-auto">
          <div className="bg-white p-4 rounded-md shadow-sm mb-6 border-l-4 border-orange-400">
            <h1 className="text-xl font-bold text-gray-800">Dashboard Kasir</h1>
          </div>

          <button
            onClick={() => router.back()}
            className="mb-6 bg-[#EDA05D] hover:bg-orange-600 text-white px-6 py-2 rounded shadow-sm flex items-center font-medium transition-colors"
          >
            <FiChevronLeft className="mr-2" /> Kembali
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* KOLOM KIRI: DETAIL ITEM */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">
                  Detail Pelanggan
                </h2>
                <div className="flex items-center gap-8">
                  <div>
                    <span className="block text-sm text-gray-500">
                      Nomor Antrian
                    </span>
                    <span className="text-3xl font-bold text-[#2D3E50]">
                      {transaction.nomor_antrian}
                    </span>
                  </div>
                  {/* <div>
                    <span className="block text-sm text-gray-500">Lokasi</span>
                    <span className="text-xl font-bold text-gray-700">
                      {parseLokasi(transaction.catatan_umum)}
                    </span>
                  </div> */}
                  <div>
                    <span className="block text-sm text-gray-500">
                      Status Pesanan
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase inline-block mt-1 ${
                        transaction.status_pesanan === "menunggu"
                          ? "bg-yellow-100 text-yellow-600"
                          : transaction.status_pesanan === "diproses"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-green-100 text-green-600"
                      }`}
                    >
                      {transaction.status_pesanan}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#4A5568] mb-4 pl-1">
                  Daftar Menu
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {transaction.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4"
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
                        {item.foto_url ? (
                          <img
                            src={`/images/${item.foto_url}`}
                            alt={item.nama_menu}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-orange-50 flex items-center justify-center text-orange-400">
                            <FiCoffee />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 text-lg truncate">
                          {item.nama_menu}
                        </h4>
                        <p className="text-gray-400 text-xs">
                          Rp{" "}
                          {new Intl.NumberFormat("id-ID").format(
                            item.harga_satuan,
                          )}
                        </p>
                        {item.catatan_item && (
                          <div className="mt-1 p-1 bg-red-50 rounded border border-red-100">
                            <p className="text-[10px] text-red-600 italic">
                              Note: {item.catatan_item}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          Qty
                        </span>
                        <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-600 text-sm">
                          {item.jumlah}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* KOLOM KANAN: PEMBAYARAN & PROSES */}
            <div className="space-y-6">
              {/* CARD 1: PEMBAYARAN (LANGKAH PERTAMA) */}
              <div
                className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${isPaid ? "border-green-500" : "border-orange-500"}`}
              >
                <h4 className="font-bold text-gray-700 text-lg mb-4 flex justify-between items-center">
                  Pembayaran
                  {isPaid && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                      LUNAS
                    </span>
                  )}
                </h4>

                <div className="space-y-3 mb-6 border-b border-gray-100 pb-4">
                  <div className="flex justify-between text-sm">
                    <span>Total Item</span>
                    <span className="font-bold text-gray-800">
                      Rp {new Intl.NumberFormat("id-ID").format(totalItem)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Bayar</span>
                    <span className="text-orange-600">
                      Rp {new Intl.NumberFormat("id-ID").format(totalBayar)}
                    </span>
                  </div>
                </div>

                {!isPaid ? (
                  <>
                    <div className="flex gap-3 mb-4">
                      <button
                        onClick={() => setPaymentMethod("qris")}
                        className={`flex-1 py-3 rounded-lg font-bold text-white transition-all shadow-md transform active:scale-95 ${
                          paymentMethod === "qris"
                            ? "bg-green-600 ring-2 ring-offset-2 ring-green-500 scale-105"
                            : "bg-gray-400 hover:bg-gray-500"
                        }`}
                      >
                        QRIS
                      </button>
                      <button
                        onClick={() => setPaymentMethod("tunai")}
                        className={`flex-1 py-3 rounded-lg font-bold text-white transition-all shadow-md transform active:scale-95 ${
                          paymentMethod === "tunai"
                            ? "bg-green-600 ring-2 ring-offset-2 ring-green-500 scale-105"
                            : "bg-gray-400 hover:bg-gray-500"
                        }`}
                      >
                        Tunai
                      </button>
                    </div>
                    <button
                      onClick={handlePayment}
                      className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 rounded-lg shadow-md transition-all active:scale-95"
                    >
                      Konfirmasi Pembayaran
                    </button>
                  </>
                ) : (
                  <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200">
                    <p className="font-bold text-green-700 flex items-center justify-center gap-2">
                      <FiCheckCircle /> Pembayaran Selesai (
                      {transaction.metode_pembayaran.toUpperCase()})
                    </p>
                  </div>
                )}
              </div>

              {/* CARD 2: PROSES PESANAN (HANYA AKTIF SETELAH BAYAR) */}
              <div
                className={`bg-white p-6 rounded-xl shadow-sm transition-all duration-300 ${!isPaid ? "opacity-50 pointer-events-none grayscale" : ""}`}
              >
                <h4 className="font-bold text-gray-700 text-lg mb-4">
                  Proses Dapur
                </h4>

                {!isPaid && (
                  <div className="bg-yellow-50 text-yellow-700 text-xs p-2 rounded mb-4 text-center font-bold">
                    ⚠️ Selesaikan pembayaran untuk memproses pesanan
                  </div>
                )}

                <div className="space-y-3">
                  {/* TOMBOL 1: MULAI PROSES */}
                  {transaction.status_pesanan === "menunggu" && (
                    <button
                      onClick={() => updateStatus("diproses")}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2"
                    >
                      <FiActivity /> Mulai Proses Pesanan
                    </button>
                  )}

                  {/* TOMBOL 2: PESANAN SIAP */}
                  {transaction.status_pesanan === "diproses" && (
                    <button
                      onClick={() => updateStatus("siap")}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2"
                    >
                      <FiCoffee /> Pesanan Siap Disajikan
                    </button>
                  )}

                  {/* TOMBOL 3: SELESAI / DIAMBIL */}
                  {transaction.status_pesanan === "siap" && (
                    <button
                      onClick={() => updateStatus("selesai")}
                      className="w-full bg-gray-800 hover:bg-black text-white py-3 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2"
                    >
                      <FiPackage /> Pesanan Diambil & Selesai
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =================================================================================
  // TAMPILAN 2: STATUS SELESAI (DETAIL STRUK) - SAMA SEPERTI SEBELUMNYA
  // =================================================================================
  return (
    <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center py-10">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-10 border-t-[10px] border-[#E6A05B]">
        <h2 className="text-center text-xl font-bold mb-8 uppercase">
          Struk Pembayaran Selesai
        </h2>
        <div className="flex justify-between mb-6 bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
          <div className="font-bold">Antrian: {transaction.nomor_antrian}</div>
          <div className="font-bold text-gray-500">
            {new Date().toLocaleDateString("id-ID")}
          </div>
        </div>
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 text-left text-gray-600">
              <th className="pb-2">Menu</th>
              <th className="pb-2 text-center">Qty</th>
              <th className="pb-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {transaction.items?.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-3 font-medium">{item.nama_menu}</td>
                <td className="py-3 text-center">{item.jumlah}</td>
                <td className="py-3 text-right">
                  Rp {(item.harga_satuan * item.jumlah).toLocaleString()}
                </td>
              </tr>
            ))}
            <tr className="font-bold text-lg">
              <td colSpan="2" className="pt-6">
                TOTAL BAYAR ({transaction.metode_pembayaran?.toUpperCase()})
              </td>
              <td className="pt-6 text-right text-orange-600">
                Rp {totalBayar.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="flex justify-center gap-4 no-print">
          <button
            onClick={handlePrint}
            className="bg-gray-800 text-white px-6 py-2 rounded-md font-bold flex items-center gap-2"
          >
            <FiPrinter /> Cetak
          </button>
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="bg-orange-400 text-white px-6 py-2 rounded-md font-bold flex items-center gap-2"
          >
            <FiCornerUpLeft /> Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
