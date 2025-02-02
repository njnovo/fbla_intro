import Head from "next/head";
import Link from "next/link";
import { Header } from "~/components/header";

import { api } from "~/utils/api";

export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });

  return (
  <>
  <Header />
  <div>
    <h1>In progress, trust...</h1>
  </div>
  </>
  
  );
}
