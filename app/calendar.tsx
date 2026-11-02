import React from "react";
import { Shell } from "../src/components/Shell";
import { Calendar } from "../src/screens/Calendar";
import { useStore } from "../src/storage/store";
export default function Page() {
  const { data } = useStore();
  return <Shell>{data.profile && <Calendar />}</Shell>;
}
