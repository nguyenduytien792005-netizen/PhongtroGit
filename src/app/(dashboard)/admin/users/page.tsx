"use client";

import { useEffect, useState } from "react";

interface UserPending {
  _id: string;
  ten: string;
  email: string;
  soDienThoai?: string;
  vaiTro: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserPending[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. Tải danh sách tài khoản đang chờ duyệt khi vào trang
  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => {
        if (res.status === 401) throw new Error("Bạn không có quyền truy cập (Yêu cầu tài khoản Admin)!");
        if (!res.ok) throw new Error("Không thể tải danh sách tài khoản.");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 2. Xử lý khi Admin nhấn nút "Duyệt cấp quyền"
  const handleApprove = async (userId: string) => {
    const confirmDuyet = confirm("Bạn có chắc chắn muốn phê duyệt tài khoản này hoạt động không?");
    if (!confirmDuyet) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Kích hoạt tài khoản thành công!");
        // Loại bỏ thành viên vừa duyệt khỏi danh sách hiển thị trên giao diện
        setUsers(users.filter((u) => u._id !== userId));
      } else {
        alert(result.error || "Có lỗi xảy ra khi duyệt.");
      }
    } catch (err) {
      alert("Lỗi kết nối hệ thống.");
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Đang tải danh sách tài khoản chờ duyệt...</div>;
  if (error) return <div style={{ padding: "20px", color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "20px", color: "#1e293b" }}>
        Danh sách tài khoản chờ duyệt hệ thống 🚪
      </h1>

      {users.length === 0 ? (
        <p style={{ color: "#64748b", fontStyle: "italic" }}>Hiện tại không có tài khoản nào đăng ký mới đang chờ phê duyệt.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {users.map((user) => (
            <div
              key={user._id}
              style={{
                border: "1px solid #e2e8f0",
                padding: "16px",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "span-between",
                alignItems: "center",
                backgroundColor: "#f8fafc",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 6px 0", fontWeight: "600", color: "#0f172a" }}>
                  {user.ten || "Chưa cập nhật tên"}
                </h3>
                <p style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#475569" }}>Email: {user.email}</p>
                <p style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#475569" }}>SĐT: {user.soDienThoai || "Không có"}</p>
                <span style={{ fontSize: "12px", backgroundColor: "#e2e8f0", padding: "2px 8px", borderRadius: "4px", color: "#334155", fontWeight: "500" }}>
                  Vai trò đăng ký: {user.vaiTro}
                </span>
              </div>

              <button
                onClick={() => handleApprove(user._id)}
                style={{
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px"
                }}
              >
                Duyệt cấp quyền
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}