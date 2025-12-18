"use client";
import React, { useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function VerifyOtpPage() {
  const router = useRouter();
  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }
   const email = localStorage.getItem("NextHubEmail")


    try {
      setLoading(true);

      const { data } = await axios.post(
        "http://localhost:5000/api/v1/verify-otp",
        { email, otp: otpCode },
        { withCredentials: true }
      );

      toast.success(data.message);
      router.push("/");

    } catch (error) {
      toast.error(error?.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Verify OTP
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <div className="flex justify-between gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium cursor-pointer transition
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-brand hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium"
            }`}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
}
