import React from "react";
import { Shell } from "../src/components/Shell";
import { Coach } from "../src/components/screens";
import { useStore } from "../src/storage/store";
export default function Page() {
  const { data } = useStore();
  return <Shell>{data.profile && <Coach />}</Shell>;
}
