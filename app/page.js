"use client";
import React from "react";
import { useAuth } from "./context/authContext";

export default function Page() {
  const { user, logOutUser, loading, isAuth } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium">Loading...</p>
      </div>
    );
  }
  console.log(user)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Simple Dashboard
        </h2>

        {isAuth ? (
          <>
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-500">Logged in as</p>
              <p className="text-lg font-medium text-gray-800">
                {user?.email}
              </p>
            </div>

            <button
              onClick={logOutUser}
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <p className="text-center text-gray-600">
            You are not authenticated
          </p>
        )}
      </div>
    </div>
  );
}
