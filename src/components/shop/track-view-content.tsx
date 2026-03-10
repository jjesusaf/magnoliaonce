"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/tracking";

type Props = {
  id: string;
  name: string;
  price: number;
  currency: string;
  category?: string;
};

export function TrackViewContent(props: Props) {
  useEffect(() => {
    trackViewContent(props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.id]);

  return null;
}
