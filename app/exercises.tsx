import React from "react";
import { Shell } from "../src/components/Shell";
import { Exercises } from "../src/screens/Exercises";
import { useStore } from "../src/storage/store";
export default function Page() {
  const { data } = useStore();
  return <Shell>{data.profile && <Exercises />}</Shell>;
}
