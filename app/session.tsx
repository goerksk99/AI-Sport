import React from "react";
import { Shell } from "../src/components/Shell";
import { Session } from "../src/components/Session";
import { useStore } from "../src/storage/store";
export default function Page() {
  const { data } = useStore();
  return <Shell>{data.profile && <Session />}</Shell>;
}
