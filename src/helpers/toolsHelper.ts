// sweetalert2 dimuat secara lazy agar tidak membebani bundle awal (Reduce unused JavaScript)
const loadSwal = async () => (await import("sweetalert2")).default;

export const showSuccessDialog = async (text: string, title = "Berhasil") =>
  (await loadSwal()).fire({ icon: "success", title, text, timer: 1500, showConfirmButton: false });

export const showErrorDialog = async (text: string, title = "Gagal") =>
  (await loadSwal()).fire({ icon: "error", title, text });

export const showConfirmDialog = async (text: string, title = "Apakah kamu yakin?"): Promise<boolean> => {
  const Swal = await loadSwal();
  const result = await Swal.fire({
    icon: "warning", title, text,
    showCancelButton: true, confirmButtonText: "Ya", cancelButtonText: "Batal",
    confirmButtonColor: "#047857",
  });
  return result.isConfirmed;
};

export const formatRupiah = (value: number | string): string =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value) || 0);

export const formatDate = (value?: string | null): string => {
  if (!value) return "-";
  const date = new Date(String(value).includes("T") ? value : String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

export const photoUrl = (photo?: string | null): string => {
  if (!photo) return "";
  if (/^https?:\/\//.test(photo)) return photo;
  return `${new URL(DELCOM_BASEURL).origin}/${photo.replace(/^\//, "")}`;
};
