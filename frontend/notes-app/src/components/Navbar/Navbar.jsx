import React, { useState } from "react";
import ProfileInfo from "../Cards/ProfileInfo";
import { Navigate, useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";

export default function Navbar({ userInfo, onSearch, onClearSearch }) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  const handleSearch = () => {
    if (searchQuery) {
      onSearch(searchQuery);
    } else {
      onSearch(null);
    }
  };
  const handleClearSearch = () => {
    setSearchQuery("");
    onClearSearch();
  };
  return (
    <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow">
      <h2 className="text-xl font-medium text-black py-2">Notes</h2>
      <SearchBar
        value={searchQuery}
        handleSearch={handleSearch}
        handleClearSearch={handleClearSearch}
        onChange={({ target }) => setSearchQuery(target.value)}
      />
      <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
    </div>
  );
}
