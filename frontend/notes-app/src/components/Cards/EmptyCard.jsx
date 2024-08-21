import React from "react";

export default function EmptyCard({ imgSrc, message }) {
  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <img className="w-60" src={imgSrc} alt="Empty Card" />
      <p className="w-1/2 text-sm font-medium text-slate-700 text-center leading-7 mt-7">
        {message}
      </p>
    </div>
  );
}
