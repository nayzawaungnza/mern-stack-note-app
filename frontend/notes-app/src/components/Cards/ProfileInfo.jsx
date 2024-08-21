import React from "react";
import { getInitials } from "../../utils/helper";

export default function ProfileInfo({ userInfo, onLogout }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full text-slate-950 bg-slate-100 flex items-center justify-center ">
        {getInitials(userInfo?.fullName)}
      </div>
      <div>
        <p className="text-sm font-medium">{userInfo?.fullName}</p>
        <button
          className="text-sm font-medium text-slate-700 underline"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
