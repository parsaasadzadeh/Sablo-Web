"use client";
import { useEffect, useState } from "react";
import { CreditCard, Ban, X } from "lucide-react";

export default function PayInstallmentModal({ visible, onClose, onConfirm, cards = [] }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 border border-[#EDE8DC] shadow-xl">
        <div className="w-10 h-1 bg-[#EDE8DC] rounded-full mx-auto mb-4 sm:hidden" />
        
        <div className="flex items-center justify-between mb-1">
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={18} color="#8A8273" />
          </button>
          <h3 className="text-sm font-bold text-[#26241F]">پرداخت از کدام کارت؟</h3>
        </div>
        <p className="text-[11px] text-[#8A8273] text-right mb-4">
          یک کارت رو انتخاب کن، یا بدون ثبت کارت پرداخت رو تایید کن
        </p>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {cards.map((card) => (
            <button
              key={card._id}
              onClick={() => onConfirm(card._id)}
              className="w-full flex flex-row-reverse items-center gap-3 px-4 py-3 rounded-xl border border-[#EDE8DC] hover:bg-[#F7F3EB] transition-colors text-right"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: card.color + "22" }}
              >
                {card.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#26241F]">{card.name}</p>
                {card.description && (
                  <p className="text-[11px] text-[#8A8273]">{card.description}</p>
                )}
              </div>
            </button>
          ))}

          {/* بدون کارت */}
          <button
            onClick={() => onConfirm(null)}
            className="w-full flex flex-row-reverse items-center gap-3 px-4 py-3 rounded-xl border border-[#EDE8DC] hover:bg-[#F7F3EB] transition-colors text-right"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#F7F3EB] flex-shrink-0">
              <Ban size={16} color="#8A8273" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#26241F]">بدون ثبت کارت</p>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-[#F3F4F6] text-[#26241F] font-semibold rounded-xl py-2.5 text-xs"
        >
          انصراف
        </button>
      </div>
    </div>
  );
}
