"use client";

import { useCallback, useEffect, useState } from "react";

import { getVouchers, type Voucher } from "@/lib/accounting/voucher-storage";

export const VOUCHERS_UPDATED_EVENT = "ledgerai-vouchers-updated";

export function useVoucherData() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isReady, setIsReady] = useState(false);

  const refresh = useCallback(() => {
    setVouchers(getVouchers());
    setIsReady(true);
  }, []);

  useEffect(() => {
    refresh();

    const handleUpdate = () => refresh();

    window.addEventListener("focus", handleUpdate);
    window.addEventListener(VOUCHERS_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("focus", handleUpdate);
      window.removeEventListener(VOUCHERS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [refresh]);

  return { vouchers, isReady, refresh };
}
